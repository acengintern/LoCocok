<?php

namespace Tests\Feature;

use App\Enums\UserStatus;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as SocialiteUser;
use Mockery;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class GoogleAuthTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    public function test_google_redirect_returns_redirect_response(): void
    {
        $provider = Mockery::mock(\Laravel\Socialite\Two\GoogleProvider::class);
        $provider->shouldReceive('scopes')
            ->with(['openid', 'profile', 'email'])
            ->once()
            ->andReturnSelf();
        $provider->shouldReceive('stateless')
            ->once()
            ->andReturnSelf();
        $provider->shouldReceive('redirect')
            ->once()
            ->andReturn(redirect('https://accounts.google.com/o/oauth2/v2/auth?client_id=mock_client_id'));

        Socialite::shouldReceive('driver')
            ->with('google')
            ->once()
            ->andReturn($provider);

        $response = $this->get('/api/v1/auth/google/redirect');

        $response->assertStatus(302);
        $this->assertStringContainsString('accounts.google.com', $response->headers->get('Location'));
    }

    public function test_google_callback_creates_new_user_with_staff_role(): void
    {
        $googleUser = Mockery::mock(SocialiteUser::class);
        $googleUser->shouldReceive('getId')->andReturn('google-id-12345');
        $googleUser->shouldReceive('getName')->andReturn('Jane Doe');
        $googleUser->shouldReceive('getNickname')->andReturn('janedoe');
        $googleUser->shouldReceive('getEmail')->andReturn('jane.doe@example.com');
        $googleUser->shouldReceive('getAvatar')->andReturn('https://lh3.googleusercontent.com/avatar123.jpg');

        $provider = Mockery::mock(\Laravel\Socialite\Two\GoogleProvider::class);
        $provider->shouldReceive('stateless')->once()->andReturnSelf();
        $provider->shouldReceive('user')->once()->andReturn($googleUser);

        Socialite::shouldReceive('driver')
            ->with('google')
            ->once()
            ->andReturn($provider);

        $response = $this->get('/api/v1/auth/google/callback');

        $response->assertStatus(302);
        $location = $response->headers->get('Location');
        $this->assertStringContainsString('/auth/callback?token=', $location);
        $this->assertStringContainsString('&status=success', $location);

        $user = User::where('email', 'jane.doe@example.com')->first();
        $this->assertNotNull($user);
        $this->assertEquals('Jane Doe', $user->name);
        $this->assertEquals('google-id-12345', $user->google_id);
        $this->assertEquals('https://lh3.googleusercontent.com/avatar123.jpg', $user->avatar);
        $this->assertEquals(UserStatus::ACTIVE, $user->status);
        $this->assertNotNull($user->email_verified_at);
        $this->assertNotNull($user->join_date);
        $this->assertTrue($user->hasRole('Staff'));
        $this->assertCount(1, $user->tokens);
    }

    public function test_google_callback_links_existing_active_user(): void
    {
        $existingUser = User::factory()->create([
            'email' => 'john.smith@example.com',
            'google_id' => null,
            'avatar' => null,
            'status' => UserStatus::ACTIVE,
            'email_verified_at' => null,
        ]);

        $googleUser = Mockery::mock(SocialiteUser::class);
        $googleUser->shouldReceive('getId')->andReturn('google-id-existing-999');
        $googleUser->shouldReceive('getName')->andReturn('John Smith');
        $googleUser->shouldReceive('getNickname')->andReturn('johnsmith');
        $googleUser->shouldReceive('getEmail')->andReturn('john.smith@example.com');
        $googleUser->shouldReceive('getAvatar')->andReturn('https://lh3.googleusercontent.com/john_avatar.jpg');

        $provider = Mockery::mock(\Laravel\Socialite\Two\GoogleProvider::class);
        $provider->shouldReceive('stateless')->once()->andReturnSelf();
        $provider->shouldReceive('user')->once()->andReturn($googleUser);

        Socialite::shouldReceive('driver')
            ->with('google')
            ->once()
            ->andReturn($provider);

        $response = $this->get('/api/v1/auth/google/callback');

        $response->assertStatus(302);
        $location = $response->headers->get('Location');
        $this->assertStringContainsString('/auth/callback?token=', $location);
        $this->assertStringContainsString('&status=success', $location);

        $existingUser->refresh();
        $this->assertEquals('google-id-existing-999', $existingUser->google_id);
        $this->assertEquals('https://lh3.googleusercontent.com/john_avatar.jpg', $existingUser->avatar);
        $this->assertNotNull($existingUser->email_verified_at);
        $this->assertCount(1, $existingUser->tokens);
    }

    public function test_google_callback_rejects_suspended_user(): void
    {
        $suspendedUser = User::factory()->create([
            'email' => 'suspended@example.com',
            'google_id' => 'google-suspended-123',
            'status' => UserStatus::SUSPENDED,
        ]);

        $googleUser = Mockery::mock(SocialiteUser::class);
        $googleUser->shouldReceive('getId')->andReturn('google-suspended-123');
        $googleUser->shouldReceive('getName')->andReturn('Suspended User');
        $googleUser->shouldReceive('getNickname')->andReturn('suspended');
        $googleUser->shouldReceive('getEmail')->andReturn('suspended@example.com');
        $googleUser->shouldReceive('getAvatar')->andReturn(null);

        $provider = Mockery::mock(\Laravel\Socialite\Two\GoogleProvider::class);
        $provider->shouldReceive('stateless')->once()->andReturnSelf();
        $provider->shouldReceive('user')->once()->andReturn($googleUser);

        Socialite::shouldReceive('driver')
            ->with('google')
            ->once()
            ->andReturn($provider);

        $response = $this->get('/api/v1/auth/google/callback');

        $response->assertStatus(302);
        $location = $response->headers->get('Location');
        $this->assertStringContainsString('/signin?error=account_suspended', $location);
        $this->assertCount(0, $suspendedUser->tokens);
    }

    public function test_google_callback_handles_socialite_exception_gracefully(): void
    {
        $provider = Mockery::mock(\Laravel\Socialite\Two\GoogleProvider::class);
        $provider->shouldReceive('stateless')->once()->andReturnSelf();
        $provider->shouldReceive('user')->once()->andThrow(new \Exception('Google OAuth failed'));

        Socialite::shouldReceive('driver')
            ->with('google')
            ->once()
            ->andReturn($provider);

        $response = $this->get('/api/v1/auth/google/callback');

        $response->assertStatus(302);
        $location = $response->headers->get('Location');
        $this->assertStringContainsString('/signin?error=oauth_failed', $location);
    }

    public function test_google_callback_generates_unique_username_when_slug_collides(): void
    {
        User::factory()->create([
            'username' => 'alice',
            'email' => 'alice.original@example.com',
        ]);

        $googleUser = Mockery::mock(SocialiteUser::class);
        $googleUser->shouldReceive('getId')->andReturn('google-alice-2');
        $googleUser->shouldReceive('getName')->andReturn('Alice In Wonderland');
        $googleUser->shouldReceive('getNickname')->andReturn('alice');
        $googleUser->shouldReceive('getEmail')->andReturn('alice@wonderland.com');
        $googleUser->shouldReceive('getAvatar')->andReturn(null);

        $provider = Mockery::mock(\Laravel\Socialite\Two\GoogleProvider::class);
        $provider->shouldReceive('stateless')->once()->andReturnSelf();
        $provider->shouldReceive('user')->once()->andReturn($googleUser);

        Socialite::shouldReceive('driver')
            ->with('google')
            ->once()
            ->andReturn($provider);

        $response = $this->get('/api/v1/auth/google/callback');

        $response->assertStatus(302);
        $newUser = User::where('email', 'alice@wonderland.com')->first();
        $this->assertNotNull($newUser);
        $this->assertEquals('alice1', $newUser->username);
    }

    public function test_google_callback_handles_missing_email(): void
    {
        $googleUser = Mockery::mock(SocialiteUser::class);
        $googleUser->shouldReceive('getId')->andReturn('google-no-email');
        $googleUser->shouldReceive('getEmail')->andReturn(null);

        $provider = Mockery::mock(\Laravel\Socialite\Two\GoogleProvider::class);
        $provider->shouldReceive('stateless')->once()->andReturnSelf();
        $provider->shouldReceive('user')->once()->andReturn($googleUser);

        Socialite::shouldReceive('driver')
            ->with('google')
            ->once()
            ->andReturn($provider);

        $response = $this->get('/api/v1/auth/google/callback');

        $response->assertStatus(302);
        $location = $response->headers->get('Location');
        $this->assertStringContainsString('/signin?error=oauth_failed', $location);
    }
}
