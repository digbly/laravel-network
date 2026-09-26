<?php

use App\Enums\MenuPermission;
use App\Enums\WebsitePermission;
use App\Http\Middleware\InitWebsite;
use Illuminate\Support\Facades\Route;
use Modules\Admin\Http\Controllers\Admin\MenuController;
use Modules\Admin\Http\Controllers\Admin\PermissionController;
use Modules\Admin\Http\Controllers\Admin\RoleController;
use Modules\Admin\Http\Controllers\Admin\UserController;
use Modules\Admin\Http\Controllers\Admin\WebsiteController;
use Modules\Admin\Http\Controllers\AdminController;
use Modules\Auth\Enums\Permission;

Route::middleware(['auth:sanctum'])->prefix('v1')->group(function () {
    Route::apiResource('admins', AdminController::class)->names('admin');
});

Route::middleware('auth:api')->prefix('v1/admin/websites')->group(function () {
    Route::get('/', [WebsiteController::class, 'index']);
    Route::post('/', [WebsiteController::class, 'store'])
        ->middleware('permission:'.WebsitePermission::Create->value);
    Route::get('{website}', [WebsiteController::class, 'show'])
        ->middleware('permission:'.WebsitePermission::View->value);
    Route::match(['put', 'patch'], '{website}', [WebsiteController::class, 'update'])
        ->middleware('permission:'.WebsitePermission::Update->value);
    Route::delete('{website}', [WebsiteController::class, 'destroy'])
        ->middleware('permission:'.WebsitePermission::Delete->value);
});

Route::middleware(['auth:api', InitWebsite::class])
    ->prefix('v1/admin/websites/{website}/menus')
    ->group(function () {
        Route::get('/', [MenuController::class, 'index'])
            ->middleware('permission:'.MenuPermission::View->value);
        Route::post('/', [MenuController::class, 'store'])
            ->middleware('permission:'.MenuPermission::Create->value);
        Route::get('{menu}', [MenuController::class, 'show'])
            ->middleware('permission:'.MenuPermission::View->value);
        Route::match(['put', 'patch'], '{menu}', [MenuController::class, 'update'])
            ->middleware('permission:'.MenuPermission::Update->value);
        Route::delete('{menu}', [MenuController::class, 'destroy'])
            ->middleware('permission:'.MenuPermission::Delete->value);
    });

Route::middleware(['auth:api', InitWebsite::class, 'permission:'.Permission::UsersManage->value])
    ->prefix('v1/admin/websites/{website}/users')
    ->group(function () {
        Route::get('/', [UserController::class, 'index']);
        Route::post('/', [UserController::class, 'store']);
        Route::post('{user}/restore', [UserController::class, 'restore'])->withTrashed();
        Route::put('{user}/password', [UserController::class, 'resetPassword']);
        Route::post('{user}/resend-verification', [UserController::class, 'resendVerification']);
        Route::get('{user}', [UserController::class, 'show']);
        Route::match(['put', 'patch'], '{user}', [UserController::class, 'update']);
        Route::delete('{user}', [UserController::class, 'destroy']);
    });

Route::middleware(['auth:api', InitWebsite::class, 'permission:'.Permission::RolesManage->value])
    ->prefix('v1/admin/websites/{website}/roles')
    ->group(function () {
        Route::get('/', [RoleController::class, 'index']);
        Route::post('/', [RoleController::class, 'store']);
        Route::get('{role}', [RoleController::class, 'show']);
        Route::match(['put', 'patch'], '{role}', [RoleController::class, 'update']);
        Route::delete('{role}', [RoleController::class, 'destroy']);
    });

Route::middleware(['auth:api', InitWebsite::class, 'permission:'.Permission::RolesManage->value])
    ->prefix('v1/admin/websites/{website}/permissions')
    ->group(function () {
        Route::get('/', [PermissionController::class, 'index']);
    });
