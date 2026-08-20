diff --git a/backend/app/Http/Controllers/Api/V1/TaskAssignmentController.php b/backend/app/Http/Controllers/Api/V1/TaskAssignmentController.php
new file mode 100644
index 0000000..2e78782
--- /dev/null
+++ b/backend/app/Http/Controllers/Api/V1/TaskAssignmentController.php
@@ -0,0 +1,61 @@
+<?php
+
+namespace App\Http\Controllers\Api\V1;
+
+use App\Http\Controllers\Controller;
+use Illuminate\Http\Request;
+
+use App\Models\Project;
+use App\Models\Task;
+use App\Models\TaskAssignment;
+use App\Http\Requests\AssignTaskRequest;
+use App\Http\Resources\TaskAssignmentResource;
+use App\Traits\ApiResponse;
+
+class TaskAssignmentController extends Controller
+{
+    use ApiResponse;
+
+    public function index(Project $project, Task $task)
+    {
+        $this->authorize('viewAny', [TaskAssignment::class, $task]);
+
+        $assignments = $task->assignments()->with('user')->latest()->get();
+
+        return $this->successResponse(
+            TaskAssignmentResource::collection($assignments),
+            'Task assignments retrieved successfully'
+        );
+    }
+
+    public function store(AssignTaskRequest $request, Project $project, Task $task)
+    {
+        $this->authorize('create', [TaskAssignment::class, $task]);
+
+        $data = $request->validated();
+        $data['assigned_by'] = $request->user()->id;
+        $data['assigned_at'] = now();
+
+        $assignment = $task->assignments()->create($data);
+
+        return $this->successResponse(
+            new TaskAssignmentResource($assignment->load('user')),
+            'Task assigned successfully',
+            201
+        );
+    }
+
+    public function destroy(Project $project, Task $task, TaskAssignment $assignment)
+    {
+        $this->authorize('delete', $assignment);
+
+        // Optional: Ensure assignment belongs to task
+        if ($assignment->task_id !== $task->id) {
+            abort(404);
+        }
+
+        $assignment->delete();
+
+        return $this->successResponse(null, 'Task assignment removed successfully');
+    }
+}
diff --git a/backend/app/Http/Controllers/Api/V1/TaskController.php b/backend/app/Http/Controllers/Api/V1/TaskController.php
new file mode 100644
index 0000000..b4cd89b
--- /dev/null
+++ b/backend/app/Http/Controllers/Api/V1/TaskController.php
@@ -0,0 +1,98 @@
+<?php
+
+namespace App\Http\Controllers\Api\V1;
+
+use App\Http\Controllers\Controller;
+use Illuminate\Http\Request;
+
+use App\Models\Project;
+use App\Models\Task;
+use App\Http\Requests\StoreTaskRequest;
+use App\Http\Requests\UpdateTaskRequest;
+use App\Http\Resources\TaskResource;
+use App\Traits\ApiResponse;
+
+class TaskController extends Controller
+{
+    use ApiResponse;
+
+    public function indexGlobal(Request $request)
+    {
+        $this->authorize('viewAny', Task::class);
+
+        $user = $request->user();
+        $query = Task::with(['taskType', 'assignments']);
+
+        // If not admin and not managing anything, maybe only return assigned?
+        // Wait, "Global list only returns tasks assigned to the current user (if they are not an admin/manager)."
+        if (!$user->hasPermissionTo('manage')) {
+            $query->whereHas('assignments', function ($q) use ($user) {
+                $q->where('user_id', $user->id);
+            });
+        }
+
+        $tasks = $query->latest()->paginate();
+        return $this->successResponse(
+            TaskResource::collection($tasks)->response()->getData(true),
+            'Tasks retrieved successfully'
+        );
+    }
+
+    public function index(Project $project)
+    {
+        $this->authorize('viewAnyForProject', [Task::class, $project]);
+        
+        $tasks = $project->tasks()->with(['taskType', 'assignments'])->latest()->paginate();
+        
+        return $this->successResponse(
+            TaskResource::collection($tasks)->response()->getData(true),
+            'Tasks retrieved successfully'
+        );
+    }
+
+    public function store(StoreTaskRequest $request, Project $project)
+    {
+        $this->authorize('create', [Task::class, $project]);
+
+        $data = $request->validated();
+        $data['created_by'] = $request->user()->id;
+        
+        $task = $project->tasks()->create($data);
+
+        return $this->successResponse(new TaskResource($task->load(['taskType', 'assignments'])), 'Task created successfully', 201);
+    }
+
+    public function show(Project $project, Task $task)
+    {
+        $this->authorize('view', $task);
+
+        return $this->successResponse(new TaskResource($task->load(['taskType', 'assignments'])), 'Task retrieved successfully');
+    }
+
+    public function update(UpdateTaskRequest $request, Project $project, Task $task)
+    {
+        $this->authorize('update', $task);
+
+        $data = $request->validated();
+
+        // Check if user is only assignee and not a manager/admin. If so, they can only update status.
+        $user = $request->user();
+        if (!$user->can('update', $project)) {
+            // They can only update status
+            $data = $request->only('status');
+        }
+
+        $task->update($data);
+
+        return $this->successResponse(new TaskResource($task->load(['taskType', 'assignments'])), 'Task updated successfully');
+    }
+
+    public function destroy(Project $project, Task $task)
+    {
+        $this->authorize('delete', $task);
+
+        $task->delete();
+
+        return $this->successResponse(null, 'Task deleted successfully');
+    }
+}
diff --git a/backend/app/Http/Requests/AssignTaskRequest.php b/backend/app/Http/Requests/AssignTaskRequest.php
new file mode 100644
index 0000000..ee12bb4
--- /dev/null
+++ b/backend/app/Http/Requests/AssignTaskRequest.php
@@ -0,0 +1,31 @@
+<?php
+
+namespace App\Http\Requests;
+
+use Illuminate\Contracts\Validation\ValidationRule;
+use Illuminate\Foundation\Http\FormRequest;
+
+class AssignTaskRequest extends FormRequest
+{
+    /**
+     * Determine if the user is authorized to make this request.
+     */
+    public function authorize(): bool
+    {
+        return true;
+    }
+
+    /**
+     * Get the validation rules that apply to the request.
+     *
+     * @return array<string, ValidationRule|array<mixed>|string>
+     */
+    public function rules(): array
+    {
+        return [
+            'user_id' => ['required', 'exists:users,id'],
+            'priority' => ['required', \Illuminate\Validation\Rule::enum(\App\Enums\Priority::class)],
+            'deadline' => ['nullable', 'date'],
+        ];
+    }
+}
diff --git a/backend/app/Http/Requests/StoreTaskRequest.php b/backend/app/Http/Requests/StoreTaskRequest.php
new file mode 100644
index 0000000..e48b904
--- /dev/null
+++ b/backend/app/Http/Requests/StoreTaskRequest.php
@@ -0,0 +1,36 @@
+<?php
+
+namespace App\Http\Requests;
+
+use Illuminate\Contracts\Validation\ValidationRule;
+use Illuminate\Foundation\Http\FormRequest;
+
+class StoreTaskRequest extends FormRequest
+{
+    /**
+     * Determine if the user is authorized to make this request.
+     */
+    public function authorize(): bool
+    {
+        return true; // Authorized via policy
+    }
+
+    /**
+     * Get the validation rules that apply to the request.
+     *
+     * @return array<string, ValidationRule|array<mixed>|string>
+     */
+    public function rules(): array
+    {
+        return [
+            'title' => ['required', 'string', 'max:255'],
+            'task_no' => ['required', 'string', 'max:255', 'unique:tasks,task_no'],
+            'description' => ['nullable', 'string'],
+            'status' => ['required', \Illuminate\Validation\Rule::enum(\App\Enums\TaskStatus::class)],
+            'priority' => ['required', \Illuminate\Validation\Rule::enum(\App\Enums\Priority::class)],
+            'due_date' => ['nullable', 'date'],
+            'task_type_id' => ['required', 'exists:task_types,id'],
+            'output_type_id' => ['nullable', 'exists:output_types,id'],
+        ];
+    }
+}
diff --git a/backend/app/Http/Requests/UpdateTaskRequest.php b/backend/app/Http/Requests/UpdateTaskRequest.php
new file mode 100644
index 0000000..088cd7d
--- /dev/null
+++ b/backend/app/Http/Requests/UpdateTaskRequest.php
@@ -0,0 +1,36 @@
+<?php
+
+namespace App\Http\Requests;
+
+use Illuminate\Contracts\Validation\ValidationRule;
+use Illuminate\Foundation\Http\FormRequest;
+
+class UpdateTaskRequest extends FormRequest
+{
+    /**
+     * Determine if the user is authorized to make this request.
+     */
+    public function authorize(): bool
+    {
+        return true;
+    }
+
+    /**
+     * Get the validation rules that apply to the request.
+     *
+     * @return array<string, ValidationRule|array<mixed>|string>
+     */
+    public function rules(): array
+    {
+        return [
+            'title' => ['sometimes', 'string', 'max:255'],
+            'task_no' => ['sometimes', 'string', 'max:255', 'unique:tasks,task_no,'.$this->route('task')->id],
+            'description' => ['nullable', 'string'],
+            'status' => ['sometimes', \Illuminate\Validation\Rule::enum(\App\Enums\TaskStatus::class)],
+            'priority' => ['sometimes', \Illuminate\Validation\Rule::enum(\App\Enums\Priority::class)],
+            'due_date' => ['nullable', 'date'],
+            'task_type_id' => ['sometimes', 'exists:task_types,id'],
+            'output_type_id' => ['nullable', 'exists:output_types,id'],
+        ];
+    }
+}
diff --git a/backend/app/Http/Resources/TaskAssignmentResource.php b/backend/app/Http/Resources/TaskAssignmentResource.php
new file mode 100644
index 0000000..72f0a74
--- /dev/null
+++ b/backend/app/Http/Resources/TaskAssignmentResource.php
@@ -0,0 +1,24 @@
+<?php
+
+namespace App\Http\Resources;
+
+use Illuminate\Http\Request;
+use Illuminate\Http\Resources\Json\JsonResource;
+
+class TaskAssignmentResource extends JsonResource
+{
+    public function toArray(Request $request): array
+    {
+        return [
+            'id' => $this->id,
+            'task_id' => $this->task_id,
+            'user_id' => $this->user_id,
+            'assigned_by' => $this->assigned_by,
+            'priority' => $this->priority,
+            'deadline' => $this->deadline,
+            'assigned_at' => $this->assigned_at,
+            'created_at' => $this->created_at,
+            'updated_at' => $this->updated_at,
+        ];
+    }
+}
diff --git a/backend/app/Http/Resources/TaskResource.php b/backend/app/Http/Resources/TaskResource.php
new file mode 100644
index 0000000..8befc5d
--- /dev/null
+++ b/backend/app/Http/Resources/TaskResource.php
@@ -0,0 +1,32 @@
+<?php
+
+namespace App\Http\Resources;
+
+use Illuminate\Http\Request;
+use Illuminate\Http\Resources\Json\JsonResource;
+
+class TaskResource extends JsonResource
+{
+    public function toArray(Request $request): array
+    {
+        return [
+            'id' => $this->id,
+            'project_id' => $this->project_id,
+            'task_no' => $this->task_no,
+            'title' => $this->title,
+            'description' => $this->description,
+            'status' => $this->status,
+            'priority' => $this->priority,
+            'due_date' => $this->due_date,
+            'task_type_id' => $this->task_type_id,
+            'output_type_id' => $this->output_type_id,
+            'created_by' => $this->created_by,
+            'created_at' => $this->created_at,
+            'updated_at' => $this->updated_at,
+            
+            // Relationships
+            'task_type' => $this->whenLoaded('taskType'),
+            'assignments' => TaskAssignmentResource::collection($this->whenLoaded('assignments')),
+        ];
+    }
+}
diff --git a/backend/app/Policies/TaskAssignmentPolicy.php b/backend/app/Policies/TaskAssignmentPolicy.php
new file mode 100644
index 0000000..b924724
--- /dev/null
+++ b/backend/app/Policies/TaskAssignmentPolicy.php
@@ -0,0 +1,35 @@
+<?php
+
+namespace App\Policies;
+
+use App\Models\TaskAssignment;
+use App\Models\User;
+use Illuminate\Auth\Access\Response;
+
+class TaskAssignmentPolicy
+{
+    public function viewAny(User $user, \App\Models\Task $task): bool
+    {
+        return $user->can('view', $task);
+    }
+
+    public function view(User $user, TaskAssignment $taskAssignment): bool
+    {
+        return $user->can('view', $taskAssignment->task);
+    }
+
+    public function create(User $user, \App\Models\Task $task): bool
+    {
+        return $user->can('update', $task->project);
+    }
+
+    public function update(User $user, TaskAssignment $taskAssignment): bool
+    {
+        return $user->can('update', $taskAssignment->task->project);
+    }
+
+    public function delete(User $user, TaskAssignment $taskAssignment): bool
+    {
+        return $user->can('update', $taskAssignment->task->project);
+    }
+}
diff --git a/backend/app/Policies/TaskPolicy.php b/backend/app/Policies/TaskPolicy.php
new file mode 100644
index 0000000..4a71c57
--- /dev/null
+++ b/backend/app/Policies/TaskPolicy.php
@@ -0,0 +1,44 @@
+<?php
+
+namespace App\Policies;
+
+use App\Models\Task;
+use App\Models\User;
+use Illuminate\Auth\Access\Response;
+
+class TaskPolicy
+{
+    public function viewAny(User $user): bool
+    {
+        return true;
+    }
+
+    public function viewAnyForProject(User $user, \App\Models\Project $project): bool
+    {
+        return $user->can('view', $project);
+    }
+
+    public function view(User $user, Task $task): bool
+    {
+        return $user->can('view', $task->project);
+    }
+
+    public function create(User $user, \App\Models\Project $project): bool
+    {
+        return $user->can('update', $project);
+    }
+
+    public function update(User $user, Task $task): bool
+    {
+        if ($user->can('update', $task->project)) {
+            return true;
+        }
+
+        return $task->assignments()->where('user_id', $user->id)->exists();
+    }
+
+    public function delete(User $user, Task $task): bool
+    {
+        return $user->can('update', $task->project);
+    }
+}
diff --git a/backend/loco_track b/backend/loco_track
index 18f3c4f..54188f6 100644
Binary files a/backend/loco_track and b/backend/loco_track differ
diff --git a/backend/routes/api.php b/backend/routes/api.php
index 76bea30..106d7f1 100644
--- a/backend/routes/api.php
+++ b/backend/routes/api.php
@@ -42,6 +42,15 @@
         Route::apiResource('projects.content-plans', \App\Http\Controllers\Api\V1\ContentPlanController::class)->scoped();
         Route::apiResource('projects.scripts', \App\Http\Controllers\Api\V1\ScriptController::class)->scoped();
         
