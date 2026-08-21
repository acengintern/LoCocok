<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class RolePermissionApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);
    }

    public function test_admin_can_list_roles_and_permissions()
    {
        $admin = User::factory()->create();
        $admin->assignRole('System Administrator');

        $roleRes = $this->actingAs($admin)->getJson('/api/v1/roles');
        $roleRes->assertStatus(200)
                ->assertJsonStructure(['data', 'message', 'success']);

        $permRes = $this->actingAs($admin)->getJson('/api/v1/permissions');
        $permRes->assertStatus(200)
                ->assertJsonStructure(['data', 'message', 'success']);
    }

    public function test_admin_can_create_and_update_role()
    {
        $admin = User::factory()->create();
        $admin->assignRole('System Administrator');

        // Create
        $createRes = $this->actingAs($admin)->postJson('/api/v1/roles', [
            'name' => 'QA Specialist',
            'permissions' => ['view', 'approve']
        ]);
        $createRes->assertStatus(201)
                  ->assertJsonPath('data.name', 'QA Specialist');

        $role = Role::where('name', 'QA Specialist')->first();
        $this->assertNotNull($role);
        $this->assertTrue($role->hasPermissionTo('view'));
        $this->assertTrue($role->hasPermissionTo('approve'));

        // Update
        $updateRes = $this->actingAs($admin)->putJson("/api/v1/roles/{$role->id}", [
            'name' => 'Lead QA Specialist',
            'permissions' => ['view', 'approve', 'edit']
        ]);
        $updateRes->assertStatus(200)
                  ->assertJsonPath('data.name', 'Lead QA Specialist');
        
        $this->assertTrue($role->fresh()->hasPermissionTo('edit'));
    }

    public function test_system_administrator_role_is_protected()
    {
        $admin = User::factory()->create();
        $admin->assignRole('System Administrator');

        $sysAdminRole = Role::where('name', 'System Administrator')->first();

        // Attempt rename
        $renameRes = $this->actingAs($admin)->putJson("/api/v1/roles/{$sysAdminRole->id}", [
            'name' => 'Super User'
        ]);
        $renameRes->assertStatus(422);

        // Attempt delete
        $deleteRes = $this->actingAs($admin)->deleteJson("/api/v1/roles/{$sysAdminRole->id}");
        $deleteRes->assertStatus(422);
    }

    public function test_admin_can_assign_and_revoke_permissions_per_role()
    {
        $admin = User::factory()->create();
        $admin->assignRole('System Administrator');

        $role = Role::firstOrCreate(['name' => 'Content Creator', 'guard_name' => 'web']);
        $perm = Permission::where('name', 'publish')->first();

        // Assign
        $assignRes = $this->actingAs($admin)->postJson("/api/v1/roles/{$role->id}/permissions", [
            'permission_id' => $perm->id
        ]);
        $assignRes->assertStatus(200);
        $this->assertTrue($role->fresh()->hasPermissionTo('publish'));

        // Revoke
        $revokeRes = $this->actingAs($admin)->deleteJson("/api/v1/roles/{$role->id}/permissions/{$perm->id}");
        $revokeRes->assertStatus(200);
        $this->assertFalse($role->fresh()->hasPermissionTo('publish'));
    }

    public function test_admin_can_create_and_delete_permissions()
    {
        $admin = User::factory()->create();
        $admin->assignRole('System Administrator');

        // Create
        $createRes = $this->actingAs($admin)->postJson('/api/v1/permissions', [
            'name' => 'export-analytics'
        ]);
        $createRes->assertStatus(201);
        $this->assertDatabaseHas('permissions', ['name' => 'export-analytics']);

        $perm = Permission::where('name', 'export-analytics')->first();

        // Delete
        $deleteRes = $this->actingAs($admin)->deleteJson("/api/v1/permissions/{$perm->id}");
        $deleteRes->assertStatus(200);
        $this->assertDatabaseMissing('permissions', ['name' => 'export-analytics']);
    }
}