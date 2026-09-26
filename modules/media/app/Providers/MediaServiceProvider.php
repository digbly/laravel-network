<?php

namespace Modules\Media\Providers;

use App\Facades\Menu;
use App\Support\MenuRepository;
use Modules\Media\Enums\Permission;
use Nwidart\Modules\Support\ModuleServiceProvider;

class MediaServiceProvider extends ModuleServiceProvider
{
    /**
     * The name of the module.
     */
    protected string $name = 'Media';

    /**
     * The lowercase version of the module name.
     */
    protected string $nameLower = 'media';

    /**
     * Provider classes to register.
     *
     * @var string[]
     */
    protected array $providers = [
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
     */
    protected function registerNavigation(): void
    {
        $position = MenuRepository::POSITION_ADMIN;

        Menu::make('media', fn () => [
            'label' => __('admin.nav.media'),
            'to' => '/media',
            'icon' => 'images',
            'permission' => Permission::MediaView->value,
            'position' => $position,
            'priority' => 40,
        ]);
    }
}
