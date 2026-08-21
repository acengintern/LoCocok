<?php

use App\Http\Controllers\Api\V1\ActivityLogController;
use App\Http\Controllers\Api\V1\BriefController;
use App\Http\Controllers\Api\V1\ContentPlanController;
use App\Http\Controllers\Api\V1\DashboardController;
use App\Http\Controllers\Api\V1\FileController;
use App\Http\Controllers\Api\V1\FileTypeController;
use App\Http\Controllers\Api\V1\FileVersionController;
use App\Http\Controllers\Api\V1\NotificationController;
use App\Http\Controllers\Api\V1\OutputTypeController;
use App\Http\Controllers\Api\V1\ProjectCostController;
use App\Http\Controllers\Api\V1\ProjectFinancialController;
use App\Http\Controllers\Api\V1\ProjectPaymentController;
use App\Http\Controllers\Api\V1\ProjectTypeController;
use App\Http\Controllers\Api\V1\ScriptController;
use App\Http\Controllers\Api\V1\TaskAssignmentController;
use App\Http\Controllers\Api\V1\TaskController;
use App\Http\Controllers\Api\V1\TaskTypeController;
use App\Http\Controllers\Api\V1\TeamController;
use App\Http\Controllers\ApprovalController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\ContractController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\ProjectOutputController;
use App\Http\Controllers\RevisionController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::get('/ping', function () {
        return response()->json([
            'success' => true,
            'message' => 'pong',
            'data' => ['status' => 'ok'],
            'meta' => (object) [],
        ]);
    });

    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
        Route::get('/users/me', [AuthController::class, 'me']);

        // Users
        Route::apiResource('users', UserController::class);

        // Roles & Permissions
        Route::apiResource('roles', RoleController::class);
        Route::post('roles/{role}/permissions', [RoleController::class, 'assignPermission']);
        Route::delete('roles/{role}/permissions/{permission}', [RoleController::class, 'revokePermission']);
        Route::post('roles/{role}/sync-permissions', [RoleController::class, 'syncPermissions']);

        Route::apiResource('permissions', PermissionController::class);

        Route::get('/users/{user}/roles', [UserController::class, 'getRoles']);
        Route::post('/users/{user}/roles', [UserController::class, 'assignRole']);
        Route::delete('/users/{user}/roles/{role}', [UserController::class, 'removeRole']);

        // Clients
        Route::apiResource('clients', ClientController::class);

        // Projects
        Route::apiResource('projects', ProjectController::class);
        Route::apiResource('projects.contracts', ContractController::class);
        // Outputs
        Route::apiResource('projects.outputs', ProjectOutputController::class);

        // Content Planning
        Route::apiResource('projects.briefs', BriefController::class)->scoped();
        Route::apiResource('projects.content-plans', ContentPlanController::class)->scoped();
        Route::apiResource('projects.scripts', ScriptController::class)->scoped();

        // Tasks
        Route::get('tasks', [TaskController::class, 'indexGlobal']);
        Route::apiResource('projects.tasks', TaskController::class)->scoped();

        // Task Assignments
        Route::apiResource('projects.tasks.assignments', TaskAssignmentController::class)
            ->only(['index', 'store', 'destroy'])
            ->scoped();

        // Files
        Route::apiResource('projects.files', FileController::class)->only(['index', 'store', 'show', 'destroy'])->scoped();

        // File Versions
        Route::apiResource('projects.files.versions', FileVersionController::class)->only(['index', 'store'])->scoped();
        Route::get('projects/{project}/files/{file}/versions/{version}/download', [FileVersionController::class, 'download'])
            ->name('projects.files.versions.download');
        // Financials
        Route::get('projects/{project}/financials', [ProjectFinancialController::class, 'show']);
        Route::put('projects/{project}/financials', [ProjectFinancialController::class, 'update']);
        Route::apiResource('projects.payments', ProjectPaymentController::class);
        Route::apiResource('projects.costs', ProjectCostController::class);

        // Notifications
        Route::get('notifications/unread-count', [NotificationController::class, 'unreadCount']);
        Route::post('notifications/mark-all-read', [NotificationController::class, 'markAllRead']);
        Route::put('notifications/{id}/mark-read', [NotificationController::class, 'markRead']);
        Route::get('notifications', [NotificationController::class, 'index']);

        // Approvals & Revisions
        Route::get('/{target_type}/{id}/approvals', [ApprovalController::class, 'index']);
        Route::post('/{target_type}/{id}/approvals', [ApprovalController::class, 'store']);
        Route::get('/{target_type}/{id}/revisions', [RevisionController::class, 'index']);
        Route::post('/{target_type}/{id}/revisions', [RevisionController::class, 'store']);

        // Dashboard
        Route::get('dashboard/summary', [DashboardController::class, 'summary']);
        Route::get('dashboard/workload', [DashboardController::class, 'workload']);

        // Activity Logs (Audit)
        Route::get('activity-logs', [ActivityLogController::class, 'index']);

        // Settings
        Route::get('settings', [SettingController::class, 'index']);
        Route::post('settings', [SettingController::class, 'store'])->middleware('role:System Administrator');
    });
});

Route::prefix('v1/master')->middleware('auth:sanctum')->group(function () {
    Route::apiResource('teams', TeamController::class);
    Route::apiResource('project-types', ProjectTypeController::class);
    Route::apiResource('output-types', OutputTypeController::class);
    Route::apiResource('task-types', TaskTypeController::class);
    Route::apiResource('file-types', FileTypeController::class);
});
