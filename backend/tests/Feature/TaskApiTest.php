<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\Project;
use App\Models\ProjectType;
use App\Models\User;
use App\Models\Task;
use App\Models\TaskType;
use App\Models\OutputType;
use App\Models\TaskAssignment;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Laravel\Sanctum\Sanctum;

class TaskApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);
    }

    private function createProjectWithAe(): array
    {
        $ae = User::factory()->create();
        $ae->assignRole('Account Executive');

        $client = Client::create(['name' => 'Test Client']);
        $projectType = ProjectType::create(['name' => 'Video Production']);

        $project = Project::create([
            'name' => 'Test Project',
            'client_id' => $client->id,
            'project_type_id' => $projectType->id,
            'ae_id' => $ae->id,
        ]);

        return [$project, $ae];
    }

    public function test_assignee_can_update_task_status()
    {
        [$project, $ae] = $this->createProjectWithAe();
        $taskType = TaskType::create(['name' => 'Editing']);
        
        $task = $project->tasks()->create([
            'title' => 'Task 1',
            'task_no' => 'TSK-001',
            'task_type_id' => $taskType->id,
            'status' => 'REQUEST',
            'priority' => 'MID',
            'created_by' => $ae->id,
        ]);

        $assignee = User::factory()->create();
        $assignee->assignRole('Graphic Designer');

        $task->assignments()->create([
            'user_id' => $assignee->id,
            'priority' => 'MID',
            'assigned_by' => $ae->id,
        ]);

        Sanctum::actingAs($assignee);

        $response = $this->putJson("/api/v1/projects/{$project->id}/tasks/{$task->id}", [
            'status' => 'ON_PROGRESS',
            'title' => 'Hacked Task Name',
        ]);

        $response->assertStatus(200);
        $this->assertEquals('ON_PROGRESS', $task->fresh()->status->value);
        // Assert title was NOT updated since assignee can only update status
        $this->assertEquals('Task 1', $task->fresh()->title);
    }

    public function test_non_assignee_cannot_update_task()
    {
        [$project, $ae] = $this->createProjectWithAe();
        $taskType = TaskType::create(['name' => 'Editing']);
        
        $task = $project->tasks()->create([
            'title' => 'Task 1',
            'task_no' => 'TSK-002',
            'task_type_id' => $taskType->id,
            'status' => 'REQUEST',
            'priority' => 'MID',
            'created_by' => $ae->id,
        ]);

        $otherUser = User::factory()->create();
        $otherUser->assignRole('Graphic Designer'); // not manager, not assigned

        Sanctum::actingAs($otherUser);

        $response = $this->putJson("/api/v1/projects/{$project->id}/tasks/{$task->id}", [
            'status' => 'ON_PROGRESS',
        ]);

        $response->assertStatus(403);
    }

    public function test_global_list_returns_only_assigned_tasks_for_regular_user()
    {
        [$project, $ae] = $this->createProjectWithAe();
        $taskType = TaskType::create(['name' => 'Editing']);
        
        $task1 = $project->tasks()->create([
            'title' => 'Assigned Task',
            'task_no' => 'TSK-003',
            'task_type_id' => $taskType->id,
            'status' => 'REQUEST',
            'priority' => 'MID',
            'created_by' => $ae->id,
        ]);

        $task2 = $project->tasks()->create([
            'title' => 'Unassigned Task',
            'task_no' => 'TSK-004',
            'task_type_id' => $taskType->id,
            'status' => 'REQUEST',
            'priority' => 'MID',
            'created_by' => $ae->id,
        ]);

        $user = User::factory()->create();
        $user->assignRole('Graphic Designer');

        $task1->assignments()->create([
            'user_id' => $user->id,
            'priority' => 'MID',
            'assigned_by' => $ae->id,
        ]);

        Sanctum::actingAs($user);

        $response = $this->getJson("/api/v1/tasks");

        $response->assertStatus(200);
        $response->assertJsonCount(1, 'data.data');
        $this->assertEquals('Assigned Task', $response->json('data.data.0.title'));
    }
}
