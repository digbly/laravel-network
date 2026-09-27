<?php

namespace Modules\Admin\Providers;

use App\Enums\MenuPermission;
use App\Facades\Menu;
use App\Facades\NavMenu;
use App\Support\MenuRepository;
use Modules\Auth\Enums\Permission as AuthPermission;
use Nwidart\Modules\Support\ModuleServiceProvider;
use Illuminate\Console\Scheduling\Schedule;

class AdminServiceProvider extends ModuleServiceProvider
{
    /**
     * The name of the module.
     */
    protected string $name = 'Admin';

    /**
     * The lowercase version of the module name.
     */
    protected string $nameLower = 'admin';

    /**
     * Command classes to register.
     *
     * @var string[]
     */
    // protected array $commands = [];

    /**
     * Provider classes to register.
     *
     * @var string[]
     */
    protected array $providers = [
        EventServiceProvider::class,
        RouteServiceProvider::class,
    ];

    /**
     * Bootstrap module services.
     */
    public function boot(): void
    {
        parent::boot();

        $this->registerNavigation();
        $this->registerMenuLocations();
    }

    /**
     * Register the navigation menu locations a menu can be assigned to.
     *
     * These live here rather than in the theme because the admin API must
     * expose them even when no theme is booted for the current request. Themes
     * may register additional locations through the same facade.
     */
    protected function registerMenuLocations(): void
    {
        NavMenu::make('primary', fn () => [
            'label' => __('admin.navMenu.primary'),
        ]);

        NavMenu::make('footer', fn () => [
            'label' => __('admin.navMenu.footer'),
        ]);
    }

    /**
     * Register the admin SPA sidebar items owned by this module.
     *
     * Feature modules register their own items; items are lazy callbacks so
     * labels are translated using the locale of the incoming request.
     */
    protected function registerNavigation(): void
    {
        $position = MenuRepository::POSITION_ADMIN;

        Menu::make('dashboard', fn () => [
            'label' => __('admin.nav.dashboard'),
            'to' => '/dashboard',
            'icon' => 'layout-dashboard',
            'permission' => AuthPermission::DashboardView->value,
            'position' => $position,
            'priority' => 10,
        ]);

        Menu::make('users', fn () => [
            'label' => __('admin.nav.users'),
            'to' => '/users',
            'icon' => 'users',
            'permission' => AuthPermission::UsersManage->value,
            'position' => $position,
            'priority' => 50,
        ]);

        Menu::make('settings', fn () => [
            'label' => __('admin.nav.settings'),
            'to' => '/settings',
            'icon' => 'settings',
            'permission' => AuthPermission::SettingsManage->value,
            'position' => $position,
            'priority' => 60,
        ]);

        Menu::make('appearance', fn () => [
            'label' => __('admin.nav.appearance'),
            'icon' => 'palette',
            'position' => $position,
            'priority' => 90,
        ]);

        Menu::make('menus', fn () => [
            'label' => __('admin.nav.menus'),
            'to' => '/menus',
            'icon' => 'menu',
            'permission' => MenuPermission::View->value,
            'parent' => 'appearance',
            'position' => $position,
            'priority' => 10,
        ]);
    }

    /**
     * Define module schedules.
     * 
     * @param $schedule
     */
    // protected function configureSchedules(Schedule $schedule): void
    // {
    //     $schedule->command('inspire')->hourly();
    // }
}
