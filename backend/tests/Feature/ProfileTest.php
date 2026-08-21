<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\Project;
use App\Models\ProjectType;
use App\Models\Task;
use App\Models\TaskType;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ProfileTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);
    }

    public function test_user_can_update_profile_info()
    {
        $user = User::factory()->create([
            'name' => 'Original Name',
            'phone' => '0811111111',
            'division' => 'Operations',
            'bio' => 'Original bio text.',
        ]);

        Sanctum::actingAs($user);

        $payload = [
            'name' => 'Jane Agency Doe',
            'phone' => '08123456789',
            'division' => 'Creative & Design',
            'bio' => 'Senior Graphic Designer and Art Director.',
        ];

        $response = $this->putJson('/api/v1/users/me/profile', $payload);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Profile updated successfully',
                'data' => [
                    'id' => $user->id,
                    'name' => 'Jane Agency Doe',
                    'phone' => '08123456789',
                    'division' => 'Operations',
                    'bio' => 'Senior Graphic Designer and Art Director.',
                ],
            ]);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'Jane Agency Doe',
            'phone' => '08123456789',
            'division' => 'Operations',
            'bio' => 'Senior Graphic Designer and Art Director.',
        ]);
    }

    public function test_user_can_change_password_with_valid_current_password()
    {
        $user = User::factory()->create([
            'password' => Hash::make('old-password-123'),
        ]);

        Sanctum::actingAs($user);

        $payload = [
            'current_password' => 'old-password-123',
            'password' => 'new-secure-password-456',
            'password_confirmation' => 'new-secure-password-456',
        ];

        $response = $this->putJson('/api/v1/users/me/password', $payload);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Password updated successfully',
            ]);

        $this->assertTrue(Hash::check('new-secure-password-456', $user->fresh()->password));
    }

    public function test_user_cannot_change_password_with_invalid_current_password()
    {
        $user = User::factory()->create([
            'password' => Hash::make('actual-current-password'),
        ]);

        Sanctum::actingAs($user);

        $payload = [
            'current_password' => 'wrong-password',
            'password' => 'new-secure-password-456',
            'password_confirmation' => 'new-secure-password-456',
        ];

        $response = $this->putJson('/api/v1/users/me/password', $payload);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['current_password']);

        $this->assertTrue(Hash::check('actual-current-password', $user->fresh()->password));
    }

    public function test_user_without_existing_password_can_set_password_without_current_password()
    {
        $user = User::factory()->create([
            'password' => null,
            'google_id' => 'google-123456',
        ]);

        Sanctum::actingAs($user);

        $payload = [
            'password' => 'initial-set-password-123',
            'password_confirmation' => 'initial-set-password-123',
        ];

        $response = $this->putJson('/api/v1/users/me/password', $payload);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Password updated successfully',
            ]);

        $this->assertTrue(Hash::check('initial-set-password-123', $user->fresh()->password));
    }

    public function test_user_can_retrieve_workload_stats()
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();

        $client = Client::create(['name' => 'Acme Agency Client']);
        $projectType = ProjectType::create(['name' => 'Brand Activation']);
        $taskType = TaskType::create(['name' => 'Design & Visual']);

        // Project 1: User is AE
        $project1 = Project::create([
            'name' => 'Project Alpha',
            'client_id' => $client->id,
            'project_type_id' => $projectType->id,
            'ae_id' => $user->id,
            'status' => 'BRIEF_RECEIVED',
        ]);

        // Project 2: User is not AE/SMS/CD, but has assigned task
        $project2 = Project::create([
            'name' => 'Project Beta',
            'client_id' => $client->id,
            'project_type_id' => $projectType->id,
            'ae_id' => $otherUser->id,
            'status' => 'CONTENT_PLANNING',
        ]);

        // Project 3: Unrelated project
        Project::create([
            'name' => 'Project Gamma',
            'client_id' => $client->id,
            'project_type_id' => $projectType->id,
            'ae_id' => $otherUser->id,
            'status' => 'DONE',
        ]);

        // Task 1: In project 1, assigned to user, ON_PROGRESS
        $task1 = $project1->tasks()->create([
            'title' => 'Task One',
            'task_no' => 'TSK-001-P',
            'task_type_id' => $taskType->id,
            'status' => 'ON_PROGRESS',
            'created_by' => $user->id,
        ]);
        $task1->assignments()->create([
            'user_id' => $user->id,
            'assigned_by' => $user->id,
        ]);

        // Task 2: In project 2, assigned to user, DONE
        $task2 = $project2->tasks()->create([
            'title' => 'Task Two',
            'task_no' => 'TSK-002-P',
            'task_type_id' => $taskType->id,
            'status' => 'DONE',
            'created_by' => $otherUser->id,
        ]);
        $task2->assignments()->create([
            'user_id' => $user->id,
            'assigned_by' => $otherUser->id,
        ]);

        // Task 3: In project 1, assigned to other user, ON_PROGRESS
        $task3 = $project1->tasks()->create([
            'title' => 'Task Three',
            'task_no' => 'TSK-003-P',
            'task_type_id' => $taskType->id,
            'status' => 'ON_PROGRESS',
            'created_by' => $user->id,
        ]);
        $task3->assignments()->create([
            'user_id' => $otherUser->id,
            'assigned_by' => $user->id,
        ]);

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/v1/users/me/stats');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'total_projects' => 2, // project1 (ae_id and task created) + project2 (task assigned)
                    'total_tasks' => 2,    // task1 and task2 assigned to user
                    'completed_tasks' => 1,// task2 is DONE
                    'pending_tasks' => 1,  // task1 is ON_PROGRESS
                ],
            ]);
    }
}
