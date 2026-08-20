<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Project;
use App\Models\Task;
use App\Models\ContentPlan;
use App\Models\Approval;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class DashboardApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();
        Role::firstOrCreate(['name' => 'System Administrator']);
        Role::firstOrCreate(['name' => 'Account Executive']);
    }

    public function test_admin_sees_company_wide_totals()
    {
        $admin = User::factory()->create();
        $admin->assignRole('System Administrator');

        // Create 2 projects
        Project::factory()->count(2)->create(['status' => 'CONTENT_PLANNING']);
        
        // Revenue is stored in project_financials which defaults to 0 but let's just insert one
        $project = Project::first();
        \Illuminate\Support\Facades\DB::table('project_financials')->insert([
            'project_id' => $project->id,
            'nett_project_revenue' => 15000,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        
        $response = $this->actingAs($admin, 'sanctum')->getJson('/api/v1/dashboard/summary');
        
        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'total_projects' => 2,
                    'active_projects' => 2,
                    'revenue' => 15000,
                    'pending_approvals' => 0
                ]
            ]);
            
        $responseWorkload = $this->actingAs($admin, 'sanctum')->getJson('/api/v1/dashboard/workload');
        $responseWorkload->assertStatus(200);
    }

    public function test_normal_user_sees_only_assigned_metrics()
    {
        $ae = User::factory()->create();
        $ae->assignRole('Account Executive');

        // Project assigned to AE
        Project::factory()->create([
            'ae_id' => $ae->id,
            'status' => 'CONTENT_PLANNING'
        ]);

        // Unassigned project
        Project::factory()->create([
            'status' => 'CONTENT_PLANNING'
        ]);
        
        $response = $this->actingAs($ae, 'sanctum')->getJson('/api/v1/dashboard/summary');
        
        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'active_projects' => 1,
                    'tasks_pending' => 0,
                    'content_plans_due_this_week' => 0
                ]
            ]);
    }
}
