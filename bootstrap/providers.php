<?php

use App\Modules\ModulesServiceProvider;
use App\Providers\AppServiceProvider;
use App\Themes\ThemesServiceProvider;
use App\Providers\PermissionServiceProvider;

return [
    AppServiceProvider::class,
    ModulesServiceProvider::class,
    PermissionServiceProvider::class,
    ThemesServiceProvider::class,
];
