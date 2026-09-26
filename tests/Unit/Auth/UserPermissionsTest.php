<?php

namespace Tests\Unit\Auth;

use App\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Modules\Auth\Models\User;
use Tests\TestCase;

class UserPermissionsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->artisan('permission:sync');
    }

    public function test_super_admin_receives_wildcard_permission(): void
    {
        $user = User::factory()->create(['is_super_admin' => true]);

        $this->assertSame(['*'], $user->permissionNames());
    }

    public function test_user_without_roles_receives_no_permissions(): void
    {
        $user = User::factory()->create();

        $this->assertSame([], $user->permissionNames());
    }

    public function test_permissions_come_from_assigned_roles(): void
    {
        $role = Role::findOrCreate('editor', 'api');
        $role->syncPermissions(['users.manage']);

        $user = User::factory()->create();
        $user->assignRole($role);

        $this->assertSame(['users.manage'], $user->permissionNames());
    }
}
