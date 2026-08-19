<?php

use Illuminate\Support\Facades\Route;

Route::get('/ping', function () {
    return ['status' => 'ok'];
});

Route::middleware('auth:sanctum')->group(function () {
    // Add authenticated routes here
});
