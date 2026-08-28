<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreScriptRequest;
use App\Http\Requests\UpdateScriptRequest;
use App\Http\Resources\ScriptResource;
use App\Models\Script;
use App\Models\Project;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class ScriptController extends Controller
{
    use ApiResponse;

    public function indexGlobal(Request $request)
    {
        $query = Script::with(['project.client', 'createdBy']);

        if ($request->filled('project_id')) {
            $query->where('project_id', $request->project_id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('content_type')) {
            $query->where('content_type', $request->content_type);
        }

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('title', 'like', "%{$s}%")
                  ->orWhere('hook', 'like', "%{$s}%")
                  ->orWhere('concept', 'like', "%{$s}%")
                  ->orWhere('script', 'like', "%{$s}%")
                  ->orWhereHas('project', function ($pq) use ($s) {
                      $pq->where('name', 'like', "%{$s}%");
                  });
            });
        }

        $scripts = $query->latest()->paginate($request->get('per_page', 25));

        return $this->successResponse(
            ScriptResource::collection($scripts)->response()->getData(true),
            'Global scripts retrieved successfully'
        );
    }

    public function index(Project $project)
    {
        $this->authorize('viewAny', [Script::class, $project]);
        
        $scripts = $project->scripts()->latest()->paginate();
        
        return $this->successResponse(
            ScriptResource::collection($scripts)->response()->getData(true),
            'Scripts retrieved successfully'
        );
    }

    public function store(StoreScriptRequest $request, Project $project)
    {
        $this->authorize('create', [Script::class, $project]);

        $data = $request->validated();
        $data['created_by'] = $request->user()->id;
        
        $script = $project->scripts()->create($data);

        return $this->successResponse(new ScriptResource($script), 'Script created successfully', 201);
    }

    public function show(Project $project, Script $script)
    {
        $this->authorize('view', $script);

        return $this->successResponse(new ScriptResource($script), 'Script retrieved successfully');
    }

    public function update(UpdateScriptRequest $request, Project $project, Script $script)
    {
        $this->authorize('update', $script);

        $script->update($request->validated());

        return $this->successResponse(new ScriptResource($script), 'Script updated successfully');
    }

    public function destroy(Project $project, Script $script)
    {
        $this->authorize('delete', $script);

        $script->delete();

        return $this->successResponse(null, 'Script deleted successfully');
    }
}
