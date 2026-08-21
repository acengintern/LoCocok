<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\Task;
use App\Models\TaskAssignment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ProfileTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_update_profile_info(): void
    {
        $user = User::factory()->create([
            'name' => 'Original Name',
            'phone' => null,
            'division' => null,
            'bio' => null,
        ]);

        Sanctum::actingAs($user);

        $response = $this->putJson('/api/v1/users/me/profile', [
            'name' => 'Updated Name',
            'phone' => '+6281234567890',
            'division' => 'Creative Production',
            'bio' => 'Lead Video Editor & Content Creator',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Profile updated successfully',
                'data' => [
                    'name' => 'Updated Name',
                    'phone' => '+6281234567890',
                    'division' => 'Creative Production',
                    'bio' => 'Lead Video Editor & Content Creator',
                ],
            ]);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'Updated Name',
            'phone' => '+6281234567890',
            'division' => 'Creative Production',
        ]);
    }

    public function test_user_can_change_password_with_valid_current_password(): void
    {
        $user = User::factory()->create([
            'password' => Hash::make('old-secret-123'),
        ]);

        Sanctum::actingAs($user);

        $response = $this->putJson('/api/v1/users/me/password', [
            'current_password' => 'old-secret-123',
            'password' => 'new-secret-456',
            'password_confirmation' => 'new-secret-456',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Password updated successfully',
            ]);

        $this->assertTrue(Hash::check('new-secret-456', $user->fresh()->password));
    }

    public function test_user_cannot_change_password_with_invalid_current_password(): void
    {
        $user = User::factory()->create([
            'password' => Hash::make('old-secret-123'),
        ]);

        Sanctum::actingAs($user);

        $response = $this->putJson('/api/v1/users/me/password', [
            'current_password' => 'wrong-password',
            'password' => 'new-secret-456',
            'password_confirmation' => 'new-secret-456',
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
            ]);

        $this->assertTrue(Hash::check('old-secret-123', $user->fresh()->password));
    }

    public function test_user_without_existing_password_can_set_password_without_current_password(): void
    {
        $user = User::factory()->create([
            'password' => null,
            'google_id' => '1234567890',
        ]);

        Sanctum::actingAs($user);

        $response = $this->putJson('/api/v1/users/me/password', [
            'current_password' => null,
            'password' => 'brand-new-password-123',
            'password_confirmation' => 'brand-new-password-123',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Password updated successfully',
            ]);

        $this->assertTrue(Hash::check('brand-new-password-123', $user->fresh()->password));
    }

    public function test_user_can_retrieve_workload_stats(): void
    {
        $user = User::factory()->create();

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/v1/users/me/stats');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'total_projects',
                    'total_tasks',
                    'completed_tasks',
                    'pending_tasks',
                ],
            ]);
    }
}
