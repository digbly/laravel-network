<?php

namespace App\Providers;

use App\Enums\MediaPermission;
use App\Facades\Menu;
use App\Support\MenuRepository;
use Illuminate\Support\ServiceProvider;

class MediaServiceProvider extends ServiceProvider
{
    /**
     * Register the admin SPA sidebar items owned by the media feature.
     */
    public function boot(): void
    {
        $position = MenuRepository::POSITION_ADMIN;

        Menu::make('media', fn () => [
            'label' => __('admin.nav.media'),
            'to' => '/media',
            'icon' => 'images',
            'permission' => MediaPermission::MediaView->value,
            'position' => $position,
            'priority' => 40,
        ]);
    }
}
