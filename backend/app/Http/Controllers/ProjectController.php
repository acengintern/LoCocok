<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Http\Requests\StoreProjectRequest;
use App\Http\Requests\UpdateProjectRequest;
use App\Http\Resources\ProjectResource;
use App\Services\ProjectService;
use App\Traits\ApiResponse;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    use ApiResponse, AuthorizesRequests;

    protected ProjectService $projectService;

    public function __construct(ProjectService $projectService)
    {
        $this->projectService = $projectService;
    }

    /**
     * Resolve allowed relationships to eager load.
     */
    private function resolveIncludes(Request $request): array
    {
        $allowedIncludes = [
            'client' => 'client',
            'projectType' => 'projectType',
            'ae' => 'ae',
            'sms' => 'sms',
            'cd' => 'creativeDirector',
            'outputs' => 'outputs',
            'tasks' => 'tasks',
            'financialSummary' => 'financial',
        ];

        $includes = $request->query('include');
        if (!$includes) {
            return [];
        }

        $requestedIncludes = explode(',', $includes);
        $resolvedIncludes = [];

        foreach ($requestedIncludes as $include) {
            $include = trim($include);
            if (array_key_exists($include, $allowedIncludes)) {
                $resolvedIncludes[] = $allowedIncludes[$include];
            }
        }

        return $resolvedIncludes;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Project::class);

        $includes = $this->resolveIncludes($request);
        $projects = Project::with($includes)->latest()->get();

        return $this->successResponse(
            ProjectResource::collection($projects),
            'Projects retrieved successfully.'
        );
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreProjectRequest $request)
    {
        $this->authorize('create', Project::class);

        $project = $this->projectService->createProject($request->validated());

        $includes = $this->resolveIncludes($request);
        if (!empty($includes)) {
            $project->load($includes);
        }

        return $this->successResponse(
            new ProjectResource($project),
            'Project created successfully.',
            201
        );
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, Project $project)
    {
        $this->authorize('view', $project);

        $includes = $this->resolveIncludes($request);
        if (!empty($includes)) {
            $project->load($includes);
        }

        return $this->successResponse(
            new ProjectResource($project),
            'Project retrieved successfully.'
        );
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateProjectRequest $request, Project $project)
    {
        $this->authorize('update', $project);

        $project->update($request->validated());

        $includes = $this->resolveIncludes($request);
        if (!empty($includes)) {
            $project->load($includes);
        }

        return $this->successResponse(
            new ProjectResource($project),
            'Project updated successfully.'
        );
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Project $project)
    {
        $this->authorize('delete', $project);

        $project->delete();

        return $this->successResponse(
            null,
            'Project deleted successfully.'
        );
    }
}
