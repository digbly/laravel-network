<?php

use Illuminate\Support\Facades\Route;
use Modules\Network\Http\Controllers\Web\DashboardController;
use Modules\Network\Http\Controllers\Web\UserController;
use Modules\Network\Http\Controllers\Web\WebsiteController;
use Modules\Network\Http\Middleware\EnsureSuperAdmin;

/*
|--------------------------------------------------------------------------
| Network Admin Web Routes
|--------------------------------------------------------------------------
|
| Super-admin network management rendered through Inertia. These routes are
| intentionally not scoped to a single website.
|
*/

Route::middleware(['auth:web', EnsureSuperAdmin::class])
    ->prefix('network')
    ->name('admin.network.')
    ->group(function () {
        Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

        Route::prefix('websites')->name('websites.')->group(function () {
            Route::get('/', [WebsiteController::class, 'index'])->name('index');
            Route::post('/', [WebsiteController::class, 'store'])->name('store');
            Route::match(['put', 'patch'], '{website}', [WebsiteController::class, 'update'])->name('update');
            Route::delete('{website}', [WebsiteController::class, 'destroy'])->name('destroy');
        });

        Route::prefix('users')->name('users.')->group(function () {
            Route::get('/', [UserController::class, 'index'])->name('index');
            Route::get('create', [UserController::class, 'create'])->name('create');
            Route::post('/', [UserController::class, 'store'])->name('store');
            Route::get('{user}/edit', [UserController::class, 'edit'])->name('edit');
            Route::match(['put', 'patch'], '{user}', [UserController::class, 'update'])->name('update');
            Route::delete('{user}', [UserController::class, 'destroy'])->name('destroy');
            Route::post('{user}/restore', [UserController::class, 'restore'])
                ->withTrashed()
                ->name('restore');
            Route::put('{user}/password', [UserController::class, 'resetPassword'])->name('password');
            Route::post('{user}/resend-verification', [UserController::class, 'resendVerification'])
                ->name('resend-verification');
        });
    });
