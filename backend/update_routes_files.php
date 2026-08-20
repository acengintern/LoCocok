<?php
$content = file_get_contents('routes/api.php');

$routes = <<<EOT
        // Files
        Route::apiResource('projects.files', \App\Http\Controllers\Api\V1\FileController::class)->only(['index', 'store', 'show', 'destroy'])->scoped();
        
        // File Versions
        Route::apiResource('projects.files.versions', \App\Http\Controllers\Api\V1\FileVersionController::class)->only(['index', 'store'])->scoped();
        Route::get('projects/{project}/files/{file}/versions/{version}/download', [\App\Http\Controllers\Api\V1\FileVersionController::class, 'download'])
            ->name('projects.files.versions.download');

EOT;

$content = str_replace('// Financials', $routes . "        // Financials", $content);
file_put_contents('routes/api.php', $content);
