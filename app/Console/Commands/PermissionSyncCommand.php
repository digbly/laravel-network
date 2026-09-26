<?php

namespace App\Console\Commands;

use App\Enums\MenuPermission;
use App\Models\Permission;
use App\Models\Role;
use Illuminate\Console\Command;
use Spatie\Permission\PermissionRegistrar;

class PermissionSyncCommand extends Command
{
    protected $signature = 'permission:sync
        {--website= : Website id to scope the permissions and role to}';

    protected $description = 'Sync application permissions and the admin role';

    public function handle(): int
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $guard = config('auth.defaults.guard', 'api');
        $websiteId = $this->option('website') ?? website_id();

        foreach (MenuPermission::values() as $permission) {
            Permission::query()->firstOrCreate([
                'name' => $permission,
                'guard_name' => $guard,
                'website_id' => $websiteId,
            ]);
        }

        Role::query()
            ->firstOrCreate([
                'name' => 'admin',
                'guard_name' => $guard,
                'website_id' => $websiteId,
            ])
            ->syncPermissions(MenuPermission::values());

        $this->info('Permissions synced successfully.');

        return self::SUCCESS;
    }
}
