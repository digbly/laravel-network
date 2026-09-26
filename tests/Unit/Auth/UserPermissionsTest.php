<?php

namespace Tests\Unit\Auth;

use Modules\Auth\Models\User;
use Tests\TestCase;

class UserPermissionsTest extends TestCase
{
    public function test_admin_receives_all_permissions(): void
    {
        $user = new User(['role' => User::ROLE_ADMIN]);

        $this->assertSame(
            ['dashboard.view', 'users.manage', 'settings.manage'],
            $user->permissions()
        );
    }

    public function test_regular_user_receives_only_dashboard_permission(): void
    {
        $user = new User(['role' => User::ROLE_USER]);

        $this->assertSame(['dashboard.view'], $user->permissions());
    }

    public function test_user_without_role_falls_back_to_dashboard_permission(): void
    {
        $user = new User;

        $this->assertSame(['dashboard.view'], $user->permissions());
    }
}
