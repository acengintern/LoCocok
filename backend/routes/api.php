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
        
        // Tasks
        Route::get('tasks', [\App\Http\Controllers\Api\V1\TaskController::class, 'indexGlobal']);
        Route::apiResource('projects.tasks', \App\Http\Controllers\Api\V1\TaskController::class)->scoped();
        
        // Task Assignments
        Route::apiResource('projects.tasks.assignments', \App\Http\Controllers\Api\V1\TaskAssignmentController::class)
            ->only(['index', 'store', 'destroy'])
            ->scoped();
        
                // Files
        Route::apiResource('projects.files', \App\Http\Controllers\Api\V1\FileController::class)->only(['index', 'store', 'show', 'destroy'])->scoped();
        
        // File Versions
        Route::apiResource('projects.files.versions', \App\Http\Controllers\Api\V1\FileVersionController::class)->only(['index', 'store'])->scoped();
        Route::get('projects/{project}/files/{file}/versions/{version}/download', [\App\Http\Controllers\Api\V1\FileVersionController::class, 'download'])
            ->name('projects.files.versions.download');
        // Financials
        Route::get('projects/{project}/financials', [\App\Http\Controllers\Api\V1\ProjectFinancialController::class, 'show']);
        Route::put('projects/{project}/financials', [\App\Http\Controllers\Api\V1\ProjectFinancialController::class, 'update']);
        Route::apiResource('projects.payments', \App\Http\Controllers\Api\V1\ProjectPaymentController::class);
        Route::apiResource('projects.costs', \App\Http\Controllers\Api\V1\ProjectCostController::class);

        // Notifications
        Route::get('notifications/unread-count', [\App\Http\Controllers\Api\V1\NotificationController::class, 'unreadCount']);
        Route::post('notifications/mark-all-read', [\App\Http\Controllers\Api\V1\NotificationController::class, 'markAllRead']);
        Route::put('notifications/{id}/mark-read', [\App\Http\Controllers\Api\V1\NotificationController::class, 'markRead']);
        Route::get('notifications', [\App\Http\Controllers\Api\V1\NotificationController::class, 'index']);

        // Approvals & Revisions
        Route::get('/{target_type}/{id}/approvals', [\App\Http\Controllers\ApprovalController::class, 'index']);
        Route::post('/{target_type}/{id}/approvals', [\App\Http\Controllers\ApprovalController::class, 'store']);
        Route::get('/{target_type}/{id}/revisions', [\App\Http\Controllers\RevisionController::class, 'index']);
        Route::post('/{target_type}/{id}/revisions', [\App\Http\Controllers\RevisionController::class, 'store']);
    });
});

Route::prefix('v1/master')->middleware('auth:sanctum')->group(function () {
    Route::apiResource('teams', App\Http\Controllers\Api\V1\TeamController::class);
    Route::apiResource('project-types', App\Http\Controllers\Api\V1\ProjectTypeController::class);
    Route::apiResource('output-types', App\Http\Controllers\Api\V1\OutputTypeController::class);
    Route::apiResource('task-types', App\Http\Controllers\Api\V1\TaskTypeController::class);
    Route::apiResource('file-types', App\Http\Controllers\Api\V1\FileTypeController::class);
});

