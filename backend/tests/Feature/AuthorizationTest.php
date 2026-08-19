<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\User;
use Illuminate\Support\Facades\Gate;

class AuthorizationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('db:seed', ['--class' => 'RolePermissionSeeder']);
    }

    public function test_normal_user_cannot_view_any_users()
    {
        $user = User::factory()->create();
        $this->assertFalse($user->can('viewAny', User::class));
    }

    public function test_system_administrator_can_bypass_gate()
    {
        $admin = User::factory()->create();
        $admin->assignRole('System Administrator');
        $this->assertTrue($admin->can('viewAny', User::class));
    }

    public function test_user_can_view_themselves()
    {
        $user = User::factory()->create();
        $this->assertTrue($user->can('view', $user));
    }

    public function test_user_cannot_view_others_without_permission()
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        $this->assertFalse($user1->can('view', $user2));
    }
}
