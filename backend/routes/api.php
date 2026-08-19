<?php

use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::get('/ping', function () {
        return response()->json([
            'success' => true,
            'message' => 'pong',
            'data'    => ['status' => 'ok'],
            'meta'    => (object) []
        ]);
    });

    Route::middleware('auth:sanctum')->group(function () {
        // Add authenticated routes here
    });
});
