<?php

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

Route::middleware('auth:api')->prefix('menus')->group(function () {
    Route::get('/', [MenuController::class, 'index']);
    Route::post('/', [MenuController::class, 'store']);
    Route::get('{menu}', [MenuController::class, 'show']);
    Route::match(['put', 'patch'], '{menu}', [MenuController::class, 'update']);
    Route::delete('{menu}', [MenuController::class, 'destroy']);
});
