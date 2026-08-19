<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\Project;
use App\Models\ProjectType;
use App\Models\OutputType;
use App\Models\ProjectOutput;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Laravel\Sanctum\Sanctum;

class OutputApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);
    }

    public function test_nested_output_creation_works_for_ae()
    {
        $ae = User::factory()->create();
        $ae->assignRole('Account Executive');

        $client = Client::create(['name' => 'Test Client']);
        $projectType = ProjectType::create(['name' => 'Video Production']);
        $outputType = OutputType::create(['name' => 'Social Media Video']);

        $project = Project::create([
            'name' => 'Test Project',
            'client_id' => $client->id,
            'project_type_id' => $projectType->id,
            'ae_id' => $ae->id,
        ]);

        Sanctum::actingAs($ae);

        $response = $this->postJson("/api/v1/projects/{$project->id}/outputs", [
            'output_type_id' => $outputType->id,
            'name' => 'Q1 Videos',
            'target_quantity' => 10,
            'actual_quantity' => 2,
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('project_outputs', [
            'project_id' => $project->id,
            'output_type_id' => $outputType->id,
            'period' => 'Q1 Videos',
            'target_qty' => 10,
            'actual_qty' => 2,
        ]);
        
        $response->assertJson([
            'data' => [
                'name' => 'Q1 Videos',
                'target_quantity' => 10,
                'actual_quantity' => 2,
            ]
        ]);
    }

    public function test_creation_fails_for_normal_non_team_user()
    {
        $ae = User::factory()->create();
        $ae->assignRole('Account Executive');
        
        $otherUser = User::factory()->create();
        $otherUser->assignRole('Account Executive');

        $client = Client::create(['name' => 'Test Client']);
        $projectType = ProjectType::create(['name' => 'Video Production']);
        $outputType = OutputType::create(['name' => 'Social Media Video']);

        $project = Project::create([
            'name' => 'Test Project',
            'client_id' => $client->id,
            'project_type_id' => $projectType->id,
            'ae_id' => $ae->id,
        ]);

        Sanctum::actingAs($otherUser);

        $response = $this->postJson("/api/v1/projects/{$project->id}/outputs", [
            'output_type_id' => $outputType->id,
            'name' => 'Q1 Videos',
            'target_quantity' => 10,
            'actual_quantity' => 2,
        ]);

        $response->assertStatus(403);
    }

    public function test_accessing_an_output_belonging_to_project_a_via_url_of_project_b_fails()
    {
        $admin = User::factory()->create();
        $admin->assignRole('System Administrator');

        $client = Client::create(['name' => 'Test Client']);
        $projectType = ProjectType::create(['name' => 'Video Production']);
        $outputType = OutputType::create(['name' => 'Social Media Video']);

        $projectA = Project::create([
            'name' => 'Project A',
            'client_id' => $client->id,
            'project_type_id' => $projectType->id,
        ]);
        
        $projectB = Project::create([
            'name' => 'Project B',
            'client_id' => $client->id,
            'project_type_id' => $projectType->id,
        ]);

        $outputA = ProjectOutput::create([
            'project_id' => $projectA->id,
            'output_type_id' => $outputType->id,
            'period' => 'Output A',
            'target_qty' => 5,
        ]);

        Sanctum::actingAs($admin);

        // Attempting to access outputA via projectB's URL
        $response = $this->getJson("/api/v1/projects/{$projectB->id}/outputs/{$outputA->id}");

        $response->assertStatus(404);
        
        // Attempting to update outputA via projectB's URL
        $response2 = $this->putJson("/api/v1/projects/{$projectB->id}/outputs/{$outputA->id}", [
            'target_quantity' => 10
        ]);
        
        $response2->assertStatus(404);
        
        // Attempting to delete outputA via projectB's URL
        $response3 = $this->deleteJson("/api/v1/projects/{$projectB->id}/outputs/{$outputA->id}");
        
        $response3->assertStatus(404);
    }
}
