<?php

namespace Tests\Feature;

use App\Models\Brief;
use App\Models\Client;
use App\Models\ContentPlan;
use App\Models\File;
use App\Models\FileVersion;
use App\Models\OutputType;
use App\Models\Project;
use App\Models\ProjectType;
use App\Models\Script;
use App\Models\Task;
use App\Models\TaskType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class UatSimulationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->seed(\Database\Seeders\RolePermissionSeeder::class);

        Storage::fake('public');
    }

    public function test_complete_uat_business_workflow()
    {
        // Setup Roles
        $admin = User::factory()->create();
        $admin->assignRole('System Administrator');

        $ae = User::factory()->create();
        $ae->assignRole('Account Executive');

        $cd = User::factory()->create();
        $cd->assignRole('Creative Director');

        $designer = User::factory()->create();
        $designer->assignRole('Graphic Designer');

        // Create Master Data
        $projectType = \App\Models\ProjectType::create(['name' => 'Retainer']);
        $outputType = \App\Models\OutputType::create(['name' => 'Video']);
        $taskType = \App\Models\TaskType::create(['name' => 'Design', 'code' => 'DSG']);
        $fileType = \App\Models\FileType::create(['name' => 'Image']);

        // UAT 01: Login (Simulated via actingAs below)

        // UAT 02: Create Client (AE)
        $clientResponse = $this->actingAs($ae)->postJson('/api/v1/clients', [
            'name' => 'Acme Corp',
            'company_name' => 'Acme Corporation',
            'pic_ae_id' => $ae->id,
            'status' => 'ACTIVE'
        ]);
        $clientResponse->assertStatus(201);
        $clientId = $clientResponse->json('data.id');

        // UAT 03: Create Project (AE)
        $projectType = ProjectType::first();
        $projectResponse = $this->actingAs($ae)->postJson('/api/v1/projects', [
            'name' => 'Q3 Campaign',
            'client_id' => $clientId,
            'project_type_id' => $projectType->id,
            'ae_id' => $ae->id,
            'start_date' => now()->format('Y-m-d'),
            'priority' => 'HIGH',
            'status' => 'BRIEF_RECEIVED'
        ]);
        $projectResponse->assertStatus(201);
        $projectId = $projectResponse->json('data.id');

        // UAT 04: Assign CD (AE)
        $this->actingAs($ae)->putJson("/api/v1/projects/{$projectId}", [
            'name' => 'Q3 Campaign',
            'client_id' => $clientId,
            'project_type_id' => $projectType->id,
            'ae_id' => $ae->id,
            'cd_id' => $cd->id,
            'status' => 'CONTENT_PLANNING'
        ])->assertStatus(200);

        // UAT 05: Add Output Target (CD)
        $outputResponse = $this->actingAs($cd)->postJson("/api/v1/projects/{$projectId}/outputs", [
            'output_type_id' => $outputType->id,
            'period' => 'Q3',
            'target_quantity' => 10
        ]);
        $outputResponse->assertStatus(201);

        // UAT 06: Create Brief (AE)
        $briefResponse = $this->actingAs($ae)->postJson("/api/v1/projects/{$projectId}/briefs", [
            'title' => 'Main Campaign Brief',
            'objective' => 'Increase sales',
            'status' => 'DRAFT'
        ]);
        $briefResponse->assertStatus(201);

        // UAT 07: Create Content Plan (CD)
        $planResponse = $this->actingAs($cd)->postJson("/api/v1/projects/{$projectId}/content-plans", [
            'title' => 'Social Media Plan',
            'output_type_id' => $outputType->id,
            'status' => 'DRAFT'
        ]);
        $planResponse->assertStatus(201);
        $planId = $planResponse->json('data.id');

        // UAT 08: Create Script (CD)
        $scriptResponse = $this->actingAs($cd)->postJson("/api/v1/projects/{$projectId}/scripts", [
            'content_plan_id' => $planId,
            'title' => 'Video Script 1',
            'scene_number' => '1',
            'visual' => 'Logo',
            'audio' => 'Music',
            'status' => 'DRAFT'
        ]);
        $scriptResponse->assertStatus(201);

        // UAT 09: Create Task (CD)
        $taskResponse = $this->actingAs($cd)->postJson("/api/v1/projects/{$projectId}/tasks", [
            'task_no' => 'TSK-001',
            'title' => 'Design Logo',
            'task_type_id' => $taskType->id,
            'priority' => 'HIGH',
            'status' => 'REQUEST',
            'quantity' => 1
        ]);
        $taskResponse->assertStatus(201);
        $taskId = $taskResponse->json('data.id');

        // UAT 10: Assign Task (CD)
        $assignResponse = $this->actingAs($cd)->postJson("/api/v1/projects/{$projectId}/tasks/{$taskId}/assignments", [
            'user_id' => $designer->id,
            'priority' => 'HIGH',
            'deadline' => now()->addDays(2)->format('Y-m-d')
        ]);
        $assignResponse->assertStatus(201);

        // Update task status to ON_PROGRESS (Designer)
        $this->actingAs($designer)->putJson("/api/v1/projects/{$projectId}/tasks/{$taskId}", [
            'project_id' => $projectId,
            'title' => 'Design Logo',
            'task_type_id' => $taskType->id,
            'status' => 'ON_PROGRESS'
        ])->assertStatus(200);

        // UAT 11: Upload File (Designer)
        $fileResponse = $this->actingAs($designer)->postJson("/api/v1/projects/{$projectId}/files", [
            'task_id' => $taskId,
            'file_type_id' => $fileType->id,
            'name' => 'Logo Draft',
            'file' => UploadedFile::fake()->image('logo.jpg')
        ]);
        $fileResponse->assertStatus(201);
        $fileId = $fileResponse->json('data.id');
        $version1Id = $fileResponse->json('data.current_version.id');

        // Designer marks task for PREVIEW_CD
        $this->actingAs($designer)->putJson("/api/v1/projects/{$projectId}/tasks/{$taskId}", [
            'project_id' => $projectId,
            'title' => 'Design Logo',
            'task_type_id' => $taskType->id,
            'status' => 'PREVIEW_CD'
        ])->assertStatus(200);

        // UAT 12: Request Revision (CD)
        $revisionResponse = $this->actingAs($cd)->postJson("/api/v1/file_versions/{$version1Id}/revisions", [
            'revision_notes' => 'Make it bigger'
        ]);
        $revisionResponse->assertStatus(201);

        // Designer sees revision, marks task ON_PROGRESS again
        $this->actingAs($designer)->putJson("/api/v1/projects/{$projectId}/tasks/{$taskId}", [
            'project_id' => $projectId,
            'title' => 'Design Logo',
            'task_type_id' => $taskType->id,
            'status' => 'ON_PROGRESS'
        ])->assertStatus(200);

        // UAT 13: Upload Version (Designer)
        $versionResponse = $this->actingAs($designer)->postJson("/api/v1/projects/{$projectId}/files/{$fileId}/versions", [
            'file' => UploadedFile::fake()->image('logo_v2.jpg')
        ]);
        $versionResponse->assertStatus(201);
        $version2Id = $versionResponse->json('data.id');

        // Designer marks task for PREVIEW_CD
        $this->actingAs($designer)->putJson("/api/v1/projects/{$projectId}/tasks/{$taskId}", [
            'project_id' => $projectId,
            'title' => 'Design Logo',
            'task_type_id' => $taskType->id,
            'status' => 'PREVIEW_CD'
        ])->assertStatus(200);

        // UAT 14: Approve File (CD)
        $approvalResponse = $this->actingAs($cd)->postJson("/api/v1/file_versions/{$version2Id}/approvals", [
            'status' => 'APPROVED',
            'comments' => 'Looks great'
        ]);
        $approvalResponse->assertStatus(201);

        // UAT 15: Complete Task (CD)
        $this->actingAs($cd)->putJson("/api/v1/projects/{$projectId}/tasks/{$taskId}", [
            'project_id' => $projectId,
            'title' => 'Design Logo',
            'task_type_id' => $taskType->id,
            'status' => 'DONE'
        ])->assertStatus(200);

        // UAT 16: Complete Project (AE)
        $this->actingAs($ae)->putJson("/api/v1/projects/{$projectId}", [
            'name' => 'Q3 Campaign',
            'client_id' => $clientId,
            'project_type_id' => $projectType->id,
            'ae_id' => $ae->id,
            'status' => 'DONE'
        ])->assertStatus(200);

        // Trigger a notification to the designer (mimicking event listener)
        $designer->notify(new \App\Notifications\DummyNotification('Task assigned'));

        // UAT 17: Check Notifications (Designer)
        $notifResponse = $this->actingAs($designer)->getJson('/api/v1/notifications');
        $notifResponse->assertStatus(200);
        $this->assertGreaterThanOrEqual(1, count($notifResponse->json('data')));

        // UAT 18: Dashboard Metrics (Admin)
        $dashboardResponse = $this->actingAs($admin)->getJson('/api/v1/dashboard/summary');
        $dashboardResponse->assertStatus(200);
        $this->assertArrayHasKey('total_projects', $dashboardResponse->json('data'));

        // UAT 19: Role Restrictions (Designer cannot edit project)
        $this->actingAs($designer)->putJson("/api/v1/projects/{$projectId}", [
            'name' => 'Hacked Name',
            'client_id' => $clientId,
            'project_type_id' => $projectType->id,
        ])->assertStatus(403);

        // UAT 20: Cross-Project Leak (Other AE cannot view this AE's project)
        $otherAe = User::factory()->create();
        $otherAe->assignRole('Account Executive');
        $this->actingAs($otherAe)->getJson("/api/v1/projects/{$projectId}")->assertStatus(403);
    }
}
