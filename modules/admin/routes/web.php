<?php

use App\Http\Middleware\InitWebsite;
use Illuminate\Support\Facades\Route;
use Modules\Admin\Http\Controllers\AdminController;
use Modules\Admin\Http\Controllers\Web\AdminHomeController;
use Modules\Admin\Http\Controllers\Web\DashboardController;
use Modules\Admin\Http\Controllers\Web\MediaController;
use Modules\Admin\Http\Controllers\Web\SettingController;
use Modules\Admin\Http\Controllers\Web\UserController;
use Modules\Admin\Http\Middleware\EnsureWebsiteAccess;
use Modules\Admin\Enums\MediaPermission;
use Modules\Admin\Http\Middleware\RequireAdminPermission;
use Modules\Auth\Enums\Permission;

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

                Route::middleware(RequireAdminPermission::class.':'.Permission::SettingsManage->value)
                    ->group(function () {
                        Route::get('settings', [SettingController::class, 'edit'])->name('admin.settings.edit');
                        Route::put('settings', [SettingController::class, 'store'])->name('admin.settings.update');
                    });

                Route::middleware(RequireAdminPermission::class.':'.Permission::UsersManage->value)
                    ->prefix('users')
                    ->name('admin.users.')
                    ->group(function () {
                        Route::get('/', [UserController::class, 'index'])->name('index');
                        Route::get('create', [UserController::class, 'create'])->name('create');
                        Route::post('/', [UserController::class, 'store'])->name('store');
                        Route::get('{user}/edit', [UserController::class, 'edit'])->name('edit');
                        Route::put('{user}', [UserController::class, 'update'])->name('update');
                        Route::delete('{user}', [UserController::class, 'destroy'])->name('destroy');
                        Route::post('{user}/restore', [UserController::class, 'restore'])
                            ->withTrashed()
                            ->name('restore');
                        Route::put('{user}/password', [UserController::class, 'resetPassword'])->name('password');
                        Route::post('{user}/resend-verification', [UserController::class, 'resendVerification'])
                            ->name('resend-verification');
                    });

                Route::prefix('media')->name('admin.media.')->group(function () {
                    Route::get('/', [MediaController::class, 'index'])
                        ->middleware(RequireAdminPermission::class.':'.MediaPermission::MediaView->value)
                        ->name('index');
                    Route::get('list', [MediaController::class, 'list'])
                        ->middleware(RequireAdminPermission::class.':'.MediaPermission::MediaView->value)
                        ->name('list');
                    Route::post('/', [MediaController::class, 'store'])
                        ->middleware(RequireAdminPermission::class.':'.MediaPermission::MediaCreate->value)
                        ->name('store');
                    Route::put('{media}', [MediaController::class, 'update'])
                        ->middleware(RequireAdminPermission::class.':'.MediaPermission::MediaUpdate->value)
                        ->name('update');
                    Route::delete('{media}', [MediaController::class, 'destroy'])
                        ->middleware(RequireAdminPermission::class.':'.MediaPermission::MediaDelete->value)
                        ->name('destroy');
                });
            });
    });
