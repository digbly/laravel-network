<?php

use Illuminate\Support\Facades\Route;
use Modules\Auth\Enums\Permission;
use Modules\Auth\Http\Controllers\Admin\RoleController;
use Modules\Auth\Http\Controllers\Admin\UserController;
use Modules\Auth\Http\Controllers\AuthController;
use Modules\Auth\Http\Controllers\SocialLoginController;

Route::get('auth/social-providers', [SocialLoginController::class, 'providers'])->name('api.auth.social-providers');

Route::prefix('auth/user')->group(function () {
    Route::middleware('throttle:auth')->group(function () {
        Route::post('register', [AuthController::class, 'register']);
        Route::post('resend-verification-email', [AuthController::class, 'resendVerificationEmail']);
        Route::post('email/verify/{id}/{hash}', [AuthController::class, 'verifyEmail'])->name('verification.verify');
        Route::post('forgot-password', [AuthController::class, 'forgotPassword']);
        Route::post('reset-password', [AuthController::class, 'resetPassword'])->name('password.reset');
    });

    Route::middleware('auth:api')->group(function () {
        Route::get('profile', [AuthController::class, 'profile']);
        Route::put('change-password', [AuthController::class, 'changePassword']);
        Route::post('logout', [AuthController::class, 'logout']);
    });
});

Route::middleware(['auth:api', 'permission:'.Permission::UsersManage->value])->group(function () {
    Route::get('admin/roles', [RoleController::class, 'index']);

    Route::prefix('admin/users')->group(function () {
        Route::get('/', [UserController::class, 'index']);
        Route::post('/', [UserController::class, 'store']);
        Route::post('{user}/restore', [UserController::class, 'restore'])->withTrashed();
        Route::put('{user}/password', [UserController::class, 'resetPassword']);
        Route::post('{user}/resend-verification', [UserController::class, 'resendVerification']);
        Route::get('{user}', [UserController::class, 'show']);
        Route::match(['put', 'patch'], '{user}', [UserController::class, 'update']);
        Route::delete('{user}', [UserController::class, 'destroy']);
    });
});
