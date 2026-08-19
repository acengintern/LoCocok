<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Project;
use App\Models\Task;
use App\Http\Requests\StoreTaskRequest;
use App\Http\Requests\UpdateTaskRequest;
use App\Http\Resources\TaskResource;
use App\Traits\ApiResponse;

class TaskController extends Controller
{
    use ApiResponse;

    public function indexGlobal(Request $request)
    {
        $this->authorize('viewAny', Task::class);

        $user = $request->user();
        $query = Task::with(['taskType', 'assignments']);

        // If not admin and not managing anything, maybe only return assigned?
        // Wait, "Global list only returns tasks assigned to the current user (if they are not an admin/manager)."
        if (!$user->hasPermissionTo('manage')) {
            $query->whereHas('assignments', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            });
        }

        $tasks = $query->latest()->paginate();
        return $this->successResponse(
            TaskResource::collection($tasks)->response()->getData(true),
            'Tasks retrieved successfully'
        );
    }

    public function index(Project $project)
    {
        $this->authorize('viewAnyForProject', [Task::class, $project]);
        
        $tasks = $project->tasks()->with(['taskType', 'assignments'])->latest()->paginate();
        
        return $this->successResponse(
            TaskResource::collection($tasks)->response()->getData(true),
            'Tasks retrieved successfully'
        );
    }

    public function store(StoreTaskRequest $request, Project $project)
    {
        $this->authorize('create', [Task::class, $project]);

        $data = $request->validated();
        $data['created_by'] = $request->user()->id;
        
        $task = $project->tasks()->create($data);

        return $this->successResponse(new TaskResource($task->load(['taskType', 'assignments'])), 'Task created successfully', 201);
    }

    public function show(Project $project, Task $task)
    {
        $this->authorize('view', $task);

        return $this->successResponse(new TaskResource($task->load(['taskType', 'assignments'])), 'Task retrieved successfully');
    }

    public function update(UpdateTaskRequest $request, Project $project, Task $task)
    {
        $this->authorize('update', $task);

        $data = $request->validated();

        // Check if user is only assignee and not a manager/admin. If so, they can only update status.
        $user = $request->user();
        if (!$user->can('update', $project)) {
            // They can only update status
            $data = $request->only('status');
        }

        $task->update($data);

        return $this->successResponse(new TaskResource($task->load(['taskType', 'assignments'])), 'Task updated successfully');
    }

    public function destroy(Project $project, Task $task)
    {
        $this->authorize('delete', $task);

        $task->delete();

        return $this->successResponse(null, 'Task deleted successfully');
    }
}
