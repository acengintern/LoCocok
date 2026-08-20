<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRevisionRequest;
use App\Http\Resources\RevisionResource;
use App\Models\Revision;
use App\Enums\RevisionStatus;
use App\Traits\ApiResponse;
use App\Traits\ResolvesPolymorphicModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RevisionController extends Controller
{
    use ApiResponse, ResolvesPolymorphicModel;

    public function index(Request $request, string $target_type, string $id)
    {
        $model = $this->resolveTargetModel($target_type, $id);
        
        $this->authorize('view', $model);

        $revisions = $model->revisions()->latest()->get();

        return $this->successResponse(
            RevisionResource::collection($revisions)
        );
    }

    public function store(StoreRevisionRequest $request, string $target_type, string $id)
    {
        $model = $this->resolveTargetModel($target_type, $id);
        
        $this->authorize('update', $model);

        $revision = $model->revisions()->create([
            'description' => $request->validated('revision_notes'),
            'status' => RevisionStatus::OPEN, // Default status
            'requested_by' => Auth::id(),
        ]);

        return $this->successResponse(
            new RevisionResource($revision),
            'Revision requested successfully.',
            201
        );
    }
}
