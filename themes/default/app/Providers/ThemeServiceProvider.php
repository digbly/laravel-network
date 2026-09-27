<?php

namespace Themes\Default\Providers;

use App\Facades\Sidebar;
use App\Facades\Widget;
use App\Support\SidebarRenderer;
use Illuminate\Support\Facades\View;
use Illuminate\Support\ServiceProvider;
use Themes\Default\Support\NavigationData;

class ThemeServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        $this->registerErrorViews();
        $this->registerSidebars();
        $this->registerWidgets();

        View::composer('default::partials.sidebar', function ($view): void {
            $view->with(
                'sidebarWidgets',
                $this->app->make(SidebarRenderer::class)->render('sidebar')
            );
        });

        View::composer('default::partials.header', function ($view): void {
            $view->with('navCategories', $this->app->make(NavigationData::class)->categories());
        });
    }

    /**
     * Register the theme sidebars widgets can be assigned to.
     */
    protected function registerSidebars(): void
    {
        Sidebar::make('sidebar', fn () => [
            'label' => __('default::messages.sidebar_main'),
            'description' => __('default::messages.sidebar_main_description'),
        ]);
    }

    /**
     * Register the widgets shipped with the theme, along with the Blade view
     * used to render each one on the frontend.
     */
    protected function registerWidgets(): void
    {
        Widget::make('categories', fn () => [
            'label' => __('default::messages.widget_categories'),
            'description' => __('default::messages.widget_categories_description'),
            'view' => 'default::partials.widgets.categories',
            'only' => ['sidebar'],
        ]);

        Widget::make('recent-posts', fn () => [
            'label' => __('default::messages.widget_recent_posts'),
            'description' => __('default::messages.widget_recent_posts_description'),
            'view' => 'default::partials.widgets.recent-posts',
            'only' => ['sidebar'],
            'defaults' => ['limit' => 5],
        ]);

        Widget::make('popular-posts', fn () => [
            'label' => __('default::messages.widget_popular_posts'),
            'description' => __('default::messages.widget_popular_posts_description'),
            'view' => 'default::partials.widgets.popular-posts',
            'only' => ['sidebar'],
            'defaults' => ['limit' => 5],
        ]);
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
