<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBriefRequest;
use App\Http\Requests\UpdateBriefRequest;
use App\Http\Resources\BriefResource;
use App\Models\Brief;
use App\Models\Project;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class BriefController extends Controller
{
    use ApiResponse;

    public function indexGlobal(Request $request)
    {
        $query = Brief::with(['project.client', 'createdBy']);

        if ($request->filled('project_id')) {
            $query->where('project_id', $request->project_id);
        }

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('brief_text', 'like', "%{$s}%")
                  ->orWhere('objective', 'like', "%{$s}%")
                  ->orWhere('platform', 'like', "%{$s}%")
                  ->orWhereHas('project', function ($pq) use ($s) {
                      $pq->where('name', 'like', "%{$s}%");
                  });
            });
        }

        $briefs = $query->latest()->paginate($request->get('per_page', 25));

        return $this->successResponse(
            BriefResource::collection($briefs)->response()->getData(true),
            'Global briefs retrieved successfully'
        );
    }

    public function index(Project $project)
    {
        $this->authorize('viewAny', [Brief::class, $project]);
        
        $briefs = $project->briefs()->latest()->paginate();
        
        return $this->successResponse(
            BriefResource::collection($briefs)->response()->getData(true),
            'Briefs retrieved successfully'
        );
    }

    public function store(StoreBriefRequest $request, Project $project)
    {
        $this->authorize('create', [Brief::class, $project]);

        $data = $request->validated();
        $data['created_by'] = $request->user()->id;
        
        $brief = $project->briefs()->create($data);

        return $this->successResponse(new BriefResource($brief), 'Brief created successfully', 201);
    }

    public function show(Project $project, Brief $brief)
    {
        $this->authorize('view', $brief);

        return $this->successResponse(new BriefResource($brief), 'Brief retrieved successfully');
    }

    public function update(UpdateBriefRequest $request, Project $project, Brief $brief)
    {
        $this->authorize('update', $brief);

        $brief->update($request->validated());

        return $this->successResponse(new BriefResource($brief), 'Brief updated successfully');
    }

    public function destroy(Project $project, Brief $brief)
    {
        $this->authorize('delete', $brief);

        $brief->delete();

        return $this->successResponse(null, 'Brief deleted successfully');
    }
}
