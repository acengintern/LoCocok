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

        // Users
        Route::apiResource('users', \App\Http\Controllers\UserController::class);
        
        // Roles
        Route::get('/users/{user}/roles', [\App\Http\Controllers\UserController::class, 'getRoles']);
        Route::post('/users/{user}/roles', [\App\Http\Controllers\UserController::class, 'assignRole']);
        Route::delete('/users/{user}/roles/{role}', [\App\Http\Controllers\UserController::class, 'removeRole']);

        // Clients
        Route::apiResource('clients', \App\Http\Controllers\ClientController::class);
        
        // Projects
        Route::apiResource('projects', \App\Http\Controllers\ProjectController::class);
        Route::apiResource('projects.contracts', \App\Http\Controllers\ContractController::class);
        // Outputs
        Route::apiResource('projects.outputs', \App\Http\Controllers\ProjectOutputController::class);
        
        // Content Planning
        Route::apiResource('projects.briefs', \App\Http\Controllers\Api\V1\BriefController::class)->scoped();
        Route::apiResource('projects.content-plans', \App\Http\Controllers\Api\V1\ContentPlanController::class)->scoped();
        Route::apiResource('projects.scripts', \App\Http\Controllers\Api\V1\ScriptController::class)->scoped();
        
        // Financials
        Route::get('projects/{project}/financials', [\App\Http\Controllers\Api\V1\ProjectFinancialController::class, 'show']);
        Route::put('projects/{project}/financials', [\App\Http\Controllers\Api\V1\ProjectFinancialController::class, 'update']);
        Route::apiResource('projects.payments', \App\Http\Controllers\Api\V1\ProjectPaymentController::class);
        Route::apiResource('projects.costs', \App\Http\Controllers\Api\V1\ProjectCostController::class);
    });
});

Route::prefix('v1/master')->middleware('auth:sanctum')->group(function () {
    Route::apiResource('teams', App\Http\Controllers\Api\V1\TeamController::class);
    Route::apiResource('project-types', App\Http\Controllers\Api\V1\ProjectTypeController::class);
    Route::apiResource('output-types', App\Http\Controllers\Api\V1\OutputTypeController::class);
    Route::apiResource('task-types', App\Http\Controllers\Api\V1\TaskTypeController::class);
    Route::apiResource('file-types', App\Http\Controllers\Api\V1\FileTypeController::class);
});