+        // Tasks
+        Route::get('tasks', [\App\Http\Controllers\Api\V1\TaskController::class, 'indexGlobal']);
+        Route::apiResource('projects.tasks', \App\Http\Controllers\Api\V1\TaskController::class)->scoped();
+        
+        // Task Assignments
+        Route::apiResource('projects.tasks.assignments', \App\Http\Controllers\Api\V1\TaskAssignmentController::class)
+            ->only(['index', 'store', 'destroy'])
+            ->scoped();
+        
         // Financials
         Route::get('projects/{project}/financials', [\App\Http\Controllers\Api\V1\ProjectFinancialController::class, 'show']);
         Route::put('projects/{project}/financials', [\App\Http\Controllers\Api\V1\ProjectFinancialController::class, 'update']);
diff --git a/backend/tests/Feature/TaskApiTest.php b/backend/tests/Feature/TaskApiTest.php
new file mode 100644
index 0000000..f8f7720
--- /dev/null
+++ b/backend/tests/Feature/TaskApiTest.php
@@ -0,0 +1,148 @@
+<?php
+
+namespace Tests\Feature;
+
+use App\Models\Client;
+use App\Models\Project;
+use App\Models\ProjectType;
+use App\Models\User;
+use App\Models\Task;
+use App\Models\TaskType;
+use App\Models\OutputType;
+use App\Models\TaskAssignment;
+use Database\Seeders\RolePermissionSeeder;
+use Illuminate\Foundation\Testing\RefreshDatabase;
+use Tests\TestCase;
+use Laravel\Sanctum\Sanctum;
+
+class TaskApiTest extends TestCase
+{
+    use RefreshDatabase;
+
+    protected function setUp(): void
+    {
+        parent::setUp();
+        $this->seed(RolePermissionSeeder::class);
+    }
+
+    private function createProjectWithAe(): array
+    {
+        $ae = User::factory()->create();
+        $ae->assignRole('Account Executive');
+
+        $client = Client::create(['name' => 'Test Client']);
+        $projectType = ProjectType::create(['name' => 'Video Production']);
+
+        $project = Project::create([
+            'name' => 'Test Project',
+            'client_id' => $client->id,
+            'project_type_id' => $projectType->id,
+            'ae_id' => $ae->id,
+        ]);
+
+        return [$project, $ae];
+    }
+
+    public function test_assignee_can_update_task_status()
+    {
+        [$project, $ae] = $this->createProjectWithAe();
+        $taskType = TaskType::create(['name' => 'Editing']);
+        
+        $task = $project->tasks()->create([
+            'title' => 'Task 1',
+            'task_no' => 'TSK-001',
+            'task_type_id' => $taskType->id,
+            'status' => 'REQUEST',
+            'priority' => 'MID',
+            'created_by' => $ae->id,
+        ]);
+
+        $assignee = User::factory()->create();
+        $assignee->assignRole('Graphic Designer');
+
+        $task->assignments()->create([
+            'user_id' => $assignee->id,
+            'priority' => 'MID',
+            'assigned_by' => $ae->id,
+        ]);
+
+        Sanctum::actingAs($assignee);
+
+        $response = $this->putJson("/api/v1/projects/{$project->id}/tasks/{$task->id}", [
+            'status' => 'ON_PROGRESS',
+            'title' => 'Hacked Task Name',
+        ]);
+
+        $response->assertStatus(200);
+        $this->assertEquals('ON_PROGRESS', $task->fresh()->status->value);
+        // Assert title was NOT updated since assignee can only update status
+        $this->assertEquals('Task 1', $task->fresh()->title);
+    }
+
+    public function test_non_assignee_cannot_update_task()
+    {
+        [$project, $ae] = $this->createProjectWithAe();
+        $taskType = TaskType::create(['name' => 'Editing']);
+        
+        $task = $project->tasks()->create([
+            'title' => 'Task 1',
+            'task_no' => 'TSK-002',
+            'task_type_id' => $taskType->id,
+            'status' => 'REQUEST',
+            'priority' => 'MID',
+            'created_by' => $ae->id,
+        ]);
+
+        $otherUser = User::factory()->create();
+        $otherUser->assignRole('Graphic Designer'); // not manager, not assigned
+
+        Sanctum::actingAs($otherUser);
+
+        $response = $this->putJson("/api/v1/projects/{$project->id}/tasks/{$task->id}", [
+            'status' => 'ON_PROGRESS',
+        ]);
+
+        $response->assertStatus(403);
+    }
+
+    public function test_global_list_returns_only_assigned_tasks_for_regular_user()
+    {
+        [$project, $ae] = $this->createProjectWithAe();
+        $taskType = TaskType::create(['name' => 'Editing']);
+        
+        $task1 = $project->tasks()->create([
+            'title' => 'Assigned Task',
+            'task_no' => 'TSK-003',
+            'task_type_id' => $taskType->id,
+            'status' => 'REQUEST',
+            'priority' => 'MID',
+            'created_by' => $ae->id,
+        ]);
+
+        $task2 = $project->tasks()->create([
+            'title' => 'Unassigned Task',
+            'task_no' => 'TSK-004',
+            'task_type_id' => $taskType->id,
+            'status' => 'REQUEST',
+            'priority' => 'MID',
+            'created_by' => $ae->id,
+        ]);
+
+        $user = User::factory()->create();
+        $user->assignRole('Graphic Designer');
+
+        $task1->assignments()->create([
+            'user_id' => $user->id,
+            'priority' => 'MID',
+            'assigned_by' => $ae->id,
+        ]);
+
+        Sanctum::actingAs($user);
+
+        $response = $this->getJson("/api/v1/tasks");
+
+        $response->assertStatus(200);
+        $response->assertJsonCount(1, 'data.data');
+        $this->assertEquals('Assigned Task', $response->json('data.data.0.title'));
+    }
+}
