<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AuthController;

Route::prefix('v1')->group(function () {
    Route::get('/ping', function () {
        return response()->json([
            'success' => true,
            'message' => 'pong',
            'data'    => ['status' => 'ok'],
            'meta'    => (object) []
        ]);
    });

    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
    });
});

Route::prefix('v1/master')->middleware('auth:sanctum')->group(function () {
    Route::apiResource('teams', App\Http\Controllers\Api\V1\TeamController::class);
    Route::apiResource('project-types', App\Http\Controllers\Api\V1\ProjectTypeController::class);
    Route::apiResource('output-types', App\Http\Controllers\Api\V1\OutputTypeController::class);
    Route::apiResource('task-types', App\Http\Controllers\Api\V1\TaskTypeController::class);
    Route::apiResource('file-types', App\Http\Controllers\Api\V1\FileTypeController::class);
});