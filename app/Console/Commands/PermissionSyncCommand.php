<?php

namespace App\Console\Commands;

use App\Enums\MenuPermission;
use App\Enums\WebsitePermission;
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

        $permissions = array_merge(
            MenuPermission::values(),
            WebsitePermission::values(),
        );

        foreach ($permissions as $permission) {
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
            ->syncPermissions($permissions);

        $this->info('Permissions synced successfully.');

        return self::SUCCESS;
    }
}
