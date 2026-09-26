<?php

namespace App\Providers;

use App\Enums\MenuPermission;
use App\Enums\WebsitePermission;
use App\Support\PermissionRegistry;
use Illuminate\Support\ServiceProvider;
use Modules\Auth\Enums\Permission as AuthPermission;

class PermissionServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(PermissionRegistry::class);
    }

    public function boot(): void
    {
        $this->app->make(PermissionRegistry::class)->register([
            ...MenuPermission::values(),
            ...AuthPermission::values(),
            ...WebsitePermission::values(),
        ]);
    }
}
