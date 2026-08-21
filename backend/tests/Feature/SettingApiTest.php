<?php

namespace Tests\Feature;

use App\Models\Setting;
use App\Models\User;
use Database\Seeders\SettingSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class SettingApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_setting_model_exists_and_can_be_seeded()
    {
        $setting = Setting::create([
            'key' => 'agency_name',
            'value' => 'Loco Creative',
            'type' => 'string',
        ]);

        $this->assertDatabaseHas('settings', [
            'key' => 'agency_name',
            'value' => 'Loco Creative',
        ]);
    }

    public function test_setting_seeder_populates_default_settings()
    {
        $this->seed(SettingSeeder::class);

        $this->assertDatabaseHas('settings', [
            'key' => 'agency_name',
            'value' => 'Loco Creative Agency',
        ]);
        $this->assertDatabaseHas('settings', [
            'key' => 'contact_email',
            'value' => 'admin@lococreative.com',
        ]);
        $this->assertDatabaseHas('settings', [
            'key' => 'currency',
            'value' => 'IDR',
        ]);
    }

    public function test_can_get_and_update_settings_via_api()
    {
        $user = User::factory()->create();
        $role = Role::create(['name' => 'System Administrator']);
        $user->assignRole($role);

        Setting::create(['key' => 'agency_name', 'value' => 'Old Name']);

        // GET
        $response = $this->actingAs($user)->getJson('/api/v1/settings');
        $response->assertStatus(200)
            ->assertJsonPath('data.agency_name', 'Old Name');

        // POST
        $response = $this->actingAs($user)->postJson('/api/v1/settings', [
            'settings' => [
                'agency_name' => 'New Name',
                'currency' => 'USD',
            ],
        ]);
        $response->assertStatus(200);

        $this->assertDatabaseHas('settings', ['key' => 'agency_name', 'value' => 'New Name']);
        $this->assertDatabaseHas('settings', ['key' => 'currency', 'value' => 'USD']);
    }

    public function test_non_admin_cannot_update_settings()
    {
        $user = User::factory()->create();
        $role = Role::create(['name' => 'Staff']);
        $user->assignRole($role);

        $response = $this->actingAs($user)->postJson('/api/v1/settings', [
            'settings' => [
                'agency_name' => 'Hacked Name',
            ],
        ]);

        $response->assertStatus(403);
    }

    public function test_unauthenticated_user_cannot_access_settings()
    {
        $response = $this->getJson('/api/v1/settings');
        $response->assertStatus(401);

        $response = $this->postJson('/api/v1/settings', [
            'settings' => ['agency_name' => 'Hacked'],
        ]);
        $response->assertStatus(401);
    }

    public function test_update_settings_validation_errors()
    {
        $user = User::factory()->create();
        $role = Role::create(['name' => 'System Administrator']);
        $user->assignRole($role);

        // Missing settings key
        $response = $this->actingAs($user)->postJson('/api/v1/settings', []);
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['settings']);

        // Settings is not an array
        $response = $this->actingAs($user)->postJson('/api/v1/settings', [
            'settings' => 'not-an-array',
        ]);
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['settings']);
    }
}
