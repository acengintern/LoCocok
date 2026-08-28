<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AdditionalLoad;
use App\Models\Task;
use App\Models\TaskAssignment;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdditionalLoadController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $query = AdditionalLoad::with(['project.client', 'ae', 'assignedUser', 'taskType', 'outputType']);

        if ($request->filled('assigned_user_id')) {
            $query->where('assigned_user_id', $request->assigned_user_id);
        }

        if ($request->filled('project_id')) {
            $query->where('project_id', $request->project_id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('priority')) {
            $query->where('priority', $request->priority);
        }

        if ($request->filled('date')) {
            $query->whereDate('date', $request->date);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                  ->orWhere('notes', 'like', "%{$search}%")
                  ->orWhereHas('project', function ($pq) use ($search) {
                      $pq->where('name', 'like', "%{$search}%");
                  });
            });
        }

        $additionalLoads = $query->latest()->paginate($request->get('per_page', 25));

        return $this->successResponse($additionalLoads, 'Additional loads retrieved successfully');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'date' => 'nullable|date',
            'project_id' => 'nullable|exists:projects,id',
            'ae_id' => 'nullable|exists:users,id',
            'assigned_user_id' => 'required|exists:users,id',
            'task_type_id' => 'nullable|exists:task_types,id',
            'output_type_id' => 'nullable|exists:output_types,id',
            'description' => 'required|string',
            'due_date' => 'nullable|date',
            'priority' => 'nullable|in:LOW,MID,HIGH,URGENT',
            'status' => 'nullable|in:REQUEST,ON_PROGRESS,PREVIEW_INTERNAL,PREVIEW_CD,ACC_CD,PREVIEW_CLIENT,REVISION,READY_TO_UPLOAD,PUBLISH,DONE,HOLD,OVERDUE,EXPIRED,CANCELLED',
            'notes' => 'nullable|string',
        ]);

        if (empty($validated['ae_id'])) {
            $validated['ae_id'] = $request->user()->id;
        }

        $load = AdditionalLoad::create($validated);
        $load->load(['project.client', 'ae', 'assignedUser', 'taskType', 'outputType']);

        // Check if there's potential workload collision
        $hasClash = false;
        $existingCount = 0;
        if (!empty($validated['date']) && !empty($validated['assigned_user_id'])) {
            $existingCount = $this->getWorkloadCountForUserOnDate($validated['assigned_user_id'], $validated['date'], $load->id);
            if ($existingCount > 0) {
                $hasClash = true;
            }
        }

        return $this->successResponse([
            'additional_load' => $load,
            'collision_warning' => $hasClash ? "Warning: User {$load->assignedUser?->name} already has {$existingCount} existing task(s) on {$validated['date']}." : null,
        ], 'Additional load created successfully', 201);
    }

    public function show(AdditionalLoad $additionalLoad)
    {
        $additionalLoad->load(['project.client', 'ae', 'assignedUser', 'taskType', 'outputType']);
        return $this->successResponse($additionalLoad, 'Additional load retrieved successfully');
    }

    public function update(Request $request, AdditionalLoad $additionalLoad)
    {
        $validated = $request->validate([
            'date' => 'nullable|date',
            'project_id' => 'nullable|exists:projects,id',
            'ae_id' => 'nullable|exists:users,id',
            'assigned_user_id' => 'sometimes|required|exists:users,id',
            'task_type_id' => 'nullable|exists:task_types,id',
            'output_type_id' => 'nullable|exists:output_types,id',
            'description' => 'sometimes|required|string',
            'due_date' => 'nullable|date',
            'priority' => 'nullable|in:LOW,MID,HIGH,URGENT',
            'status' => 'nullable|in:REQUEST,ON_PROGRESS,PREVIEW_INTERNAL,PREVIEW_CD,ACC_CD,PREVIEW_CLIENT,REVISION,READY_TO_UPLOAD,PUBLISH,DONE,HOLD,OVERDUE,EXPIRED,CANCELLED',
            'notes' => 'nullable|string',
        ]);

        $additionalLoad->update($validated);
        $additionalLoad->load(['project.client', 'ae', 'assignedUser', 'taskType', 'outputType']);

        return $this->successResponse($additionalLoad, 'Additional load updated successfully');
    }

    public function destroy(AdditionalLoad $additionalLoad)
    {
        $additionalLoad->delete();
        return $this->successResponse(null, 'Additional load deleted successfully');
    }

    public function checkClash(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'date' => 'required|date',
        ]);

        $userId = $request->user_id;
        $date = $request->date;

        $taskCount = TaskAssignment::where('user_id', $userId)
            ->whereHas('task', function ($q) use ($date) {
                $q->whereDate('due_date', $date)
                  ->whereNotIn('status', ['DONE', 'CANCELLED']);
            })
            ->count();

        $loadCount = AdditionalLoad::where('assigned_user_id', $userId)
            ->whereDate('date', $date)
            ->whereNotIn('status', ['DONE', 'CANCELLED'])
            ->count();

        $totalLoad = $taskCount + $loadCount;

        return $this->successResponse([
            'user_id' => (int) $userId,
            'date' => $date,
            'task_count' => $taskCount,
            'additional_load_count' => $loadCount,
            'total_load' => $totalLoad,
            'has_clash' => $totalLoad > 0,
            'message' => $totalLoad > 0
                ? "User already has {$totalLoad} active task/load item(s) on {$date}."
                : "User is available on {$date}.",
        ]);
    }

    private function getWorkloadCountForUserOnDate($userId, $date, $excludeLoadId = null)
    {
        $taskCount = TaskAssignment::where('user_id', $userId)
            ->whereHas('task', function ($q) use ($date) {
                $q->whereDate('due_date', $date)
                  ->whereNotIn('status', ['DONE', 'CANCELLED']);
            })
            ->count();

        $loadQuery = AdditionalLoad::where('assigned_user_id', $userId)
            ->whereDate('date', $date)
            ->whereNotIn('status', ['DONE', 'CANCELLED']);

        if ($excludeLoadId) {
            $loadQuery->where('id', '!=', $excludeLoadId);
        }

        $loadCount = $loadQuery->count();

        return $taskCount + $loadCount;
    }
}
