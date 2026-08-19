diff --git a/backend/app/Http/Controllers/ContractController.php b/backend/app/Http/Controllers/ContractController.php
new file mode 100644
index 0000000..0a7fd54
--- /dev/null
+++ b/backend/app/Http/Controllers/ContractController.php
@@ -0,0 +1,106 @@
+<?php
+
+namespace App\Http\Controllers;
+
+use App\Models\Contract;
+use App\Models\Project;
+use App\Http\Requests\StoreContractRequest;
+use App\Http\Requests\UpdateContractRequest;
+use App\Http\Resources\ContractResource;
+use App\Traits\ApiResponse;
+use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
+use Illuminate\Http\Request;
+
+class ContractController extends Controller
+{
+    use ApiResponse, AuthorizesRequests;
+
+    /**
+     * Display a listing of the resource.
+     */
+    public function index(Project $project)
+    {
+        $this->authorize('viewAny', [Contract::class, $project]);
+
+        $contracts = $project->contracts()->latest()->get();
+
+        return $this->successResponse(
+            ContractResource::collection($contracts),
+            'Contracts retrieved successfully.'
+        );
+    }
+
+    /**
+     * Store a newly created resource in storage.
+     */
+    public function store(StoreContractRequest $request, Project $project)
+    {
+        $this->authorize('create', [Contract::class, $project]);
+
+        $data = $request->validated();
+        $data['client_id'] = $project->client_id;
+        
+        $contract = $project->contracts()->create($data);
+
+        return $this->successResponse(
+            new ContractResource($contract),
+            'Contract created successfully.',
+            201
+        );
+    }
+
+    /**
+     * Display the specified resource.
+     */
+    public function show(Project $project, Contract $contract)
+    {
+        if ($contract->project_id !== $project->id) {
+            abort(404);
+        }
+
+        $this->authorize('view', $contract);
+
+        return $this->successResponse(
+            new ContractResource($contract),
+            'Contract retrieved successfully.'
+        );
+    }
+
+    /**
+     * Update the specified resource in storage.
+     */
+    public function update(UpdateContractRequest $request, Project $project, Contract $contract)
+    {
+        if ($contract->project_id !== $project->id) {
+            abort(404);
+        }
+
+        $this->authorize('update', $contract);
+
+        $contract->update($request->validated());
+
+        return $this->successResponse(
+            new ContractResource($contract),
+            'Contract updated successfully.'
+        );
+    }
+
+    /**
+     * Remove the specified resource from storage.
+     */
+    public function destroy(Project $project, Contract $contract)
+    {
+        if ($contract->project_id !== $project->id) {
+            abort(404);
+        }
+
+        $this->authorize('delete', $contract);
+
+        $contract->delete();
+
+        return $this->successResponse(
+            null,
+            'Contract deleted successfully.'
+        );
+    }
+}
diff --git a/backend/app/Http/Requests/StoreContractRequest.php b/backend/app/Http/Requests/StoreContractRequest.php
new file mode 100644
index 0000000..02e0a80
--- /dev/null
+++ b/backend/app/Http/Requests/StoreContractRequest.php
@@ -0,0 +1,24 @@
+<?php
+
+namespace App\Http\Requests;
+
+use Illuminate\Foundation\Http\FormRequest;
+
+class StoreContractRequest extends FormRequest
+{
+    public function authorize(): bool
+    {
+        return true;
+    }
+
+    public function rules(): array
+    {
+        return [
+            'mou_number' => ['nullable', 'string', 'max:255'],
+            'start_date' => ['nullable', 'date'],
+            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
+            'value' => ['nullable', 'numeric', 'min:0'],
+            'file_path' => ['nullable', 'string', 'max:255'],
+        ];
+    }
+}
diff --git a/backend/app/Http/Requests/UpdateContractRequest.php b/backend/app/Http/Requests/UpdateContractRequest.php
new file mode 100644
index 0000000..0d427e8
--- /dev/null
+++ b/backend/app/Http/Requests/UpdateContractRequest.php
@@ -0,0 +1,24 @@
+<?php
+
+namespace App\Http\Requests;
+
+use Illuminate\Foundation\Http\FormRequest;
+
+class UpdateContractRequest extends FormRequest
+{
+    public function authorize(): bool
+    {
+        return true;
+    }
+
+    public function rules(): array
+    {
+        return [
+            'mou_number' => ['nullable', 'string', 'max:255'],
+            'start_date' => ['nullable', 'date'],
+            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
+            'value' => ['nullable', 'numeric', 'min:0'],
+            'file_path' => ['nullable', 'string', 'max:255'],
+        ];
+    }
+}
diff --git a/backend/app/Http/Resources/ContractResource.php b/backend/app/Http/Resources/ContractResource.php
new file mode 100644
index 0000000..4774d4e
--- /dev/null
+++ b/backend/app/Http/Resources/ContractResource.php
@@ -0,0 +1,25 @@
+<?php
+
+namespace App\Http\Resources;
+
+use Illuminate\Http\Request;
+use Illuminate\Http\Resources\Json\JsonResource;
+
+class ContractResource extends JsonResource
+{
+    public function toArray(Request $request): array
+    {
+        return [
+            'id' => $this->id,
+            'client_id' => $this->client_id,
+            'project_id' => $this->project_id,
+            'mou_number' => $this->mou_number,
+            'start_date' => $this->start_date?->format('Y-m-d'),
+            'end_date' => $this->end_date?->format('Y-m-d'),
+            'value' => $this->value ? (float) $this->value : null,
+            'file_path' => $this->file_path,
+            'created_at' => $this->created_at,
+            'updated_at' => $this->updated_at,
+        ];
+    }
+}
diff --git a/backend/app/Policies/ContractPolicy.php b/backend/app/Policies/ContractPolicy.php
new file mode 100644
index 0000000..9081946
--- /dev/null
+++ b/backend/app/Policies/ContractPolicy.php
@@ -0,0 +1,68 @@
+<?php
+
+namespace App\Policies;
+
+use App\Models\Contract;
+use App\Models\Project;
+use App\Models\User;
+
+class ContractPolicy
+{
+    /**
+     * Determine whether the user can view any models.
+     * We'll typically authorize against the project directly in the controller,
+     * but we provide this if needed (passing a project instead of contract).
+     */
+    public function viewAny(User $user, Project $project): bool
+    {
+        return $user->can('view', $project);
+    }
+
+    /**
+     * Determine whether the user can view the model.
+     */
+    public function view(User $user, Contract $contract): bool
+    {
+        return $user->can('view', $contract->project);
+    }
+
+    /**
+     * Determine whether the user can create models.
+     */
+    public function create(User $user, Project $project): bool
+    {
+        return $user->can('update', $project);
+    }
+
+    /**
+     * Determine whether the user can update the model.
+     */
+    public function update(User $user, Contract $contract): bool
+    {
+        return $user->can('update', $contract->project);
+    }
+
+    /**
+     * Determine whether the user can delete the model.
+     */
+    public function delete(User $user, Contract $contract): bool
+    {
+        return $user->can('update', $contract->project);
+    }
+
+    /**
+     * Determine whether the user can restore the model.
+     */
+    public function restore(User $user, Contract $contract): bool
+    {
+        return $user->can('update', $contract->project);
+    }
+
+    /**
+     * Determine whether the user can permanently delete the model.
+     */
+    public function forceDelete(User $user, Contract $contract): bool
+    {
+        return $user->can('update', $contract->project);
+    }
+}
diff --git a/backend/routes/api.php b/backend/routes/api.php
index f13e693..686e7f0 100644
--- a/backend/routes/api.php
+++ b/backend/routes/api.php
@@ -33,6 +33,7 @@
         
         // Projects
         Route::apiResource('projects', \App\Http\Controllers\ProjectController::class);
