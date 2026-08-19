<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\ProjectOutput;
use App\Http\Requests\StoreProjectOutputRequest;
use App\Http\Requests\UpdateProjectOutputRequest;
use App\Http\Resources\ProjectOutputResource;
use App\Traits\ApiResponse;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;

class ProjectOutputController extends Controller
{
    use ApiResponse, AuthorizesRequests;

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request, Project $project)
    {
        $this->authorize('viewAny', [ProjectOutput::class, $project]);

        $outputs = $project->outputs()->with('outputType')->latest()->get();

        return $this->successResponse(
            ProjectOutputResource::collection($outputs),
            'Project outputs retrieved successfully.'
        );
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreProjectOutputRequest $request, Project $project)
    {
        // Spatie intercepts 'create' and returns true for AE, bypassing policy. 
        // We manually check policy or use 'update' on project to ensure correctness.
        if (! $request->user()->can('update', $project)) {
            abort(403, 'Unauthorized action.');
        }

        $data = $request->validated();
        
        $output = $project->outputs()->create([
            'output_type_id' => $data['output_type_id'],
            'period' => $data['name'] ?? null,
            'target_qty' => $data['target_quantity'],
            'actual_qty' => $data['actual_quantity'] ?? 0,
        ]);

        $output->load('outputType');

        return $this->successResponse(
            new ProjectOutputResource($output),
            'Project output created successfully.',
            201
        );
    }

    /**
     * Display the specified resource.
     */
    public function show(Project $project, ProjectOutput $output)
    {
        if ($output->project_id !== $project->id) {
            abort(404, 'Project output not found in this project.');
        }

        $this->authorize('view', $output);

        $output->load('outputType');

        return $this->successResponse(
            new ProjectOutputResource($output),
            'Project output retrieved successfully.'
        );
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateProjectOutputRequest $request, Project $project, ProjectOutput $output)
    {
        if ($output->project_id !== $project->id) {
            abort(404, 'Project output not found in this project.');
        }

        $this->authorize('update', $output);

        $data = $request->validated();
        
        $updateData = [];
        if (isset($data['output_type_id'])) {
            $updateData['output_type_id'] = $data['output_type_id'];
        }
        if (array_key_exists('name', $data)) {
            $updateData['period'] = $data['name'];
        }
        if (isset($data['target_quantity'])) {
            $updateData['target_qty'] = $data['target_quantity'];
        }
        if (array_key_exists('actual_quantity', $data)) {
            $updateData['actual_qty'] = $data['actual_quantity'];
        }

        $output->update($updateData);

        $output->load('outputType');

        return $this->successResponse(
            new ProjectOutputResource($output),
            'Project output updated successfully.'
        );
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Project $project, ProjectOutput $output)
    {
        if ($output->project_id !== $project->id) {
            abort(404, 'Project output not found in this project.');
        }

        $this->authorize('delete', $output);

        $output->delete();

        return $this->successResponse(
            null,
            'Project output deleted successfully.'
        );
    }
}
