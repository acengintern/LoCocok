<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\ProjectCost;
use App\Models\ProjectFinancial;
use App\Models\ProjectPayment;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FinancialApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);
    }

    public function test_admin_can_view_and_modify_financials()
    {
        $admin = User::factory()->create();
        $admin->assignRole('System Administrator');
        $project = Project::factory()->create();

        $response = $this->actingAs($admin)->getJson("/api/v1/projects/{$project->id}/financials");
        $response->assertStatus(200);

        $updateResponse = $this->actingAs($admin)->putJson("/api/v1/projects/{$project->id}/financials", [
            'project_revenue' => 10000,
        ]);
        $updateResponse->assertStatus(200);
        $this->assertDatabaseHas('project_financials', [
            'project_id' => $project->id,
            'project_revenue' => 10000,
        ]);
    }

    public function test_admin_can_manage_payments()
    {
        $admin = User::factory()->create();
        $admin->assignRole('System Administrator');
        $project = Project::factory()->create();

        $response = $this->actingAs($admin)->postJson("/api/v1/projects/{$project->id}/payments", [
            'amount' => 5000,
            'status' => 'PENDING',
        ]);
        $response->assertStatus(201);
        $paymentId = $response->json('data.id');

        $this->actingAs($admin)->getJson("/api/v1/projects/{$project->id}/payments")->assertStatus(200);
        $this->actingAs($admin)->getJson("/api/v1/projects/{$project->id}/payments/{$paymentId}")->assertStatus(200);

        $this->actingAs($admin)->putJson("/api/v1/projects/{$project->id}/payments/{$paymentId}", [
            'amount' => 6000,
            'status' => 'PAID',
        ])->assertStatus(200);
        
        $this->assertDatabaseHas('project_payments', ['id' => $paymentId, 'amount' => 6000]);

        $this->actingAs($admin)->deleteJson("/api/v1/projects/{$project->id}/payments/{$paymentId}")->assertStatus(200);
        $this->assertDatabaseMissing('project_payments', ['id' => $paymentId]);
    }

    public function test_admin_can_manage_costs()
    {
        $admin = User::factory()->create();
        $admin->assignRole('System Administrator');
        $project = Project::factory()->create();

        $response = $this->actingAs($admin)->postJson("/api/v1/projects/{$project->id}/costs", [
            'description' => 'Test Cost',
            'amount' => 1000,
            'cost_type' => 'PRODUCTION',
        ]);
        $response->assertStatus(201);
        $costId = $response->json('data.id');

        $this->actingAs($admin)->putJson("/api/v1/projects/{$project->id}/costs/{$costId}", [
            'amount' => 2000,
        ])->assertStatus(200);
        
        $this->assertDatabaseHas('project_costs', ['id' => $costId, 'amount' => 2000]);

        $this->actingAs($admin)->deleteJson("/api/v1/projects/{$project->id}/costs/{$costId}")->assertStatus(200);
    }

    public function test_normal_users_receive_403()
    {
        $ae = User::factory()->create();
        $ae->assignRole('Account Executive');
        $project = Project::factory()->create(['ae_id' => $ae->id]);
        $this->actingAs($ae)->getJson("/api/v1/projects/{$project->id}/financials")->assertStatus(403);
        $this->actingAs($ae)->postJson("/api/v1/projects/{$project->id}/payments", [
            'amount' => 100,
            'status' => 'PENDING'
        ])->assertStatus(403);
        $this->actingAs($ae)->postJson("/api/v1/projects/{$project->id}/costs", [
            'description' => 'Test',
            'amount' => 100,
            'cost_type' => 'PRODUCTION'
        ])->assertStatus(403);
    }

    public function test_cross_project_checking_returns_404()
    {
        $admin = User::factory()->create();
        $admin->assignRole('System Administrator');
        $project1 = Project::factory()->create();
        $project2 = Project::factory()->create();

        $payment = ProjectPayment::create([
            'project_id' => $project1->id,
            'amount' => 100,
            'status' => 'PENDING',
        ]);

        $this->actingAs($admin)->getJson("/api/v1/projects/{$project2->id}/payments/{$payment->id}")->assertStatus(404);
        $this->actingAs($admin)->putJson("/api/v1/projects/{$project2->id}/payments/{$payment->id}", [
            'amount' => 200
        ])->assertStatus(404);
        $this->actingAs($admin)->deleteJson("/api/v1/projects/{$project2->id}/payments/{$payment->id}")->assertStatus(404);
    }
}
