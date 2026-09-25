<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ChangePasswordRequest;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RefreshTokenRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\ResendVerificationEmailRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Http\Resources\AuthResource;
use App\Http\Resources\MessageResource;
use App\Http\Resources\TokenResource;
use App\Http\Resources\UserResource;
use App\Models\User;
use GuzzleHttp\Psr7\Response as Psr7Response;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;
use Laravel\Passport\Http\Controllers\ConvertsPsrResponses;
use League\OAuth2\Server\AuthorizationServer;
use League\OAuth2\Server\Exception\OAuthServerException;
use OpenApi\Attributes as OA;
use Psr\Http\Message\ServerRequestInterface;

class AuthController extends Controller
{
    use ConvertsPsrResponses;

    #[OA\Post(
        path: '/api/v1/auth/user/login',
        summary: 'Login User',
        operationId: 'user.login',
        tags: ['Auth'],
        requestBody: new OA\RequestBody(
            required: true,
            content: [
                new OA\MediaType(
                    mediaType: 'application/json',
                    schema: new OA\Schema(
                        type: LoginRequest::class
                    )
                ),
            ]
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'Login Success',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'data', type: AuthResource::class),
                    ]
                )
            ),
            new OA\Response(response: 422, description: 'Validation or Authentication Error'),
        ]
    )]
    public function login(LoginRequest $request): AuthResource
    {
        $user = User::query()->where('email', $request->post('email'))->first();

        abort_if($user === null, 404, 'User not found');

        try {
            $response = User::generatePasswordGrantToken(
                $request->post('email'),
                $request->post('password')
            );
        } catch (OAuthServerException $e) {
            throw ValidationException::withMessages([
                'email' => [$e->getMessage()],
            ]);
        }

        event(new Login('api', $user, true));

        return AuthResource::make([
            'token' => $response,
            'user' => $user,
        ]);
    }

    #[OA\Post(
        path: '/api/v1/auth/user/refresh-token',
        summary: 'Refresh Token',
        operationId: 'user.refresh',
        tags: ['Auth'],
        requestBody: new OA\RequestBody(
            required: true,
            content: [
                new OA\MediaType(
                    mediaType: 'application/json',
                    schema: new OA\Schema(
                        type: RefreshTokenRequest::class
                    )
                ),
            ]
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'Token Refreshed',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'data', type: TokenResource::class),
                    ]
                )
            ),
            new OA\Response(response: 422, description: 'Invalid Refresh Token'),
        ]
    )]
    public function refreshToken(RefreshTokenRequest $request): TokenResource
    {
        ['client_id' => $clientId, 'client_secret' => $clientSecret] = User::resolvePasswordClient();

        if (!$clientId || !$clientSecret) {
            throw ValidationException::withMessages([
                'refresh_token' => ['OAuth password client is not configured.'],
            ]);
        }

        $requestData = [
            'grant_type' => 'refresh_token',
            'client_id' => $clientId,
            'client_secret' => $clientSecret,
            'refresh_token' => $request->post('refresh_token'),
            'scope' => '',
        ];

        $serverRequest = app(ServerRequestInterface::class)->withParsedBody($requestData);

        try {
            $response = $this->convertResponse(
                app(AuthorizationServer::class)->respondToAccessTokenRequest($serverRequest, new Psr7Response)
            );
            $tokenData = json_decode($response->getContent(), false, 512, JSON_THROW_ON_ERROR);
        } catch (OAuthServerException $e) {
            throw ValidationException::withMessages([
                'refresh_token' => [$e->getMessage()],
            ]);
        }

        return TokenResource::make($tokenData);
    }

    #[OA\Post(
        path: '/api/v1/auth/user/register',
        summary: 'Register New User',
        operationId: 'user.register',
        tags: ['Auth'],
        requestBody: new OA\RequestBody(
            required: true,
            content: [
                new OA\MediaType(
                    mediaType: 'application/json',
                    schema: new OA\Schema(
                        type: RegisterRequest::class
                    )
                ),
            ]
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'Registration Success',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'data', type: UserResource::class),
                    ]
                )
            ),
            new OA\Response(response: 422, description: 'Validation Error'),
        ]
    )]
    public function register(RegisterRequest $request): UserResource
    {
        $registerData = $request->safe()->all();

        /** @var User $user */
        $user = DB::transaction(function () use ($registerData) {
            $user = new User;
            $user->fill($registerData);
            $user->save();

            return $user;
        });

        event(new Registered($user));

        return UserResource::make($user);
    }

    #[OA\Post(
        path: '/api/v1/auth/user/resend-verification-email',
        summary: 'Resend Verification Email',
        operationId: 'user.resend-verification-email',
        tags: ['Auth'],
        requestBody: new OA\RequestBody(
            required: true,
            content: [
                new OA\MediaType(
                    mediaType: 'application/json',
                    schema: new OA\Schema(
                        type: ResendVerificationEmailRequest::class
                    )
                ),
            ]
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'Verification Link Sent',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'data', type: MessageResource::class),
                    ]
                )
            ),
            new OA\Response(response: 422, description: 'Validation Error'),
        ]
    )]
    public function resendVerificationEmail(ResendVerificationEmailRequest $request): MessageResource
    {
        $user = User::query()->where('email', $request->post('email'))->first();

        if ($user === null || $user->hasVerifiedEmail()) {
            throw ValidationException::withMessages([
                'email' => ['Your email has already been verified or account does not exist.'],
            ]);
        }

        $user->sendEmailVerificationNotification();

        return MessageResource::make('Verification link sent!');
    }

    #[OA\Post(
        path: '/api/v1/auth/user/email/verify/{id}/{hash}',
        summary: 'Verify Email',
        operationId: 'user.verify-email',
        tags: ['Auth'],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'hash', in: 'path', required: true, schema: new OA\Schema(type: 'string')),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Email Verified',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'data', type: MessageResource::class),
                    ]
                )
            ),
            new OA\Response(response: 422, description: 'Invalid Token'),
        ]
    )]
    public function verifyEmail(Request $request, string $id, string $hash): MessageResource
    {
        $user = User::query()->find($id);

        if ($user === null || !hash_equals((string) $user->getKey(), $id) || !hash_equals(sha1($user->getEmailForVerification()), $hash)) {
            throw ValidationException::withMessages([
                'token' => ['Invalid verification token.'],
            ]);
        }

        if (!$user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();
            event(new Verified($user));
        }

        return MessageResource::make('Your email has been verified.');
    }

    #[OA\Post(
        path: '/api/v1/auth/user/forgot-password',
        summary: 'Forgot Password',
        operationId: 'user.forgot-password',
        tags: ['Auth'],
        requestBody: new OA\RequestBody(
            required: true,
            content: [
                new OA\MediaType(
                    mediaType: 'application/json',
                    schema: new OA\Schema(
                        type: ForgotPasswordRequest::class
                    )
                ),
            ]
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'Password reset link emailed',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'data', type: MessageResource::class),
                    ]
                )
            ),
        ]
    )]
    public function forgotPassword(ForgotPasswordRequest $request): MessageResource
    {
        $user = User::query()->where('email', $request->post('email'))->first();

        if ($user !== null) {
            $token = Password::createToken($user);
            $user->sendPasswordResetNotification($token);
        }

        return MessageResource::make('We have e-mailed your password reset link!');
    }

    #[OA\Post(
        path: '/api/v1/auth/user/reset-password',
        summary: 'Reset Password',
        operationId: 'user.reset-password',
        tags: ['Auth'],
        requestBody: new OA\RequestBody(
            required: true,
            content: [
                new OA\MediaType(
                    mediaType: 'application/json',
                    schema: new OA\Schema(
                        type: ResetPasswordRequest::class
                    )
                ),
            ]
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'Password Reset Success',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'data', type: MessageResource::class),
                    ]
                )
            ),
            new OA\Response(response: 422, description: 'Validation Error'),
        ]
    )]
    public function resetPassword(ResetPasswordRequest $request): MessageResource
    {
        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (User $user, string $password) {
                $user->forceFill(['password' => $password]);
                $user->save();

                event(new PasswordReset($user));
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            throw ValidationException::withMessages([
                'email' => [__($status)],
            ]);
        }

        return MessageResource::make('Your password has been reset!');
    }

    #[OA\Put(
        path: '/api/v1/auth/user/change-password',
        summary: 'Change Password',
        operationId: 'user.change-password',
        tags: ['Auth'],
        security: [['bearerAuth' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: [
                new OA\MediaType(
                    mediaType: 'application/json',
                    schema: new OA\Schema(
                        type: ChangePasswordRequest::class
                    )
                ),
            ]
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'Password Changed',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'data', type: MessageResource::class),
                    ]
                )
            ),
            new OA\Response(response: 422, description: 'Validation Error'),
        ]
    )]
    public function changePassword(ChangePasswordRequest $request): MessageResource
    {
        /** @var User $user */
        $user = $request->user('api');

        if (!Hash::check($request->post('current_password'), $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Current password does not match.'],
            ]);
        }

        $user->forceFill(['password' => $request->post('password')]);
        $user->save();

        return MessageResource::make('Password changed successfully!');
    }

    #[OA\Post(
        path: '/api/v1/auth/user/logout',
        summary: 'Logout',
        operationId: 'user.logout',
        tags: ['Auth'],
        security: [['bearerAuth' => []]],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Logout Success',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'data', type: MessageResource::class),
                    ]
                )
            ),
        ]
    )]
    public function logout(Request $request): MessageResource
    {
        $request->user('api')?->token()?->revoke();

        return MessageResource::make('Successfully logged out');
    }
}
