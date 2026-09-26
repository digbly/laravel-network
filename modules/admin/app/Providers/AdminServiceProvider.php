<?php

namespace Modules\Admin\Providers;

use App\Facades\Menu;
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
