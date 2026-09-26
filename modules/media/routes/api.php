<?php

use App\Http\Middleware\InitWebsite;
use Illuminate\Support\Facades\Route;
use Modules\Media\Enums\Permission;
use Modules\Media\Http\Controllers\Admin\MediaController;

/*
|--------------------------------------------------------------------------
| Admin API Routes
|--------------------------------------------------------------------------
*/

Route::middleware(['auth:api', InitWebsite::class])
    ->prefix('admin/websites/{website}/media')
    ->group(function () {
        Route::get('/', [MediaController::class, 'index'])
            ->middleware('permission:'.Permission::MediaView->value);
        Route::post('/', [MediaController::class, 'store'])
            ->middleware('permission:'.Permission::MediaCreate->value);
        Route::get('{media}', [MediaController::class, 'show'])
            ->middleware('permission:'.Permission::MediaView->value);
        Route::match(['put', 'patch'], '{media}', [MediaController::class, 'update'])
            ->middleware('permission:'.Permission::MediaUpdate->value);
        Route::delete('{media}', [MediaController::class, 'destroy'])
            ->middleware('permission:'.Permission::MediaDelete->value);
    });
