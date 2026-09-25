<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\SocialLoginController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group.
|
*/

Route::get('ping', fn () => response()->json(['status' => 'ok']));

Route::prefix('auth')->group(function () {
    Route::get('social-providers', [SocialLoginController::class, 'providers'])->name('api.auth.social-providers');
});

Route::prefix('auth/user')->group(function () {
    Route::middleware('throttle:auth')->group(function () {
        Route::post('login', [AuthController::class, 'login']);
        Route::post('refresh-token', [AuthController::class, 'refreshToken']);
        Route::post('register', [AuthController::class, 'register']);
        Route::post('resend-verification-email', [AuthController::class, 'resendVerificationEmail']);
        Route::post('email/verify/{id}/{hash}', [AuthController::class, 'verifyEmail'])->name('verification.verify');
        Route::post('forgot-password', [AuthController::class, 'forgotPassword']);
        Route::post('reset-password', [AuthController::class, 'resetPassword'])->name('password.reset');

        Route::get('social/{driver}/redirect', [SocialLoginController::class, 'redirect'])->name('api.user.social.redirect');
        Route::post('social/{driver}/callback', [SocialLoginController::class, 'callback'])->name('api.user.social.callback');
    });

    Route::middleware('auth:api')->group(function () {
        Route::put('change-password', [AuthController::class, 'changePassword']);
        Route::post('logout', [AuthController::class, 'logout']);
    });
});
