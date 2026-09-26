<?php

use App\Enums\MediaPermission;
use App\Http\Controllers\Admin\MediaController;
use App\Http\Controllers\NetworkConfigController;
use App\Http\Middleware\InitWebsite;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::get('ping', fn () => response()->json(['status' => 'ok']));

Route::get('network/config', NetworkConfigController::class)->name('network.config');

Route::middleware(['auth:api', InitWebsite::class])
    ->prefix('admin/websites/{website}/media')
    ->group(function () {
        Route::get('/', [MediaController::class, 'index'])
            ->middleware('permission:'.MediaPermission::MediaView->value);
        Route::post('/', [MediaController::class, 'store'])
            ->middleware('permission:'.MediaPermission::MediaCreate->value);
        Route::get('{media}', [MediaController::class, 'show'])
            ->middleware('permission:'.MediaPermission::MediaView->value);
        Route::match(['put', 'patch'], '{media}', [MediaController::class, 'update'])
            ->middleware('permission:'.MediaPermission::MediaUpdate->value);
        Route::delete('{media}', [MediaController::class, 'destroy'])
            ->middleware('permission:'.MediaPermission::MediaDelete->value);
    });
