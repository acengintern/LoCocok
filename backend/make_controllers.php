<?php

$dir = 'app/';

// Controllers
$financialController = <<<'EOD'
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
        $this->authorize('view', $financial);
        return $this->successResponse(new ProjectFinancialResource($financial), 'Financial record retrieved successfully.');
    }

    public function update(UpdateProjectFinancialRequest $request, Project $project)
    {
        $financial = $project->financial()->firstOrCreate(['project_id' => $project->id]);
        $this->authorize('update', $financial);
        $financial->update($request->validated());
        return $this->successResponse(new ProjectFinancialResource($financial), 'Financial record updated successfully.');
    }
}
EOD;

$paymentController = <<<'EOD'
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
        $this->authorize('viewAny', ProjectPayment::class);
        $payments = $project->payments;
        return $this->successResponse(ProjectPaymentResource::collection($payments), 'Payments retrieved successfully.');
    }

    public function store(StoreProjectPaymentRequest $request, Project $project)
    {
        $this->authorize('create', ProjectPayment::class);
        $payment = $project->payments()->create($request->validated());
        return $this->successResponse(new ProjectPaymentResource($payment), 'Payment created successfully.', 201);
    }

    public function show(Project $project, ProjectPayment $payment)
    {
        abort_if($payment->project_id !== $project->id, 404, 'Payment not found for this project.');
        $this->authorize('view', $payment);
        return $this->successResponse(new ProjectPaymentResource($payment), 'Payment retrieved successfully.');
    }

    public function update(UpdateProjectPaymentRequest $request, Project $project, ProjectPayment $payment)
    {
        abort_if($payment->project_id !== $project->id, 404, 'Payment not found for this project.');
        $this->authorize('update', $payment);
        $payment->update($request->validated());
        return $this->successResponse(new ProjectPaymentResource($payment), 'Payment updated successfully.');
    }

    public function destroy(Project $project, ProjectPayment $payment)
    {
        abort_if($payment->project_id !== $project->id, 404, 'Payment not found for this project.');
        $this->authorize('delete', $payment);
        $payment->delete();
        return $this->successResponse(null, 'Payment deleted successfully.');
    }
}
EOD;

$costController = <<<'EOD'
<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\ProjectCost;
use App\Http\Requests\StoreProjectCostRequest;
use App\Http\Requests\UpdateProjectCostRequest;
use App\Http\Resources\ProjectCostResource;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use App\Traits\ApiResponse;

class ProjectCostController extends Controller
{
    use AuthorizesRequests, ApiResponse;

    public function index(Project $project)
    {
        $this->authorize('viewAny', ProjectCost::class);
        $costs = $project->costs;
        return $this->successResponse(ProjectCostResource::collection($costs), 'Costs retrieved successfully.');
    }

    public function store(StoreProjectCostRequest $request, Project $project)
    {
        $this->authorize('create', ProjectCost::class);
        $cost = $project->costs()->create($request->validated());
        return $this->successResponse(new ProjectCostResource($cost), 'Cost created successfully.', 201);
    }

    public function show(Project $project, ProjectCost $cost)
    {
        abort_if($cost->project_id !== $project->id, 404, 'Cost not found for this project.');
        $this->authorize('view', $cost);
        return $this->successResponse(new ProjectCostResource($cost), 'Cost retrieved successfully.');
    }

    public function update(UpdateProjectCostRequest $request, Project $project, ProjectCost $cost)
    {
        abort_if($cost->project_id !== $project->id, 404, 'Cost not found for this project.');
        $this->authorize('update', $cost);
        $cost->update($request->validated());
        return $this->successResponse(new ProjectCostResource($cost), 'Cost updated successfully.');
    }

    public function destroy(Project $project, ProjectCost $cost)
    {
        abort_if($cost->project_id !== $project->id, 404, 'Cost not found for this project.');
        $this->authorize('delete', $cost);
        $cost->delete();
        return $this->successResponse(null, 'Cost deleted successfully.');
    }
}
EOD;

file_put_contents($dir.'Http/Controllers/Api/V1/ProjectFinancialController.php', $financialController);
file_put_contents($dir.'Http/Controllers/Api/V1/ProjectPaymentController.php', $paymentController);
file_put_contents($dir.'Http/Controllers/Api/V1/ProjectCostController.php', $costController);
