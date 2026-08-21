<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class UserApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Create required permissions for UserPolicy
        Permission::firstOrCreate(['name' => 'view']);
        Permission::firstOrCreate(['name' => 'create']);
        Permission::firstOrCreate(['name' => 'edit']);
        Permission::firstOrCreate(['name' => 'delete']);
        Permission::firstOrCreate(['name' => 'manage']);

        // Create Admin role
        $adminRole = Role::firstOrCreate(['name' => 'System Administrator']);
        $adminRole->givePermissionTo(['view', 'create', 'edit', 'delete', 'manage']);

        // Create normal user role (or just no role/permissions)
        $normalRole = Role::firstOrCreate(['name' => 'Normal User']);
        // No permissions
    }

    public function test_admin_can_view_users()
    {
        $admin = User::factory()->create();
        $admin->assignRole('System Administrator');
        User::factory()->count(3)->create();

        $response = $this->actingAs($admin)->getJson('/api/v1/users');

        $response->assertStatus(200)
                 ->assertJsonStructure(['data', 'message', 'success']);
    }

    public function test_normal_user_cannot_view_users()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->getJson('/api/v1/users');

        $response->assertStatus(403);
    }

    public function test_admin_can_create_user()
    {
        $admin = User::factory()->create();
        $admin->assignRole('System Administrator');

        $payload = [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'username' => 'johndoe123',
            'password' => 'password123',
            'status' => 'ACTIVE'
        ];

        $response = $this->actingAs($admin)->postJson('/api/v1/users', $payload);

        $response->assertStatus(201)
                 ->assertJsonPath('data.email', 'john@example.com');

        $this->assertDatabaseHas('users', ['email' => 'john@example.com']);
    }

    public function test_admin_can_assign_role_to_user()
    {
        $admin = User::factory()->create();
        $admin->assignRole('System Administrator');

        $targetUser = User::factory()->create();
        $roleToAssign = Role::firstOrCreate(['name' => 'Creative Director']);

        $response = $this->actingAs($admin)->postJson("/api/v1/users/{$targetUser->id}/roles", [
            'role' => 'Creative Director'
        ]);

        $response->assertStatus(200);
        $this->assertTrue($targetUser->fresh()->hasRole('Creative Director'));
    }

    public function test_normal_user_cannot_assign_role()
    {
        $normalUser = User::factory()->create();
        $targetUser = User::factory()->create();
        Role::firstOrCreate(['name' => 'Creative Director']);

        $response = $this->actingAs($normalUser)->postJson("/api/v1/users/{$targetUser->id}/roles", [
            'role' => 'Creative Director'
        ]);

        $response->assertStatus(403);
    }

    public function test_admin_can_remove_role_from_user()
    {
        $admin = User::factory()->create();
        $admin->assignRole('System Administrator');

        $targetUser = User::factory()->create();
        $roleToAssign = Role::firstOrCreate(['name' => 'Creative Director']);
        $targetUser->assignRole($roleToAssign);

        $response = $this->actingAs($admin)->deleteJson("/api/v1/users/{$targetUser->id}/roles/Creative Director");

        $response->assertStatus(200);
        $this->assertFalse($targetUser->fresh()->hasRole('Creative Director'));
    }

    public function test_user_can_be_soft_deleted()
    {
        $admin = User::factory()->create();
        $admin->assignRole('System Administrator');

        $targetUser = User::factory()->create();

        $response = $this->actingAs($admin)->deleteJson("/api/v1/users/{$targetUser->id}");

        $response->assertStatus(200);
        $this->assertSoftDeleted('users', ['id' => $targetUser->id]);
    }

    public function test_admin_can_recreate_soft_deleted_user()
    {
        $admin = User::factory()->create();
        $admin->assignRole('System Administrator');

        $user = User::factory()->create([
            'email' => 'recreate@example.com',
            'username' => 'recreateuser',
        ]);
        $user->delete();

        $this->assertSoftDeleted('users', ['id' => $user->id]);

        $payload = [
            'name' => 'Restored User',
            'email' => 'recreate@example.com',
            'username' => 'recreateuser',
            'password' => 'newpassword123',
            'status' => 'ACTIVE',
        ];

        $response = $this->actingAs($admin)->postJson('/api/v1/users', $payload);

        $response->assertStatus(201)
                 ->assertJsonPath('data.name', 'Restored User')
                 ->assertJsonPath('data.email', 'recreate@example.com');

        $this->assertDatabaseHas('users', [
            'email' => 'recreate@example.com',
            'name' => 'Restored User',
            'deleted_at' => null,
        ]);
    }
}
