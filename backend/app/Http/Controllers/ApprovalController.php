<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreApprovalRequest;
use App\Http\Resources\ApprovalResource;
use App\Models\Approval;
use App\Traits\ApiResponse;
use App\Traits\ResolvesPolymorphicModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ApprovalController extends Controller
{
    use ApiResponse, ResolvesPolymorphicModel;

    public function index(Request $request, string $target_type, string $id)
    {
        $model = $this->resolveTargetModel($target_type, $id);
        
        $this->authorize('view', $model);

        $approvals = $model->approvals()->latest()->get();

        return $this->successResponse(
            ApprovalResource::collection($approvals)
        );
    }

    public function store(StoreApprovalRequest $request, string $target_type, string $id)
    {
        $model = $this->resolveTargetModel($target_type, $id);
        
        $this->authorize('update', $model);

        $approval = $model->approvals()->create([
            'status' => $request->validated('status'),
            'comments' => $request->validated('notes'),
            'user_id' => Auth::id(),
            'reviewed_at' => now(),
            'approval_type' => \App\Enums\ApprovalType::INTERNAL_QC,
        ]);

        return $this->successResponse(
            new ApprovalResource($approval),
            'Approval submitted successfully.',
            201
        );
    }
}

