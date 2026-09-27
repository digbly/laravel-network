<?php

namespace Themes\Default\Providers;

use Illuminate\Support\Facades\View;
use Illuminate\Support\ServiceProvider;
use Themes\Default\Support\NavigationData;
use Themes\Default\Support\SidebarData;

class ThemeServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        $this->registerErrorViews();

        View::composer('default::partials.sidebar', function ($view): void {
            $view->with('sidebar', $this->app->make(SidebarData::class)->get());
        });

        View::composer('default::partials.header', function ($view): void {
            $view->with('navCategories', $this->app->make(NavigationData::class)->categories());
        });
    }

    /**
     * Laravel resolves error views from the "errors" namespace, which is built
     * from config('view.paths'). Prepend the theme views so the themed error
     * pages (e.g. errors/404.blade.php) are used.
     */
    protected function registerErrorViews(): void
    {
        $views = theme()?->getViewsPath() ?? theme_path('Default', 'resources/views');

        config([
            'view.paths' => array_values(array_unique(
                array_merge([$views], (array) config('view.paths', []))
            )),
        ]);
    }
}
