<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Laravel\Sanctum\Sanctum;

class ClientApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);
    }

    public function test_assigned_ae_can_update_client()
    {
        // Create users
        $ae = User::factory()->create();
        $ae->assignRole('Account Executive');

        // Create client assigned to ae
        $client = Client::create([
            'name' => 'Test Client',
            'pic_ae_id' => $ae->id,
            'status' => 'ACTIVE'
        ]);

        Sanctum::actingAs($ae);

        $response = $this->putJson('/api/v1/clients/' . $client->id, [
            'name' => 'Updated Client Name'
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('clients', [
            'id' => $client->id,
            'name' => 'Updated Client Name'
        ]);
    }

    public function test_unassigned_user_cannot_update_client()
    {
        // Create users
        $ae = User::factory()->create();
        $ae->assignRole('Account Executive');

        $otherUser = User::factory()->create();
        $otherUser->assignRole('Account Executive');

        // Create client assigned to ae
        $client = Client::create([
            'name' => 'Test Client',
            'pic_ae_id' => $ae->id,
            'status' => 'ACTIVE'
        ]);

        Sanctum::actingAs($otherUser);

        $response = $this->putJson('/api/v1/clients/' . $client->id, [
            'name' => 'Updated Client Name'
        ]);

        $response->assertStatus(403);
    }

    public function test_admin_can_update_any_client()
    {
        $ae = User::factory()->create();
        $ae->assignRole('Account Executive');

        $admin = User::factory()->create();
        $admin->assignRole('System Administrator');

        $client = Client::create([
            'name' => 'Test Client',
            'pic_ae_id' => $ae->id,
            'status' => 'ACTIVE'
        ]);

        Sanctum::actingAs($admin);

        $response = $this->putJson('/api/v1/clients/' . $client->id, [
            'name' => 'Updated Client Name by Admin'
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('clients', [
            'id' => $client->id,
            'name' => 'Updated Client Name by Admin'
        ]);
    }

    public function test_can_get_clients_list()
    {
        $admin = User::factory()->create();
        $admin->assignRole('System Administrator');

        Client::create(['name' => 'Client 1']);
        Client::create(['name' => 'Client 2']);

        Sanctum::actingAs($admin);

        $response = $this->getJson('/api/v1/clients');

        $response->assertStatus(200)
                 ->assertJsonStructure(['data' => [['id', 'name']]]);
        $this->assertCount(2, $response->json('data'));
    }

    public function test_validation_when_creating_client()
    {
        $admin = User::factory()->create();
        $admin->assignRole('System Administrator');

        Sanctum::actingAs($admin);

        $response = $this->postJson('/api/v1/clients', []);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['name']);
    }

    public function test_can_delete_client()
    {
        $admin = User::factory()->create();
        $admin->assignRole('System Administrator');

        $client = Client::create(['name' => 'To Be Deleted']);

        Sanctum::actingAs($admin);

        $response = $this->deleteJson('/api/v1/clients/' . $client->id);

        $response->assertStatus(200);
        $this->assertSoftDeleted('clients', ['id' => $client->id]);
    }
}
