<?php

namespace Tests\Feature\Auth;

use App\Models\Role;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Laravel\Passport\Passport;
use Modules\Auth\Models\User;
use Tests\TestCase;

class AdminUserControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->artisan('permission:sync');
    }

    protected function admin(): User
    {
        return User::factory()->create(['is_super_admin' => true]);
    }

    protected function makeRole(string $name): Role
    {
        return Role::findOrCreate($name, 'api');
    }

    protected function userManager(): User
    {
        $role = $this->makeRole('user-manager');
        $role->syncPermissions(['users.manage']);

        $user = User::factory()->create();
        $user->assignRole($role);

        return $user;
    }

    public function test_index_requires_authentication(): void
    {
        $this->app['auth']->forgetGuards();

        $this->getJson('/api/v1/admin/users')->assertUnauthorized();
    }

    public function test_index_forbids_non_admin(): void
    {
        Passport::actingAs(User::factory()->create());

        $this->getJson('/api/v1/admin/users')->assertForbidden();
    }

    public function test_index_returns_paginated_users(): void
    {
        Passport::actingAs($this->admin());
        User::factory()->count(3)->create();

        $this->getJson('/api/v1/admin/users')
            ->assertOk()
            ->assertJsonStructure([
                'data' => [
                    ['id', 'name', 'email', 'roles', 'is_super_admin', 'permissions', 'email_verified_at', 'deleted_at', 'created_at', 'updated_at'],
                ],
                'links',
                'meta',
            ]);
    }

    public function test_index_filters_by_search(): void
    {
        Passport::actingAs($this->admin());
        User::factory()->create(['name' => 'Alice Wonderland']);
        User::factory()->create(['name' => 'Bob Builder']);

        $this->getJson('/api/v1/admin/users?search=Alice')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'Alice Wonderland');
    }

    public function test_index_filters_by_role(): void
    {
        Passport::actingAs($this->admin());

        $editor = $this->makeRole('editor');
        $manager = $this->makeRole('manager');

        User::factory()->count(2)->create()->each(fn (User $user) => $user->assignRole($editor));
        User::factory()->count(3)->create()->each(fn (User $user) => $user->assignRole($manager));

        $this->getJson('/api/v1/admin/users?role=editor')
            ->assertOk()
            ->assertJsonCount(2, 'data');
    }

    public function test_index_can_filter_only_trashed(): void
    {
        Passport::actingAs($this->admin());

        User::factory()->create();
        $trashed = User::factory()->create();
        $trashed->delete();

        $this->getJson('/api/v1/admin/users?trashed=only')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $trashed->getKey())
            ->assertJsonPath('data.0.deleted_at', fn ($value) => $value !== null);

        $this->getJson('/api/v1/admin/users')
            ->assertOk()
            ->assertJsonCount(2, 'data');
    }

    public function test_store_creates_user_with_roles(): void
    {
        Passport::actingAs($this->admin());
        $this->makeRole('editor');

        $response = $this->postJson('/api/v1/admin/users', [
            'name' => 'New Admin',
            'email' => 'new_admin@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'roles' => ['editor'],
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.email', 'new_admin@example.com')
            ->assertJsonPath('data.roles', ['editor'])
            ->assertJsonPath('data.is_super_admin', false);

        $user = User::query()->where('email', 'new_admin@example.com')->firstOrFail();
        $this->assertTrue(Hash::check('Password123!', $user->password));
        $this->assertTrue($user->hasRole('editor'));
    }

    public function test_store_can_create_super_admin(): void
    {
        Passport::actingAs($this->admin());

        $this->postJson('/api/v1/admin/users', [
            'name' => 'Root',
            'email' => 'root@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'is_super_admin' => true,
        ])->assertCreated()->assertJsonPath('data.is_super_admin', true);
    }

    public function test_store_validates_unique_email(): void
    {
        Passport::actingAs($this->admin());
        User::factory()->create(['email' => 'taken@example.com']);

        $this->postJson('/api/v1/admin/users', [
            'name' => 'Duplicate',
            'email' => 'taken@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
        ])->assertJsonValidationErrors('email');
    }

    public function test_store_validates_roles_exist(): void
    {
        Passport::actingAs($this->admin());

        $this->postJson('/api/v1/admin/users', [
            'name' => 'Ghost',
            'email' => 'ghost@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'roles' => ['missing-role'],
        ])->assertJsonValidationErrors('roles.0');
    }

    public function test_store_forbids_non_admin(): void
    {
        Passport::actingAs(User::factory()->create());

        $this->postJson('/api/v1/admin/users', [
            'name' => 'Nope',
            'email' => 'nope@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
        ])->assertForbidden();
    }

    public function test_store_forbids_non_super_admin_granting_super_admin(): void
    {
        Passport::actingAs($this->userManager());

        $this->postJson('/api/v1/admin/users', [
            'name' => 'Sneaky',
            'email' => 'sneaky@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'is_super_admin' => true,
        ])->assertJsonValidationErrors('is_super_admin');
    }

    public function test_user_manager_can_create_regular_user(): void
    {
        Passport::actingAs($this->userManager());

        $this->postJson('/api/v1/admin/users', [
            'name' => 'Regular',
            'email' => 'regular@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'is_super_admin' => false,
        ])->assertCreated();
    }

    public function test_update_forbids_non_super_admin_changing_super_admin(): void
    {
        Passport::actingAs($this->userManager());
        $target = User::factory()->create();

        $this->putJson("/api/v1/admin/users/{$target->getKey()}", [
            'name' => $target->name,
            'email' => $target->email,
            'is_super_admin' => true,
        ])->assertJsonValidationErrors('is_super_admin');

        $this->assertFalse($target->refresh()->isSuperAdmin());
    }

    public function test_non_super_admin_cannot_manage_super_admin(): void
    {
        Passport::actingAs($this->userManager());
        $superAdmin = User::factory()->create(['is_super_admin' => true]);

        $this->putJson("/api/v1/admin/users/{$superAdmin->getKey()}", [
            'name' => 'Hijacked',
            'email' => 'hijacked@example.com',
        ])->assertJsonValidationErrors('user');

        $this->putJson("/api/v1/admin/users/{$superAdmin->getKey()}/password", [
            'password' => 'Hijack123!',
            'password_confirmation' => 'Hijack123!',
        ])->assertJsonValidationErrors('user');

        $this->deleteJson("/api/v1/admin/users/{$superAdmin->getKey()}")
            ->assertJsonValidationErrors('user');

        $this->assertNotSoftDeleted('users', ['id' => $superAdmin->getKey()]);
    }

    public function test_show_returns_user(): void
    {
        Passport::actingAs($this->admin());
        $user = User::factory()->create();

        $this->getJson("/api/v1/admin/users/{$user->getKey()}")
            ->assertOk()
            ->assertJsonPath('data.id', $user->getKey());
    }

    public function test_update_updates_user_and_roles(): void
    {
        Passport::actingAs($this->admin());
        $this->makeRole('editor');
        $user = User::factory()->create();

        $this->putJson("/api/v1/admin/users/{$user->getKey()}", [
            'name' => 'Updated Name',
            'email' => 'updated@example.com',
            'roles' => ['editor'],
        ])->assertOk()
            ->assertJsonPath('data.name', 'Updated Name')
            ->assertJsonPath('data.roles', ['editor']);

        $this->assertDatabaseHas('users', [
            'id' => $user->getKey(),
            'name' => 'Updated Name',
            'email' => 'updated@example.com',
        ]);
    }

    public function test_update_prevents_self_demotion(): void
    {
        $admin = $this->admin();
        Passport::actingAs($admin);

        $this->putJson("/api/v1/admin/users/{$admin->getKey()}", [
            'name' => $admin->name,
            'email' => $admin->email,
            'is_super_admin' => false,
        ])->assertJsonValidationErrors('roles');

        $this->assertTrue($admin->refresh()->isSuperAdmin());
    }

    public function test_destroy_soft_deletes_user(): void
    {
        Passport::actingAs($this->admin());
        $user = User::factory()->create();

        $this->deleteJson("/api/v1/admin/users/{$user->getKey()}")
            ->assertOk();

        $this->assertSoftDeleted('users', ['id' => $user->getKey()]);
    }

    public function test_destroy_prevents_self_delete(): void
    {
        $admin = $this->admin();
        Passport::actingAs($admin);

        $this->deleteJson("/api/v1/admin/users/{$admin->getKey()}")
            ->assertJsonValidationErrors('user');

        $this->assertNotSoftDeleted('users', ['id' => $admin->getKey()]);
    }

    public function test_restore_restores_trashed_user(): void
    {
        Passport::actingAs($this->admin());
        $user = User::factory()->create();
        $user->delete();

        $this->postJson("/api/v1/admin/users/{$user->getKey()}/restore")
            ->assertOk()
            ->assertJsonPath('data.deleted_at', null);

        $this->assertNotSoftDeleted('users', ['id' => $user->getKey()]);
    }

    public function test_reset_password_updates_password(): void
    {
        Passport::actingAs($this->admin());
        $user = User::factory()->create();

        $this->putJson("/api/v1/admin/users/{$user->getKey()}/password", [
            'password' => 'BrandNew123!',
            'password_confirmation' => 'BrandNew123!',
        ])->assertOk();

        $this->assertTrue(Hash::check('BrandNew123!', $user->refresh()->password));
    }

    public function test_resend_verification_sends_notification(): void
    {
        Notification::fake();

        Passport::actingAs($this->admin());
        $user = User::factory()->unverified()->create();

        $this->postJson("/api/v1/admin/users/{$user->getKey()}/resend-verification")
            ->assertOk();

        Notification::assertSentTo($user, VerifyEmail::class);
    }

    public function test_resend_verification_rejects_verified_user(): void
    {
        Notification::fake();

        Passport::actingAs($this->admin());
        $user = User::factory()->create();

        $this->postJson("/api/v1/admin/users/{$user->getKey()}/resend-verification")
            ->assertJsonValidationErrors('email');

        Notification::assertNothingSent();
    }

    public function test_roles_endpoint_lists_roles(): void
    {
        Passport::actingAs($this->admin());
        $this->makeRole('editor');
        $this->makeRole('manager');

        $this->getJson('/api/v1/admin/roles')
            ->assertOk()
            ->assertJsonFragment(['name' => 'editor'])
            ->assertJsonFragment(['name' => 'manager']);
    }
}
