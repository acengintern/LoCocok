<?php

namespace App\Http\Controllers;

use App\Models\Contract;
use App\Models\Project;
use App\Http\Requests\StoreContractRequest;
use App\Http\Requests\UpdateContractRequest;
use App\Http\Resources\ContractResource;
use App\Traits\ApiResponse;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;

class ContractController extends Controller
{
    use ApiResponse, AuthorizesRequests;

    /**
     * Display a listing of the resource.
     */
    public function index(Project $project)
    {
        $this->authorize('viewAny', [Contract::class, $project]);

        $contracts = $project->contracts()->latest()->get();

        return $this->successResponse(
            ContractResource::collection($contracts),
            'Contracts retrieved successfully.'
        );
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreContractRequest $request, Project $project)
    {
        $this->authorize('create', [Contract::class, $project]);

        $data = $request->validated();
        $data['client_id'] = $project->client_id;
        
        $contract = $project->contracts()->create($data);

        return $this->successResponse(
            new ContractResource($contract),
            'Contract created successfully.',
            201
        );
    }

    /**
     * Display the specified resource.
     */
    public function show(Project $project, Contract $contract)
    {
        if ($contract->project_id !== $project->id) {
            abort(404);
        }

        $this->authorize('view', $contract);

        return $this->successResponse(
            new ContractResource($contract),
            'Contract retrieved successfully.'
        );
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateContractRequest $request, Project $project, Contract $contract)
    {
        if ($contract->project_id !== $project->id) {
            abort(404);
        }

        $this->authorize('update', $contract);

        $contract->update($request->validated());

        return $this->successResponse(
            new ContractResource($contract),
            'Contract updated successfully.'
        );
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Project $project, Contract $contract)
    {
        if ($contract->project_id !== $project->id) {
            abort(404);
        }

        $this->authorize('delete', $contract);

        $contract->delete();

        return $this->successResponse(
            null,
            'Contract deleted successfully.'
        );
    }
}
