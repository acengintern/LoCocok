<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

class PolymorphicApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->app->make(PermissionRegistrar::class)->forgetCachedPermissions();

        Permission::firstOrCreate(['name' => 'view']);
        Permission::firstOrCreate(['name' => 'manage']);
        Permission::firstOrCreate(['name' => 'update']);
    }

    public function test_valid_polymorphic_attachment_approvals()
    {
        $user = User::factory()->create();
        $user->givePermissionTo(['view', 'manage', 'update']);

        $taskType = \App\Models\TaskType::create(['name' => 'Design', 'code' => 'DSG']);

        $project = Project::factory()->create([
            'ae_id' => $user->id,
        ]);
        
        $task = Task::create([
            'project_id' => $project->id,
            'created_by' => $user->id,
            'task_no' => 'TSK-001',
            'title' => 'Test Task',
            'task_type_id' => $taskType->id,
            'priority' => \App\Enums\Priority::MID,
            'status' => \App\Enums\TaskStatus::REQUEST,
            'quantity' => 1,
        ]);

        $response = $this->actingAs($user)->postJson("/api/v1/tasks/{$task->id}/approvals", [
            'status' => 'APPROVED',
            'notes' => 'Looks good',
        ]);

        $response->assertStatus(201)
                 ->assertJsonPath('data.status', 'APPROVED');
                 
        $this->assertDatabaseHas('approvals', [
            'approvable_type' => Task::class,
            'approvable_id' => $task->id,
            'status' => 'APPROVED',
            'comments' => 'Looks good',
        ]);
    }

    public function test_invalid_target_type_throws_error()
    {
        $user = User::factory()->create();
        $user->givePermissionTo(['view', 'manage']);

        $response = $this->actingAs($user)->postJson("/api/v1/invalid_type/1/approvals", [
            'status' => 'APPROVED',
            'notes' => 'Looks good',
        ]);

        $response->assertStatus(400); 
    }

    public function test_unauthorized_user_cannot_approve_entity()
    {
        $owner = User::factory()->create();
        $owner->givePermissionTo(['view', 'manage', 'update']);

        $stranger = User::factory()->create();

        $taskType = \App\Models\TaskType::create(['name' => 'Design', 'code' => 'DSG2']);

        $project = Project::factory()->create([
            'ae_id' => $owner->id,
        ]);

        $task = Task::create([
            'project_id' => $project->id,
            'created_by' => $owner->id,
            'task_no' => 'TSK-002',
            'title' => 'Test Task 2',
            'task_type_id' => $taskType->id,
            'priority' => \App\Enums\Priority::MID,
            'status' => \App\Enums\TaskStatus::REQUEST,
            'quantity' => 1,
        ]);

        $response = $this->actingAs($stranger)->postJson("/api/v1/tasks/{$task->id}/approvals", [
            'status' => 'APPROVED',
            'notes' => 'I am a stranger',
        ]);

        $response->assertStatus(403);
    }
    
    public function test_valid_polymorphic_attachment_revisions()
    {
        $user = User::factory()->create();
        $user->givePermissionTo(['view', 'manage', 'update']);

        $taskType = \App\Models\TaskType::create(['name' => 'Design', 'code' => 'DSG3']);

        $project = Project::factory()->create([
            'ae_id' => $user->id,
        ]);
        
        $task = Task::create([
            'project_id' => $project->id,
            'created_by' => $user->id,
            'task_no' => 'TSK-003',
            'title' => 'Test Task 3',
            'task_type_id' => $taskType->id,
            'priority' => \App\Enums\Priority::MID,
            'status' => \App\Enums\TaskStatus::REQUEST,
            'quantity' => 1,
        ]);

        $response = $this->actingAs($user)->postJson("/api/v1/tasks/{$task->id}/revisions", [
            'revision_notes' => 'Please revise this',
        ]);

        $response->assertStatus(201)
                 ->assertJsonPath('data.revision_notes', 'Please revise this');
    }
}
