<?php

namespace App\Console\Commands;

use App\Enums\MenuPermission;
use App\Models\Permission;
use Illuminate\Console\Command;
use Modules\Auth\Enums\Permission as AuthPermission;
use Spatie\Permission\PermissionRegistrar;

class PermissionSyncCommand extends Command
{
    protected $signature = 'permission:sync
        {--website= : Website id to scope the permissions to}';

    protected $description = 'Sync application permissions';

    public function handle(): int
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $guard = config('auth.defaults.guard', 'api');
        $websiteId = $this->option('website') ?? website_id();

        $permissions = array_values(array_unique(array_merge(
            MenuPermission::values(),
            AuthPermission::values(),
        )));

        foreach ($permissions as $permission) {
            Permission::query()->firstOrCreate([
                'name' => $permission,
                'guard_name' => $guard,
                'website_id' => $websiteId,
            ]);
        }

        $this->info('Permissions synced successfully.');

        return self::SUCCESS;
    }
}
