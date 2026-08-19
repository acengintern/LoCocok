<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\ProjectFinancial;
use App\Http\Requests\UpdateProjectFinancialRequest;
use App\Http\Resources\ProjectFinancialResource;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use App\Traits\ApiResponse;

class ProjectFinancialController extends Controller
{
    use AuthorizesRequests, ApiResponse;

    public function show(Project $project)
    {
        $financial = $project->financial()->firstOrCreate(['project_id' => $project->id]);
        $this->authorize('manage', $financial);
        return $this->successResponse(new ProjectFinancialResource($financial), 'Financial record retrieved successfully.');
    }

    public function update(UpdateProjectFinancialRequest $request, Project $project)
    {
        $financial = $project->financial()->firstOrCreate(['project_id' => $project->id]);
        $this->authorize('manage', $financial);
        $financial->update($request->validated());
        return $this->successResponse(new ProjectFinancialResource($financial), 'Financial record updated successfully.');
    }
}