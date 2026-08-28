<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreContentPlanRequest;
use App\Http\Requests\UpdateContentPlanRequest;
use App\Http\Resources\ContentPlanResource;
use App\Models\ContentPlan;
use App\Models\Project;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class ContentPlanController extends Controller
{
    use ApiResponse;

    public function indexGlobal(Request $request)
    {
        $query = ContentPlan::with(['project.client', 'outputType', 'createdBy']);

        if ($request->filled('project_id')) {
            $query->where('project_id', $request->project_id);
        }

        if ($request->filled('platform')) {
            $query->where('platform', $request->platform);
        }

        if ($request->filled('output_type_id')) {
            $query->where('output_type_id', $request->output_type_id);
        }

        if ($request->filled('posting_date')) {
            $query->whereDate('posting_date', $request->posting_date);
        }

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('content_pillar', 'like', "%{$s}%")
                  ->orWhere('content_type', 'like', "%{$s}%")
                  ->orWhere('ideation', 'like', "%{$s}%")
                  ->orWhere('caption', 'like', "%{$s}%")
                  ->orWhereHas('project', function ($pq) use ($s) {
                      $pq->where('name', 'like', "%{$s}%");
                  });
            });
        }

        $contentPlans = $query->latest()->paginate($request->get('per_page', 25));

        return $this->successResponse(
            ContentPlanResource::collection($contentPlans)->response()->getData(true),
            'Global content plans retrieved successfully'
        );
    }

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
