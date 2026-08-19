<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\Project;
use App\Models\ProjectType;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Laravel\Sanctum\Sanctum;

class ProjectApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);
    }

    public function test_can_create_project_with_valid_data()
    {
        $admin = User::factory()->create();
        $admin->assignRole('System Administrator');

        $client = Client::create(['name' => 'Test Client']);
        $projectType = ProjectType::create(['name' => 'Video Production']);

        Sanctum::actingAs($admin);

        $response = $this->postJson('/api/v1/projects', [
            'name' => 'New Project',
            'client_id' => $client->id,
            'project_type_id' => $projectType->id,
            'status' => 'BRIEF_RECEIVED',
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('projects', [
            'name' => 'New Project',
            'client_id' => $client->id,
            'project_type_id' => $projectType->id,
            'status' => 'BRIEF_RECEIVED',
        ]);
    }

    public function test_validation_fails_when_required_fields_missing()
    {
        $admin = User::factory()->create();
        $admin->assignRole('System Administrator');

        Sanctum::actingAs($admin);

        $response = $this->postJson('/api/v1/projects', [
            'name' => 'New Project',
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['client_id', 'project_type_id']);
    }

    public function test_assigned_ae_can_update_project()
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

        Sanctum::actingAs($ae);

        $response = $this->putJson('/api/v1/projects/' . $project->id, [
            'name' => 'Updated Project Name'
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('projects', [
            'id' => $project->id,
            'name' => 'Updated Project Name'
        ]);
    }

    public function test_unassigned_user_cannot_update_project()
    {
        $ae = User::factory()->create();
        $ae->assignRole('Account Executive');
        
        $otherUser = User::factory()->create();
        $otherUser->assignRole('Account Executive');

        $client = Client::create(['name' => 'Test Client']);
        $projectType = ProjectType::create(['name' => 'Video Production']);

        $project = Project::create([
            'name' => 'Test Project',
            'client_id' => $client->id,
            'project_type_id' => $projectType->id,
            'ae_id' => $ae->id,
        ]);

        Sanctum::actingAs($otherUser);

        $response = $this->putJson('/api/v1/projects/' . $project->id, [
            'name' => 'Hacked Project Name'
        ]);

        $response->assertStatus(403);
    }

    public function test_relationship_inclusion_via_query_string()
    {
        $admin = User::factory()->create();
        $admin->assignRole('System Administrator');

        $client = Client::create(['name' => 'Test Client']);
        $projectType = ProjectType::create(['name' => 'Video Production']);

        $project = Project::create([
            'name' => 'Test Project',
            'client_id' => $client->id,
            'project_type_id' => $projectType->id,
        ]);

        Sanctum::actingAs($admin);

        // Without include
        $response1 = $this->getJson('/api/v1/projects/' . $project->id);
        $response1->assertStatus(200);
        $response1->assertJsonMissing(['client']);

        // With include
        $response2 = $this->getJson('/api/v1/projects/' . $project->id . '?include=client');
        $response2->assertStatus(200);
        $this->assertEquals('Test Client', $response2->json('data.client.name'));
        
        // Ensure invalid include is ignored and doesn't crash
        $response3 = $this->getJson('/api/v1/projects/' . $project->id . '?include=invalidRelation');
        $response3->assertStatus(200);
    }
}
