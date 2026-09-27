<?php

namespace App\Providers;

use App\Facades\Setting;
use Illuminate\Support\ServiceProvider;

class SettingsServiceProvider extends ServiceProvider
{
    /**
     * Register the application setting definitions.
     */
    public function boot(): void
    {
        Setting::make('title')
            ->default((string) config('app.name'))
            ->type('string')
            ->translatable()
            ->rules(['nullable', 'string', 'max:255'])
            ->add();

        Setting::make('description')
            ->type('text')
            ->translatable()
            ->rules(['nullable', 'string', 'max:500'])
            ->add();

        Setting::make('sitename')
            ->type('string')
            ->rules(['nullable', 'string', 'max:120'])
            ->add();

        Setting::make('logo')
            ->type('media')
            ->rules(['nullable', 'string', 'uuid'])
            ->add();

        Setting::make('favicon')
            ->type('media')
            ->rules(['nullable', 'string', 'uuid'])
            ->add();

        Setting::make('banner')
            ->type('media')
            ->rules(['nullable', 'string', 'uuid'])
            ->add();

        Setting::make('user_registration')
            ->default(true)
            ->type('boolean')
            ->rules(['nullable', 'boolean'])
            ->add();

        Setting::make('user_verification')
            ->default(false)
            ->type('boolean')
            ->rules(['nullable', 'boolean'])
            ->add();
    }
}