+        Route::apiResource('projects.contracts', \App\Http\Controllers\ContractController::class);
     });
 });
 
diff --git a/backend/tests/Feature/ContractApiTest.php b/backend/tests/Feature/ContractApiTest.php
new file mode 100644
index 0000000..00000d9
--- /dev/null
+++ b/backend/tests/Feature/ContractApiTest.php
@@ -0,0 +1,189 @@
+<?php
+
+namespace Tests\Feature;
+
+use App\Models\Client;
+use App\Models\Contract;
+use App\Models\Project;
+use App\Models\ProjectType;
+use App\Models\User;
+use Database\Seeders\RolePermissionSeeder;
+use Illuminate\Foundation\Testing\RefreshDatabase;
+use Laravel\Sanctum\Sanctum;
+use Tests\TestCase;
+
+class ContractApiTest extends TestCase
+{
+    use RefreshDatabase;
+
+    protected function setUp(): void
+    {
+        parent::setUp();
+        $this->seed(RolePermissionSeeder::class);
+    }
+
+    private function createDependencies(): array
+    {
+        $client = Client::create(['name' => 'Test Client']);
+        $projectType = ProjectType::create(['name' => 'Video Production']);
+        
+        return [$client, $projectType];
+    }
+
+    public function test_contract_creation_succeeds_for_admin_or_assigned_ae()
+    {
+        $admin = User::factory()->create();
+        $admin->assignRole('System Administrator');
+
+        [$client, $projectType] = $this->createDependencies();
+
+        $project = Project::create([
+            'name' => 'Test Project',
+            'client_id' => $client->id,
+            'project_type_id' => $projectType->id,
+        ]);
+
+        Sanctum::actingAs($admin);
+
+        $response = $this->postJson("/api/v1/projects/{$project->id}/contracts", [
+            'mou_number' => 'MOU-1234',
+            'start_date' => '2026-01-01',
+            'end_date' => '2026-12-31',
+            'value' => 50000,
+        ]);
+
+        $response->assertStatus(201);
+        $this->assertDatabaseHas('contracts', [
+            'project_id' => $project->id,
+            'client_id' => $client->id,
+            'mou_number' => 'MOU-1234',
+            'value' => 50000,
+        ]);
+    }
+
+    public function test_contract_creation_fails_for_normal_user_or_unassigned_ae()
+    {
+        $normalUser = User::factory()->create();
+        // Just a normal user without permission
+
+        [$client, $projectType] = $this->createDependencies();
+
+        $project = Project::create([
+            'name' => 'Test Project',
+            'client_id' => $client->id,
+            'project_type_id' => $projectType->id,
+        ]);
+
+        Sanctum::actingAs($normalUser);
+
+        $response = $this->postJson("/api/v1/projects/{$project->id}/contracts", [
+            'mou_number' => 'MOU-5678',
+        ]);
+
+        $response->assertStatus(403);
+    }
+
+    public function test_validation_works()
+    {
+        $admin = User::factory()->create();
+        $admin->assignRole('System Administrator');
+
+        [$client, $projectType] = $this->createDependencies();
+
+        $project = Project::create([
+            'name' => 'Test Project',
+            'client_id' => $client->id,
+            'project_type_id' => $projectType->id,
+        ]);
+
+        Sanctum::actingAs($admin);
+
+        // end_date before start_date should fail
+        $response = $this->postJson("/api/v1/projects/{$project->id}/contracts", [
+            'start_date' => '2026-12-31',
+            'end_date' => '2026-01-01',
+            'value' => -100, // min:0 should fail
+        ]);
+
+        $response->assertStatus(422)
+                 ->assertJsonValidationErrors(['end_date', 'value']);
+    }
+
+    public function test_accessing_contract_of_another_project_yields_404()
+    {
+        $admin = User::factory()->create();
+        $admin->assignRole('System Administrator');
+
+        [$client, $projectType] = $this->createDependencies();
+
+        $projectA = Project::create([
+            'name' => 'Project A',
+            'client_id' => $client->id,
+            'project_type_id' => $projectType->id,
+        ]);
+
+        $projectB = Project::create([
+            'name' => 'Project B',
+            'client_id' => $client->id,
+            'project_type_id' => $projectType->id,
+        ]);
+
+        $contractA = Contract::create([
+            'client_id' => $client->id,
+            'project_id' => $projectA->id,
+            'mou_number' => 'MOU-A',
+        ]);
+
+        Sanctum::actingAs($admin);
+
+        // Accessing contract A using project B URL
+        $response = $this->getJson("/api/v1/projects/{$projectB->id}/contracts/{$contractA->id}");
+
+        $response->assertStatus(404);
+    }
+
+    public function test_can_view_update_and_delete_contract()
+    {
+        $admin = User::factory()->create();
+        $admin->assignRole('System Administrator');
+
+        [$client, $projectType] = $this->createDependencies();
+
+        $project = Project::create([
+            'name' => 'Test Project',
+            'client_id' => $client->id,
+            'project_type_id' => $projectType->id,
+        ]);
+
+        $contract = Contract::create([
+            'client_id' => $client->id,
+            'project_id' => $project->id,
+            'mou_number' => 'MOU-A',
+            'value' => 1000,
+        ]);
+
+        Sanctum::actingAs($admin);
+
+        // View
+        $responseView = $this->getJson("/api/v1/projects/{$project->id}/contracts/{$contract->id}");
+        $responseView->assertStatus(200)
+                     ->assertJsonPath('data.mou_number', 'MOU-A');
+
+        // Update
+        $responseUpdate = $this->putJson("/api/v1/projects/{$project->id}/contracts/{$contract->id}", [
+            'value' => 2000,
+        ]);
+        $responseUpdate->assertStatus(200);
+        $this->assertDatabaseHas('contracts', [
+            'id' => $contract->id,
+            'value' => 2000,
+        ]);
+
+        // Delete
+        $responseDelete = $this->deleteJson("/api/v1/projects/{$project->id}/contracts/{$contract->id}");
+        $responseDelete->assertStatus(200);
+        $this->assertSoftDeleted('contracts', [
+            'id' => $contract->id,
+        ]);
+    }
+}
