<?php
$file = 'routes/api.php';
$content = file_get_contents($file);

$routes = <<<PHP

Route::prefix('v1/master')->middleware('auth:sanctum')->group(function () {
    Route::apiResource('teams', App\Http\Controllers\Api\V1\TeamController::class);
    Route::apiResource('project-types', App\Http\Controllers\Api\V1\ProjectTypeController::class);
    Route::apiResource('output-types', App\Http\Controllers\Api\V1\OutputTypeController::class);
    Route::apiResource('task-types', App\Http\Controllers\Api\V1\TaskTypeController::class);
    Route::apiResource('file-types', App\Http\Controllers\Api\V1\FileTypeController::class);
});
PHP;

file_put_contents($file, $content . $routes);
