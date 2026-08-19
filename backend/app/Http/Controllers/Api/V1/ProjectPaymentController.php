<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\ProjectPayment;
use App\Http\Requests\StoreProjectPaymentRequest;
use App\Http\Requests\UpdateProjectPaymentRequest;
use App\Http\Resources\ProjectPaymentResource;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use App\Traits\ApiResponse;

class ProjectPaymentController extends Controller
{
    use AuthorizesRequests, ApiResponse;

    public function index(Project $project)
    {
        $this->authorize('manage', ProjectPayment::class);
        $payments = $project->payments;
        return $this->successResponse(ProjectPaymentResource::collection($payments), 'Payments retrieved successfully.');
    }

    public function store(StoreProjectPaymentRequest $request, Project $project)
    {
        $this->authorize('manage', ProjectPayment::class);
        $payment = $project->payments()->create($request->validated());
        return $this->successResponse(new ProjectPaymentResource($payment), 'Payment created successfully.', 201);
    }

    public function show(Project $project, ProjectPayment $payment)
    {
        abort_if($payment->project_id !== $project->id, 404, 'Payment not found for this project.');
        $this->authorize('manage', $payment);
        return $this->successResponse(new ProjectPaymentResource($payment), 'Payment retrieved successfully.');
    }

    public function update(UpdateProjectPaymentRequest $request, Project $project, ProjectPayment $payment)
    {
        abort_if($payment->project_id !== $project->id, 404, 'Payment not found for this project.');
        $this->authorize('manage', $payment);
        $payment->update($request->validated());
        return $this->successResponse(new ProjectPaymentResource($payment), 'Payment updated successfully.');
    }

    public function destroy(Project $project, ProjectPayment $payment)
    {
        abort_if($payment->project_id !== $project->id, 404, 'Payment not found for this project.');
        $this->authorize('manage', $payment);
        $payment->delete();
        return $this->successResponse(null, 'Payment deleted successfully.');
    }
}