<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ProjectType;
use App\Http\Requests\StoreProjectTypeRequest;
use App\Http\Requests\UpdateProjectTypeRequest;
use App\Http\Resources\MasterDataResource;
use App\Traits\ApiResponse;
use Illuminate\Support\Facades\Gate;

class ProjectTypeController extends Controller
{
    use ApiResponse;

    public function index()
    {
        Gate::authorize('viewAny', ProjectType::class);
        $items = ProjectType::all();
        return $this->successResponse(MasterDataResource::collection($items), 'ProjectType retrieved successfully.');
    }

    public function store(StoreProjectTypeRequest $request)
    {
        Gate::authorize('create', ProjectType::class);
        $item = ProjectType::create($request->validated());
        return $this->successResponse(new MasterDataResource($item), 'ProjectType created successfully.', 201);
    }

    public function show(ProjectType $projectType)
    {
        Gate::authorize('view', $projectType);
        return $this->successResponse(new MasterDataResource($projectType), 'ProjectType retrieved successfully.');
    }

    public function update(UpdateProjectTypeRequest $request, ProjectType $projectType)
    {
        Gate::authorize('update', $projectType);
        $projectType->update($request->validated());
        return $this->successResponse(new MasterDataResource($projectType), 'ProjectType updated successfully.');
    }

    public function destroy(ProjectType $projectType)
    {
        Gate::authorize('delete', $projectType);
        $projectType->delete();
        return $this->successResponse(null, 'ProjectType deleted successfully.');
    }
}