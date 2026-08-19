<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\TaskType;
use App\Http\Requests\StoreTaskTypeRequest;
use App\Http\Requests\UpdateTaskTypeRequest;
use App\Http\Resources\MasterDataResource;
use App\Traits\ApiResponse;
use Illuminate\Support\Facades\Gate;

class TaskTypeController extends Controller
{
    use ApiResponse;

    public function index()
    {
        Gate::authorize('viewAny', TaskType::class);
        $items = TaskType::all();
        return $this->successResponse(MasterDataResource::collection($items), 'TaskType retrieved successfully.');
    }

    public function store(StoreTaskTypeRequest $request)
    {
        Gate::authorize('create', TaskType::class);
        $item = TaskType::create($request->validated());
        return $this->successResponse(new MasterDataResource($item), 'TaskType created successfully.', 201);
    }

    public function show(TaskType $taskType)
    {
        Gate::authorize('view', $taskType);
        return $this->successResponse(new MasterDataResource($taskType), 'TaskType retrieved successfully.');
    }

    public function update(UpdateTaskTypeRequest $request, TaskType $taskType)
    {
        Gate::authorize('update', $taskType);
        $taskType->update($request->validated());
        return $this->successResponse(new MasterDataResource($taskType), 'TaskType updated successfully.');
    }

    public function destroy(TaskType $taskType)
    {
        Gate::authorize('delete', $taskType);
        $taskType->delete();
        return $this->successResponse(null, 'TaskType deleted successfully.');
    }
}