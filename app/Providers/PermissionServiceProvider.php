<?php

namespace App\Providers;

use App\Enums\MenuPermission;
use App\Enums\WebsitePermission;
use App\Support\PermissionRegistry;
use Illuminate\Support\ServiceProvider;
use Modules\Auth\Enums\Permission as AuthPermission;
use Modules\Blog\Enums\Permission as BlogPermission;
use Modules\Media\Enums\Permission as MediaPermission;

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
            ...BlogPermission::values(),
            ...MediaPermission::values(),
            ...WebsitePermission::values(),
        ]);
    }
}
