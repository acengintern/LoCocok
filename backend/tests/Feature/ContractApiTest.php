<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\Contract;
use App\Models\Project;
use App\Models\ProjectType;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ContractApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);
    }

    private function createDependencies(): array
    {
        $client = Client::create(['name' => 'Test Client']);
        $projectType = ProjectType::create(['name' => 'Video Production']);
        
        return [$client, $projectType];
    }

    public function test_contract_creation_succeeds_for_admin_or_assigned_ae()
    {
        $admin = User::factory()->create();
        $admin->assignRole('System Administrator');

        [$client, $projectType] = $this->createDependencies();

        $project = Project::create([
            'name' => 'Test Project',
            'client_id' => $client->id,
            'project_type_id' => $projectType->id,
        ]);

        Sanctum::actingAs($admin);

        $response = $this->postJson("/api/v1/projects/{$project->id}/contracts", [
            'mou_number' => 'MOU-1234',
            'start_date' => '2026-01-01',
            'end_date' => '2026-12-31',
            'value' => 50000,
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('contracts', [
            'project_id' => $project->id,
            'client_id' => $client->id,
            'mou_number' => 'MOU-1234',
            'value' => 50000,
        ]);
    }

    public function test_contract_creation_fails_for_normal_user_or_unassigned_ae()
    {
        $normalUser = User::factory()->create();
        // Just a normal user without permission

        [$client, $projectType] = $this->createDependencies();

        $project = Project::create([
            'name' => 'Test Project',
            'client_id' => $client->id,
            'project_type_id' => $projectType->id,
        ]);

        Sanctum::actingAs($normalUser);

        $response = $this->postJson("/api/v1/projects/{$project->id}/contracts", [
            'mou_number' => 'MOU-5678',
        ]);

        $response->assertStatus(403);
    }

    public function test_validation_works()
    {
        $admin = User::factory()->create();
        $admin->assignRole('System Administrator');

        [$client, $projectType] = $this->createDependencies();

        $project = Project::create([
            'name' => 'Test Project',
            'client_id' => $client->id,
            'project_type_id' => $projectType->id,
        ]);

        Sanctum::actingAs($admin);

        // end_date before start_date should fail
        $response = $this->postJson("/api/v1/projects/{$project->id}/contracts", [
            'start_date' => '2026-12-31',
            'end_date' => '2026-01-01',
            'value' => -100, // min:0 should fail
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['end_date', 'value']);
    }

    public function test_accessing_contract_of_another_project_yields_404()
    {
        $admin = User::factory()->create();
        $admin->assignRole('System Administrator');

        [$client, $projectType] = $this->createDependencies();

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

        $contractA = Contract::create([
            'client_id' => $client->id,
            'project_id' => $projectA->id,
            'mou_number' => 'MOU-A',
        ]);

        Sanctum::actingAs($admin);

        // Accessing contract A using project B URL
        $response = $this->getJson("/api/v1/projects/{$projectB->id}/contracts/{$contractA->id}");

        $response->assertStatus(404);
    }

    public function test_can_view_update_and_delete_contract()
    {
        $admin = User::factory()->create();
        $admin->assignRole('System Administrator');

        [$client, $projectType] = $this->createDependencies();

        $project = Project::create([
            'name' => 'Test Project',
            'client_id' => $client->id,
            'project_type_id' => $projectType->id,
        ]);

        $contract = Contract::create([
            'client_id' => $client->id,
            'project_id' => $project->id,
            'mou_number' => 'MOU-A',
            'value' => 1000,
        ]);

        Sanctum::actingAs($admin);

        // View
        $responseView = $this->getJson("/api/v1/projects/{$project->id}/contracts/{$contract->id}");
        $responseView->assertStatus(200)
                     ->assertJsonPath('data.mou_number', 'MOU-A');

        // Update
        $responseUpdate = $this->putJson("/api/v1/projects/{$project->id}/contracts/{$contract->id}", [
            'value' => 2000,
        ]);
        $responseUpdate->assertStatus(200);
        $this->assertDatabaseHas('contracts', [
            'id' => $contract->id,
            'value' => 2000,
        ]);

        // Delete
        $responseDelete = $this->deleteJson("/api/v1/projects/{$project->id}/contracts/{$contract->id}");
        $responseDelete->assertStatus(200);
        $this->assertSoftDeleted('contracts', [
            'id' => $contract->id,
        ]);
    }
}
