<?php

use Illuminate\Support\Facades\Route;
use Modules\Network\Http\Controllers\RoleController;
use Modules\Network\Http\Controllers\UserController;
use Modules\Network\Http\Controllers\WebsiteController;
use Modules\Network\Http\Middleware\EnsureSuperAdmin;

/*
|--------------------------------------------------------------------------
| Network API Routes
|--------------------------------------------------------------------------
|
| Network-wide management endpoints. They are not scoped to a single website
| and are restricted to super admins.
|
*/

Route::middleware(['auth:api', EnsureSuperAdmin::class])
    ->prefix('v1/network')
    ->name('network.')
    ->group(function () {
        Route::apiResource('websites', WebsiteController::class);

        Route::prefix('users')->name('users.')->group(function () {
            Route::get('/', [UserController::class, 'index'])->name('index');
            Route::post('/', [UserController::class, 'store'])->name('store');
            Route::post('{user}/restore', [UserController::class, 'restore'])
                ->withTrashed()
                ->name('restore');
            Route::put('{user}/password', [UserController::class, 'resetPassword'])->name('password');
            Route::post('{user}/resend-verification', [UserController::class, 'resendVerification'])
                ->name('resend-verification');
            Route::get('{user}', [UserController::class, 'show'])->name('show');
            Route::match(['put', 'patch'], '{user}', [UserController::class, 'update'])->name('update');
            Route::delete('{user}', [UserController::class, 'destroy'])->name('destroy');
        });

        Route::get('roles', [RoleController::class, 'index'])->name('roles.index');
    });
