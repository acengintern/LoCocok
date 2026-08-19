<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Project;
use App\Models\Task;
use App\Models\TaskAssignment;
use App\Http\Requests\AssignTaskRequest;
use App\Http\Resources\TaskAssignmentResource;
use App\Traits\ApiResponse;

class TaskAssignmentController extends Controller
{
    use ApiResponse;

    public function index(Project $project, Task $task)
    {
        $this->authorize('viewAny', [TaskAssignment::class, $task]);

        $assignments = $task->assignments()->with('user')->latest()->get();

        return $this->successResponse(
            TaskAssignmentResource::collection($assignments),
            'Task assignments retrieved successfully'
        );
    }

    public function store(AssignTaskRequest $request, Project $project, Task $task)
    {
        $this->authorize('create', [TaskAssignment::class, $task]);

        $data = $request->validated();
        $data['assigned_by'] = $request->user()->id;
        $data['assigned_at'] = now();

        $assignment = $task->assignments()->create($data);

        return $this->successResponse(
            new TaskAssignmentResource($assignment->load('user')),
            'Task assigned successfully',
            201
        );
    }

    public function destroy(Project $project, Task $task, TaskAssignment $assignment)
    {
        $this->authorize('delete', $assignment);

        // Optional: Ensure assignment belongs to task
        if ($assignment->task_id !== $task->id) {
            abort(404);
        }

        $assignment->delete();

        return $this->successResponse(null, 'Task assignment removed successfully');
    }
}
