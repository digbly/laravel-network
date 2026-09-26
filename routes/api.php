<?php

use App\Enums\MenuPermission;
use App\Http\Controllers\Api\MenuController;
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

Route::middleware('auth:api')->prefix('admin/menus')->group(function () {
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
