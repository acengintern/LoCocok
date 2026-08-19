<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Team;
use App\Http\Requests\StoreTeamRequest;
use App\Http\Requests\UpdateTeamRequest;
use App\Http\Resources\MasterDataResource;
use App\Traits\ApiResponse;
use Illuminate\Support\Facades\Gate;

class TeamController extends Controller
{
    use ApiResponse;

    public function index()
    {
        Gate::authorize('viewAny', Team::class);
        $items = Team::all();
        return $this->successResponse(MasterDataResource::collection($items), 'Team retrieved successfully.');
    }

    public function store(StoreTeamRequest $request)
    {
        Gate::authorize('create', Team::class);
        $item = Team::create($request->validated());
        return $this->successResponse(new MasterDataResource($item), 'Team created successfully.', 201);
    }

    public function show(Team $team)
    {
        Gate::authorize('view', $team);
        return $this->successResponse(new MasterDataResource($team), 'Team retrieved successfully.');
    }

    public function update(UpdateTeamRequest $request, Team $team)
    {
        Gate::authorize('update', $team);
        $team->update($request->validated());
        return $this->successResponse(new MasterDataResource($team), 'Team updated successfully.');
    }

    public function destroy(Team $team)
    {
        Gate::authorize('delete', $team);
        $team->delete();
        return $this->successResponse(null, 'Team deleted successfully.');
    }
}