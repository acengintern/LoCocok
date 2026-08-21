<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

use App\Models\User;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_verify_sanctum_csrf_cookie_is_accessible(): void
    {
        $response = $this->get('/sanctum/csrf-cookie');
        $response->assertStatus(204);
    }

    public function test_login_success(): void
    {
        $user = User::factory()->create([
            'password' => bcrypt('password123'),
        ]);

        $response = $this->withHeaders(['Referer' => 'http://localhost:3000'])->postJson('/api/v1/login', [
            'identifier' => $user->email,
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
                 ->assertJson([
                     'success' => true,
                     'message' => 'Login successful',
                 ]);
        
        $this->assertAuthenticatedAs($user);
    }

    public function test_login_failure(): void
    {
        $user = User::factory()->create([
            'password' => bcrypt('password123'),
        ]);

        $response = $this->withHeaders(['Referer' => 'http://localhost:3000'])->postJson('/api/v1/login', [
            'identifier' => $user->email,
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(401)
                 ->assertJson([
                     'success' => false,
                     'message' => 'Invalid credentials',
                 ]);
                 
        $this->assertGuest();
    }

    public function test_get_me(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->withHeaders(['Referer' => 'http://localhost:3000'])->getJson('/api/v1/me');

        $response->assertStatus(200)
                 ->assertJsonPath('data.email', $user->email)
                 ->assertJsonPath('success', true);
    }

    public function test_logout_success(): void
    {
        $user = User::factory()->create([
            'password' => bcrypt('password123'),
        ]);
        
        $this->withHeaders(['Referer' => 'http://localhost:3000'])->postJson('/api/v1/login', [
            'identifier' => $user->email,
            'password' => 'password123',
        ]);
        
        $response = $this->withHeaders(['Referer' => 'http://localhost:3000'])->postJson('/api/v1/logout');
        
        $response->assertStatus(200)
                 ->assertJson([
                     'success' => true,
                     'message' => 'Logout successful',
                 ]);
    }
}
