<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Resources\AuthResource;
use App\Http\Resources\SocialRedirectResource;
use App\Models\User;
use App\Models\UserSocialConnection;
use Exception;
use GuzzleHttp\Exception\ClientException;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use InvalidArgumentException;
use Laravel\Socialite\Contracts\User as SocialUser;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\AbstractProvider;
use OpenApi\Attributes as OA;

class SocialLoginController extends Controller
{
    /** Supported social login providers. */
    private const SUPPORTED_DRIVERS = ['google', 'facebook', 'github'];

    /** Map driver => env key used to detect whether the provider is configured. */
    private const DRIVER_ENV_MAP = [
        'google' => 'GOOGLE_CLIENT_ID',
        'facebook' => 'FACEBOOK_CLIENT_ID',
        'github' => 'GITHUB_CLIENT_ID',
    ];

    /** Labels and icons for frontend rendering. */
    private const DRIVER_META = [
        'google' => ['label' => 'Google', 'icon' => 'google'],
        'facebook' => ['label' => 'Facebook', 'icon' => 'facebook'],
        'github' => ['label' => 'GitHub', 'icon' => 'github'],
    ];

    private function validateDriver(string $driver): void
    {
        if (!in_array($driver, self::SUPPORTED_DRIVERS, true)) {
            throw ValidationException::withMessages([
                'driver' => ['Unsupported social provider.'],
            ]);
        }
    }

    /**
     * List configured social providers so the frontend can render buttons dynamically.
     */
    #[OA\Get(
        path: '/api/v1/auth/social-providers',
        summary: 'List available social login providers',
        operationId: 'user.social.providers',
        tags: ['Auth'],
        responses: [
            new OA\Response(response: 200, description: 'Available providers'),
        ]
    )]
    public function providers(): JsonResponse
    {
        $available = collect(self::SUPPORTED_DRIVERS)
            ->filter(fn (string $driver) => !empty(env(self::DRIVER_ENV_MAP[$driver])))
            ->map(fn (string $driver) => [
                'driver' => $driver,
                ...self::DRIVER_META[$driver],
            ])
            ->values();

        return response()->json(['data' => $available]);
    }

    #[OA\Get(
        path: '/api/v1/auth/user/social/{driver}/redirect',
        summary: 'Login User with Social Redirect',
        operationId: 'user.social.redirect',
        tags: ['Auth'],
        parameters: [
            new OA\Parameter(
                name: 'driver',
                in: 'path',
                required: true,
                description: 'Social Driver (google, facebook, github)',
                schema: new OA\Schema(type: 'string')
            ),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Redirect URL generated',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'data', type: SocialRedirectResource::class),
                    ]
                )
            ),
            new OA\Response(response: 422, description: 'Provider error'),
        ]
    )]
    public function redirect(string $driver): SocialRedirectResource
    {
        $this->validateDriver($driver);

        try {
            /** @var AbstractProvider $provider */
            $provider = Socialite::driver($driver);
            $redirectUrl = method_exists($provider, 'stateless')
                ? $provider->stateless()->redirect()->getTargetUrl()
                : $provider->redirect()->getTargetUrl();
        } catch (InvalidArgumentException|ClientException $e) {
            throw ValidationException::withMessages([
                'driver' => [$e->getMessage()],
            ]);
        } catch (Exception $e) {
            throw ValidationException::withMessages([
                'driver' => ['Unable to generate redirect URL.'],
            ]);
        }

        return SocialRedirectResource::make([
            'redirect_url' => $redirectUrl,
            'provider' => $driver,
        ]);
    }

    #[OA\Post(
        path: '/api/v1/auth/user/social/{driver}/callback',
        summary: 'Login User with Social Callback',
        operationId: 'user.social.callback',
        tags: ['Auth'],
        parameters: [
            new OA\Parameter(
                name: 'driver',
                in: 'path',
                required: true,
                description: 'Social Driver',
                schema: new OA\Schema(type: 'string')
            ),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Social Login Success',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'data', type: AuthResource::class),
                    ]
                )
            ),
            new OA\Response(response: 422, description: 'Authentication failed'),
        ]
    )]
    public function callback(Request $request, string $driver): AuthResource
    {
        $this->validateDriver($driver);

        try {
            /** @var AbstractProvider $provider */
            $provider = Socialite::driver($driver);
            /** @var SocialUser $socialUser */
            $socialUser = method_exists($provider, 'stateless')
                ? $provider->stateless()->user()
                : $provider->user();
        } catch (InvalidArgumentException|ClientException $e) {
            throw ValidationException::withMessages([
                'driver' => [$e->getMessage()],
            ]);
        } catch (Exception $e) {
            throw ValidationException::withMessages([
                'driver' => ['Social authentication failed.'],
            ]);
        }

        $userSocial = UserSocialConnection::findByProvider($driver, $socialUser->getId());

        if ($userSocial) {
            return $this->loginSocialUser($userSocial->user);
        }

        $user = DB::transaction(function () use ($socialUser, $driver) {
            /** @var User $user */
            $user = User::query()->firstOrCreate(
                ['email' => $socialUser->getEmail()],
                [
                    'name' => $socialUser->getName() ?? $socialUser->getNickname() ?? 'User',
                    'password' => Str::random(24),
                ]
            );

            if (!$user->hasVerifiedEmail()) {
                $user->markEmailAsVerified();
            }

            $user->socialConnections()->create([
                'provider' => $driver,
                'provider_id' => $socialUser->getId(),
                'provider_data' => [
                    'name' => $socialUser->getName(),
                    'email' => $socialUser->getEmail(),
                    'avatar' => $socialUser->getAvatar(),
                    'nickname' => $socialUser->getNickname(),
                ],
            ]);

            if ($user->wasRecentlyCreated) {
                event(new Registered($user));
            }

            return $user;
        });

        return $this->loginSocialUser($user);
    }

    /**
     * Issue a password grant token for a social-login user.
     *
     * Always generates a fresh random password, hashes and stores it,
     * then passes the plaintext to the password grant (since the OAuth
     * server validates via Hash::check against the stored hash).
     */
    private function loginSocialUser(User $user): AuthResource
    {
        event(new Login('api', $user, true));

        $plaintextPassword = Str::random(24);
        $user->forceFill(['password' => $plaintextPassword])->save();

        $tokenResponse = User::generatePasswordGrantToken(
            $user->email,
            $plaintextPassword
        );

        return AuthResource::make([
            'token' => $tokenResponse,
            'user' => $user,
        ]);
    }
}
