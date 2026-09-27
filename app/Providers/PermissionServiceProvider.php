<?php

namespace App\Providers;

use App\Enums\LanguagePermission;
use App\Enums\MediaPermission;
use App\Enums\MenuPermission;
use App\Enums\PagePermission;
use App\Enums\ThemePermission;
use App\Enums\WebsitePermission;
use App\Enums\WidgetPermission;
use App\Support\PermissionRegistry;
use Illuminate\Support\ServiceProvider;
use Modules\Auth\Enums\Permission as AuthPermission;
use Modules\Blog\Enums\Permission as BlogPermission;

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
            ...LanguagePermission::values(),
            ...WidgetPermission::values(),
            ...PagePermission::values(),
            ...ThemePermission::values(),
        ]);
    }
}
