<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreContentPlanRequest;
use App\Http\Requests\UpdateContentPlanRequest;
use App\Http\Resources\ContentPlanResource;
use App\Models\ContentPlan;
use App\Models\Project;
use App\Traits\ApiResponse;

class ContentPlanController extends Controller
{
    use ApiResponse;

    public function index(Project $project)
    {
        $this->authorize('viewAny', [ContentPlan::class, $project]);
        
        $contentPlans = $project->contentPlans()->latest()->paginate();
        
        return $this->successResponse(
            ContentPlanResource::collection($contentPlans)->response()->getData(true),
            'Content plans retrieved successfully'
        );
    }

    public function store(StoreContentPlanRequest $request, Project $project)
    {
        $this->authorize('create', [ContentPlan::class, $project]);

        $data = $request->validated();
        $data['created_by'] = $request->user()->id;
        
        $contentPlan = $project->contentPlans()->create($data);

        return $this->successResponse(new ContentPlanResource($contentPlan), 'Content plan created successfully', 201);
    }

    public function show(Project $project, ContentPlan $contentPlan)
    {
        $this->authorize('view', $contentPlan);

        return $this->successResponse(new ContentPlanResource($contentPlan), 'Content plan retrieved successfully');
    }

    public function update(UpdateContentPlanRequest $request, Project $project, ContentPlan $contentPlan)
    {
        $this->authorize('update', $contentPlan);

        $contentPlan->update($request->validated());

        return $this->successResponse(new ContentPlanResource($contentPlan), 'Content plan updated successfully');
    }

    public function destroy(Project $project, ContentPlan $contentPlan)
    {
        $this->authorize('delete', $contentPlan);

        $contentPlan->delete();

        return $this->successResponse(null, 'Content plan deleted successfully');
    }
}
