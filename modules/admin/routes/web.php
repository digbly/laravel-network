<?php

use App\Http\Middleware\InitWebsite;
use Illuminate\Support\Facades\Route;
use Modules\Admin\Http\Controllers\AdminController;
use Modules\Admin\Http\Controllers\Web\AdminHomeController;
use Modules\Admin\Http\Controllers\Web\DashboardController;
use Modules\Admin\Http\Middleware\EnsureWebsiteAccess;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('admins', AdminController::class)->names('admin');
});

Route::middleware(['auth:web'])
    ->prefix(config('app.admin_prefix', 'admin'))
    ->group(function () {
        Route::get('/', AdminHomeController::class)->name('admin.home');

        Route::middleware([InitWebsite::class, EnsureWebsiteAccess::class])
            ->prefix('{websiteId}')
            ->group(function () {
                Route::get('/', [DashboardController::class, 'index'])->name('admin.dashboard');
            });
    });
