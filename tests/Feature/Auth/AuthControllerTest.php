<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Password;
use Laravel\Passport\ClientRepository;
use Laravel\Passport\Passport;
use Tests\TestCase;

class AuthControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('passport:keys');

        $clientRepository = app(ClientRepository::class);
        $client = $clientRepository->createPasswordGrantClient('Testing Client', 'users', true);

        config([
            'auth.providers.users.passport' => [
                'client_id' => $client->id,
                'client_secret' => $client->plainSecret,
            ],
        ]);
    }

    public function test_user_can_register(): void
    {
        $response = $this->postJson('/api/v1/auth/user/register', [
            'name' => 'Test User',
            'email' => 'test_reg_' . uniqid() . '@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'name',
                    'email',
                ],
            ]);
    }

    public function test_register_validation_error(): void
    {
        $response = $this->postJson('/api/v1/auth/user/register', [
            'name' => '',
            'email' => 'invalid-email',
            'password' => '123',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'email', 'password']);
    }

    public function test_user_can_login(): void
    {
        $email = 'test_login_' . uniqid() . '@example.com';
        User::query()->create([
            'name' => 'Login User',
            'email' => $email,
            'password' => 'Password123!',
        ]);

        $response = $this->postJson('/api/v1/auth/user/login', [
            'email' => $email,
            'password' => 'Password123!',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'token' => ['token_type', 'expires_in', 'access_token', 'refresh_token'],
                    'user' => ['id', 'name', 'email'],
                ],
            ]);
    }

    public function test_authenticated_user_can_change_password(): void
    {
        $email = 'test_change_' . uniqid() . '@example.com';
        $user = User::query()->create([
            'name' => 'Change Password User',
            'email' => $email,
            'password' => 'OldPassword123!',
        ]);

        Passport::actingAs($user, ['*'], 'api');

        $response = $this->putJson('/api/v1/auth/user/change-password', [
            'current_password' => 'OldPassword123!',
            'password' => 'NewPassword123!',
            'password_confirmation' => 'NewPassword123!',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'message' => 'Password changed successfully!',
                ],
            ]);
    }

    public function test_user_can_request_forgot_password(): void
    {
        $email = 'test_forgot_' . uniqid() . '@example.com';
        User::query()->create([
            'name' => 'Forgot User',
            'email' => $email,
            'password' => 'Password123!',
        ]);

        $response = $this->postJson('/api/v1/auth/user/forgot-password', [
            'email' => $email,
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'message' => 'We have e-mailed your password reset link!',
                ],
            ]);
    }

    public function test_user_can_reset_password(): void
    {
        $email = 'test_reset_' . uniqid() . '@example.com';
        $user = User::query()->create([
            'name' => 'Reset User',
            'email' => $email,
            'password' => 'OldPassword123!',
        ]);

        $token = Password::createToken($user);

        $response = $this->postJson('/api/v1/auth/user/reset-password', [
            'token' => $token,
            'email' => $email,
            'password' => 'NewPassword123!',
            'password_confirmation' => 'NewPassword123!',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'message' => 'Your password has been reset!',
                ],
            ]);
    }

    public function test_user_can_verify_email(): void
    {
        Event::fake([Verified::class]);

        $email = 'test_verify_' . uniqid() . '@example.com';
        $user = User::query()->create([
            'name' => 'Verify User',
            'email' => $email,
            'password' => 'Password123!',
        ]);

        $hash = sha1($user->getEmailForVerification());

        $response = $this->postJson("/api/v1/auth/user/email/verify/{$user->id}/{$hash}");

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'message' => 'Your email has been verified.',
                ],
            ]);

        $this->assertNotNull($user->fresh()->email_verified_at);
    }

    public function test_user_can_logout(): void
    {
        $email = 'test_logout_' . uniqid() . '@example.com';
        $user = User::query()->create([
            'name' => 'Logout User',
            'email' => $email,
            'password' => 'Password123!',
        ]);

        Passport::actingAs($user, ['*'], 'api');

        $response = $this->postJson('/api/v1/auth/user/logout');

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'message' => 'Successfully logged out',
                ],
            ]);
    }
}
