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

    protected function setUp(): void
    {
        parent::setUp();
        config([
            'services.google.client_id' => 'mock_client_id',
            'services.google.client_secret' => 'mock_client_secret',
        ]);
        Role::firstOrCreate(['name' => 'Staff', 'guard_name' => 'web']);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    public function test_google_redirect_returns_error_if_not_configured(): void
    {
        config(['services.google.client_id' => null]);
        $response = $this->get('/api/v1/auth/google/redirect');
        $response->assertStatus(302);
        $this->assertStringContainsString('error=google_not_configured', $response->headers->get('Location'));
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

    public function test_google_callback_rejects_unregistered_email(): void
    {
        $googleUser = Mockery::mock(SocialiteUser::class);
        $googleUser->shouldReceive('getId')->andReturn('google-id-12345');
        $googleUser->shouldReceive('getName')->andReturn('Unknown User');
        $googleUser->shouldReceive('getNickname')->andReturn('unknown');
        $googleUser->shouldReceive('getEmail')->andReturn('unregistered@example.com');
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
        $this->assertStringContainsString('/signin?error=account_not_found', $location);
        $this->assertStringContainsString('email=unregistered%40example.com', $location);

        $this->assertDatabaseMissing('users', [
            'email' => 'unregistered@example.com',
        ]);
    }

    public function test_google_callback_links_and_logs_in_existing_active_user(): void
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
        $this->assertStringContainsString('/auth/callback?code=', $location);
        $this->assertStringContainsString('&status=success', $location);

        $existingUser->refresh();
        $this->assertEquals('google-id-existing-999', $existingUser->google_id);
        $this->assertEquals('https://lh3.googleusercontent.com/john_avatar.jpg', $existingUser->avatar);
        $this->assertNotNull($existingUser->email_verified_at);
        $this->assertCount(1, $existingUser->tokens);

        // Test exchanging the code for token
        preg_match('/code=([a-zA-Z0-9]+)/', $location, $matches);
        $code = $matches[1];

        $exchangeResponse = $this->postJson('/api/v1/auth/google/exchange', [
            'code' => $code,
        ]);
        $exchangeResponse->assertStatus(200);
        $exchangeResponse->assertJsonStructure(['success', 'token']);
        $this->assertTrue($exchangeResponse->json('success'));

        // Test invalid/expired code returns 400
        $invalidResponse = $this->postJson('/api/v1/auth/google/exchange', [
            'code' => 'invalid-or-expired-code-123',
        ]);
        $invalidResponse->assertStatus(400);
    }

    public function test_google_callback_rejects_trashed_user(): void
    {
        $trashedUser = User::factory()->create([
            'email' => 'trashed@example.com',
            'username' => 'trashed_user',
            'google_id' => null,
            'status' => UserStatus::ACTIVE,
        ]);
        $trashedUser->delete(); // Soft delete

        $this->assertSoftDeleted('users', ['id' => $trashedUser->id]);

        $googleUser = Mockery::mock(SocialiteUser::class);
        $googleUser->shouldReceive('getId')->andReturn('google-id-trashed-888');
        $googleUser->shouldReceive('getName')->andReturn('Trashed User');
        $googleUser->shouldReceive('getNickname')->andReturn('trashed_user');
        $googleUser->shouldReceive('getEmail')->andReturn('trashed@example.com');
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
        $this->assertStringContainsString('/signin?error=account_not_found', $location);
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
