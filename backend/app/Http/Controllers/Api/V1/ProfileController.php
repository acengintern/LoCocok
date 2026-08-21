<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\TaskStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\Project;
use App\Models\Task;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class ProfileController extends Controller
{
    use ApiResponse;

    /**
     * Update authenticated user profile details.
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:50',
            'division' => 'nullable|string|max:100',
            'bio' => 'nullable|string|max:1000',
        ]);

        $user->update($validated);

        return $this->successResponse(
            new UserResource($user->load('roles')),
            'Profile updated successfully'
        );
    }

    /**
     * Update authenticated user password.
     */
    public function updatePassword(Request $request): JsonResponse
    {
        $user = $request->user();

        $request->validate([
            'current_password' => 'nullable|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if (!empty($user->password)) {
            if (empty($request->current_password) || !Hash::check($request->current_password, $user->password)) {
                throw ValidationException::withMessages([
                    'current_password' => ['The provided current password does not match your current password.'],
                ]);
            }
        }

        $user->update([
            'password' => Hash::make($request->password),
        ]);

        return $this->successResponse(null, 'Password updated successfully');
    }

    /**
     * Get authenticated user workload and task statistics.
     */
    public function stats(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $totalProjects = Project::where(function ($query) use ($userId) {
            $query->where('ae_id', $userId)
                  ->orWhere('sms_id', $userId)
                  ->orWhere('cd_id', $userId)
                  ->orWhereHas('tasks.assignments', function ($q) use ($userId) {
                      $q->where('user_id', $userId);
                  })
                  ->orWhereHas('tasks', function ($q) use ($userId) {
                      $q->where('created_by', $userId);
                  });
        })->count();

        $assignedTasksQuery = Task::whereHas('assignments', function ($query) use ($userId) {
            $query->where('user_id', $userId);
        });

        $totalTasks = (clone $assignedTasksQuery)->count();
        $completedTasks = (clone $assignedTasksQuery)->where('status', TaskStatus::DONE->value)->count();
        $pendingTasks = (clone $assignedTasksQuery)->whereNotIn('status', [
            TaskStatus::DONE->value,
            TaskStatus::CANCELLED->value,
        ])->count();

        return $this->successResponse([
            'total_projects' => $totalProjects,
            'total_tasks' => $totalTasks,
            'completed_tasks' => $completedTasks,
            'pending_tasks' => $pendingTasks,
        ], 'Profile statistics retrieved successfully.');
    }
}
