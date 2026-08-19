<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\Project;
use App\Models\ProjectType;
use App\Models\User;
use App\Models\Brief;
use App\Models\ContentPlan;
use App\Models\Script;
use App\Models\OutputType;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Laravel\Sanctum\Sanctum;

class ContentPlanningApiTest extends TestCase
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

    public function test_authorized_user_can_create_brief()
    {
        [$project, $ae] = $this->createProjectWithAe();
        Sanctum::actingAs($ae);

        $response = $this->postJson("/api/v1/projects/{$project->id}/briefs", [
            'brief_text' => 'This is a test brief.',
            'objective' => 'Brand awareness',
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('briefs', [
            'project_id' => $project->id,
            'brief_text' => 'This is a test brief.',
            'objective' => 'Brand awareness',
            'created_by' => $ae->id,
        ]);
    }

    public function test_authorized_user_can_create_content_plan_with_output_type()
    {
        [$project, $ae] = $this->createProjectWithAe();
        Sanctum::actingAs($ae);

        $outputType = OutputType::create(['name' => 'Reels']);

        $response = $this->postJson("/api/v1/projects/{$project->id}/content-plans", [
            'title' => 'August Reels',
            'output_type_id' => $outputType->id,
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('content_plans', [
            'project_id' => $project->id,
            'title' => 'August Reels',
            'output_type_id' => $outputType->id,
            'created_by' => $ae->id,
        ]);
    }

    public function test_authorized_user_can_create_script()
    {
        [$project, $ae] = $this->createProjectWithAe();
        Sanctum::actingAs($ae);

        $response = $this->postJson("/api/v1/projects/{$project->id}/scripts", [
            'title' => 'Script 1',
            'status' => 'DRAFT',
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('scripts', [
            'project_id' => $project->id,
            'title' => 'Script 1',
            'status' => 'DRAFT',
            'created_by' => $ae->id,
        ]);
    }

    public function test_cross_project_fetching_yields_404()
    {
        [$project1, $ae] = $this->createProjectWithAe();
        $project2 = Project::create([
            'name' => 'Another Project',
            'client_id' => $project1->client_id,
            'project_type_id' => $project1->project_type_id,
            'ae_id' => $ae->id,
        ]);

        $brief = $project1->briefs()->create([
            'brief_text' => 'P1 Brief'
        ]);

        Sanctum::actingAs($ae);

        // Fetching brief belonging to project 1 under project 2
        $response = $this->getJson("/api/v1/projects/{$project2->id}/briefs/{$brief->id}");
        
        $response->assertStatus(404);
    }

    public function test_unauthorized_user_yields_403()
    {
        [$project, $ae] = $this->createProjectWithAe();
        
        $brief = $project->briefs()->create([
            'brief_text' => 'Original',
        ]);

        $otherAe = User::factory()->create();
        $otherAe->assignRole('Account Executive');

        Sanctum::actingAs($otherAe);

        $response = $this->putJson("/api/v1/projects/{$project->id}/briefs/{$brief->id}", [
            'brief_text' => 'Hacked brief',
        ]);

        $response->assertStatus(403);
    }

    public function test_can_update_and_delete_brief()
    {
        [$project, $ae] = $this->createProjectWithAe();
        Sanctum::actingAs($ae);

        $brief = $project->briefs()->create([
            'brief_text' => 'Old brief'
        ]);

        $updateResponse = $this->putJson("/api/v1/projects/{$project->id}/briefs/{$brief->id}", [
            'brief_text' => 'New brief'
        ]);
        $updateResponse->assertStatus(200);
        $this->assertEquals('New brief', $brief->fresh()->brief_text);

        $deleteResponse = $this->deleteJson("/api/v1/projects/{$project->id}/briefs/{$brief->id}");
        $deleteResponse->assertStatus(200);
        $this->assertSoftDeleted('briefs', ['id' => $brief->id]);
    }
}
