<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\ProjectCost;
use App\Http\Requests\StoreProjectCostRequest;
use App\Http\Requests\UpdateProjectCostRequest;
use App\Http\Resources\ProjectCostResource;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use App\Traits\ApiResponse;

class ProjectCostController extends Controller
{
    use AuthorizesRequests, ApiResponse;

    public function index(Project $project)
    {
        $this->authorize('manage', ProjectCost::class);
        $costs = $project->costs;
        return $this->successResponse(ProjectCostResource::collection($costs), 'Costs retrieved successfully.');
    }

    public function store(StoreProjectCostRequest $request, Project $project)
    {
        $this->authorize('manage', ProjectCost::class);
        $cost = $project->costs()->create($request->validated());
        return $this->successResponse(new ProjectCostResource($cost), 'Cost created successfully.', 201);
    }

    public function show(Project $project, ProjectCost $cost)
    {
        abort_if($cost->project_id !== $project->id, 404, 'Cost not found for this project.');
        $this->authorize('manage', $cost);
        return $this->successResponse(new ProjectCostResource($cost), 'Cost retrieved successfully.');
    }

    public function update(UpdateProjectCostRequest $request, Project $project, ProjectCost $cost)
    {
        abort_if($cost->project_id !== $project->id, 404, 'Cost not found for this project.');
        $this->authorize('manage', $cost);
        $cost->update($request->validated());
        return $this->successResponse(new ProjectCostResource($cost), 'Cost updated successfully.');
    }

    public function destroy(Project $project, ProjectCost $cost)
    {
        abort_if($cost->project_id !== $project->id, 404, 'Cost not found for this project.');
        $this->authorize('manage', $cost);
        $cost->delete();
        return $this->successResponse(null, 'Cost deleted successfully.');
    }
}