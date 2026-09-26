<?php

use App\Providers\AppServiceProvider;
use App\Themes\ThemesServiceProvider;
use App\Providers\PermissionServiceProvider;

return [
    AppServiceProvider::class,
    PermissionServiceProvider::class,
    ThemesServiceProvider::class,
];
