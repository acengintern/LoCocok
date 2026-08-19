<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\File;
use App\Models\FileType;
use App\Models\FileVersion;
use App\Models\Project;
use App\Models\ProjectType;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class FileApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);
    }

    private function createProject($attributes = [])
    {
        $client = Client::create(['name' => 'Test Client']);
        $projectType = ProjectType::create(['name' => 'Video Production']);

        return Project::create(array_merge([
            'name' => 'Test Project',
            'client_id' => $client->id,
            'project_type_id' => $projectType->id,
        ], $attributes));
    }

    private function createFileType()
    {
        return FileType::create(['name' => 'Document']);
    }

    public function test_can_upload_file_to_project()
    {
        Storage::fake('local');

        $admin = User::factory()->create();
        $admin->assignRole('System Administrator');

        $project = $this->createProject();
        $fileType = $this->createFileType();

        $file = UploadedFile::fake()->create('document.pdf', 100);

        Sanctum::actingAs($admin);

        $response = $this->postJson("/api/v1/projects/{$project->id}/files", [
            'name' => 'My Document',
            'file_type_id' => $fileType->id,
            'file' => $file,
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.name', 'My Document');

        $this->assertDatabaseHas('files', [
            'name' => 'My Document',
            'project_id' => $project->id,
        ]);

        $this->assertDatabaseHas('file_versions', [
            'version_number' => 1,
        ]);

        $fileModel = File::first();
        Storage::disk('local')->assertExists($fileModel->path);
    }

    public function test_can_upload_new_version_increments_version_number()
    {
        Storage::fake('local');

        $admin = User::factory()->create();
        $admin->assignRole('System Administrator');

        $project = $this->createProject();
        $fileType = $this->createFileType();

        $file = UploadedFile::fake()->create('document.pdf', 100);
        
        Sanctum::actingAs($admin);
        
        $response = $this->postJson("/api/v1/projects/{$project->id}/files", [
            'name' => 'My Document',
            'file_type_id' => $fileType->id,
            'file' => $file,
        ]);

        $fileId = $response->json('data.id');

        $newFile = UploadedFile::fake()->create('document_v2.pdf', 150);
        $versionResponse = $this->postJson("/api/v1/projects/{$project->id}/files/{$fileId}/versions", [
            'file' => $newFile,
            'notes' => 'Updated document',
        ]);

        $versionResponse->assertStatus(201)
            ->assertJsonPath('data.version_number', 2)
            ->assertJsonPath('data.notes', 'Updated document');

        $this->assertDatabaseHas('file_versions', [
            'file_id' => $fileId,
            'version_number' => 2,
        ]);
        
        $fileModel = File::find($fileId);
        $this->assertEquals(2, $fileModel->currentVersion->version_number);
    }

    public function test_can_download_file_version()
    {
        Storage::fake('local');

        $admin = User::factory()->create();
        $admin->assignRole('System Administrator');

        $project = $this->createProject();
        $fileType = $this->createFileType();

        $file = UploadedFile::fake()->create('document.pdf', 100);
        
        Sanctum::actingAs($admin);
        
        $response = $this->postJson("/api/v1/projects/{$project->id}/files", [
            'name' => 'My Document',
            'file_type_id' => $fileType->id,
            'file' => $file,
        ]);

        $fileId = $response->json('data.id');
        $versionId = $response->json('data.current_version.id');

        $downloadResponse = $this->get("/api/v1/projects/{$project->id}/files/{$fileId}/versions/{$versionId}/download");
        $downloadResponse->assertStatus(200);
        
        $downloadResponse->assertHeader('Content-Disposition');
    }

    public function test_cannot_upload_file_without_permission()
    {
        Storage::fake('local');

        $user = User::factory()->create();
        // user has no role

        $project = $this->createProject();
        $fileType = $this->createFileType();

        $file = UploadedFile::fake()->create('document.pdf', 100);

        Sanctum::actingAs($user);

        $response = $this->postJson("/api/v1/projects/{$project->id}/files", [
            'name' => 'My Document',
            'file_type_id' => $fileType->id,
            'file' => $file,
        ]);

        $response->assertStatus(403);
    }

    public function test_project_team_member_can_upload_file()
    {
        Storage::fake('local');

        $user = User::factory()->create();
        $user->assignRole('Account Executive');
        
        $project = $this->createProject([
            'ae_id' => $user->id,
        ]);
        
        $fileType = $this->createFileType();

        $file = UploadedFile::fake()->create('document.pdf', 100);

        Sanctum::actingAs($user);

        $response = $this->postJson("/api/v1/projects/{$project->id}/files", [
            'name' => 'My Document',
            'file_type_id' => $fileType->id,
            'file' => $file,
        ]);

        $response->assertStatus(201);
    }
}
