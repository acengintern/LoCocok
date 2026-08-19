<?php

namespace Tests\Feature;

use App\Models\Team;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class MasterDataApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);
    }

    public function test_admin_can_list_teams()
    {
        $admin = User::factory()->create();
        $admin->assignRole('System Administrator');
        
        Team::factory()->count(3)->create();

        $response = $this->actingAs($admin)->getJson('/api/v1/master/teams');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'data' => [
                         '*' => ['id', 'name', 'description']
                     ]
                 ]);
    }

    public function test_admin_can_create_team()
    {
        $admin = User::factory()->create();
        $admin->assignRole('System Administrator');
        
        $data = [
            'name' => 'New Team',
            'description' => 'Test Description',
        ];

        $response = $this->actingAs($admin)->postJson('/api/v1/master/teams', $data);

        $response->assertStatus(201)
                 ->assertJsonFragment(['name' => 'New Team']);
                 
        $this->assertDatabaseHas('teams', ['name' => 'New Team']);
    }

    public function test_normal_user_cannot_create_team()
    {
        $user = User::factory()->create();
        $user->givePermissionTo('view'); // Does not have manage
        
        $data = [
            'name' => 'User Team',
            'description' => 'Test',
        ];

        $response = $this->actingAs($user)->postJson('/api/v1/master/teams', $data);

        $response->assertStatus(403);
    }

    public function test_validation_unique_name_requirement()
    {
        $admin = User::factory()->create();
        $admin->assignRole('System Administrator');
        
        Team::factory()->create(['name' => 'Existing Team']);

        $data = [
            'name' => 'Existing Team',
        ];

        $response = $this->actingAs($admin)->postJson('/api/v1/master/teams', $data);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['name']);
    }
    
    public function test_admin_can_update_team()
    {
        $admin = User::factory()->create();
        $admin->assignRole('System Administrator');
        
        $team = Team::factory()->create(['name' => 'Old Name']);

        $data = [
            'name' => 'Updated Name',
        ];

        $response = $this->actingAs($admin)->putJson("/api/v1/master/teams/{$team->id}", $data);

        $response->assertStatus(200)
                 ->assertJsonFragment(['name' => 'Updated Name']);
                 
        $this->assertDatabaseHas('teams', ['name' => 'Updated Name']);
    }
    
    public function test_admin_can_update_team_with_same_name()
    {
        $admin = User::factory()->create();
        $admin->assignRole('System Administrator');
        
        $team = Team::factory()->create(['name' => 'Same Name']);

        $data = [
            'name' => 'Same Name',
            'description' => 'Updated description'
        ];

        $response = $this->actingAs($admin)->putJson("/api/v1/master/teams/{$team->id}", $data);

        $response->assertStatus(200);
        $this->assertDatabaseHas('teams', ['description' => 'Updated description']);
    }

    public function test_admin_can_soft_delete_team()
    {
        $admin = User::factory()->create();
        $admin->assignRole('System Administrator');
        
        $team = Team::factory()->create();

        $response = $this->actingAs($admin)->deleteJson("/api/v1/master/teams/{$team->id}");

        $response->assertStatus(200);
                 
        $this->assertSoftDeleted('teams', ['id' => $team->id]);
    }
}
