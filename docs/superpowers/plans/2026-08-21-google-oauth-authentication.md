# Google OAuth Authentication Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement end-to-end Google OAuth 2.0 login and registration with robust security validations (CSRF protection, suspended user checks, username collision safety, and default `Staff` role assignment).

**Architecture:** Laravel Socialite backend OAuth endpoints (`/api/v1/auth/google/redirect` & `/api/v1/auth/google/callback`) issuing Sanctum personal access tokens, integrated with Next.js App Router client auth flow (`/signin` & `/auth/callback`).

**Tech Stack:** Laravel 12/13, `laravel/socialite`, `laravel/sanctum`, Spatie Permission, Next.js 16 (App Router), React 19, TypeScript.

## Global Constraints
- Laravel API responses and redirects must adhere to secure OAuth2 standards.
- Newly registered Google users must be assigned the default role **`Staff`**.
- Inactive or suspended users (`status !== 'ACTIVE'`) must be blocked from logging in.
- All code must pass full automated tests (`php artisan test`) and frontend build (`npm run build`).

---

### Task 1: Backend Package Installation, Database Migration, and Services Config

**Files:**
- Modify: `backend/composer.json`
- Create: `backend/database/migrations/YYYY_MM_DD_HHMMSS_add_google_id_and_avatar_to_users_table.php`
- Modify: `backend/config/services.php`
- Modify: `backend/app/Models/User.php`

**Interfaces:**
- Produces: `google_id` and `avatar` columns on `users` table, `password` nullable.

- [ ] **Step 1: Install `laravel/socialite`**
Run: `composer require laravel/socialite` in `backend`.

- [ ] **Step 2: Create Migration for Google ID, Avatar, and Nullable Password**
Create migration `database/migrations/2026_08_21_000000_add_google_id_and_avatar_to_users_table.php`:
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('google_id')->nullable()->unique()->after('id');
            $table->string('avatar')->nullable()->after('join_date');
            $table->string('password')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['google_id', 'avatar']);
            $table->string('password')->nullable(false)->change();
        });
    }
};
```

- [ ] **Step 3: Update `config/services.php`**
Add Google OAuth config:
```php
'google' => [
    'client_id' => env('GOOGLE_CLIENT_ID'),
    'client_secret' => env('GOOGLE_CLIENT_SECRET'),
    'redirect' => env('GOOGLE_REDIRECT_URI', 'http://localhost:8000/api/v1/auth/google/callback'),
],
```

- [ ] **Step 4: Run Migration**
Run: `php artisan migrate` in `backend`.

- [ ] **Step 5: Commit**
Commit: `git commit -am "feat(auth): install socialite, add google_id and avatar migration, configure google services"`

---

### Task 2: Backend Controller, Routes, Security Logic, and Feature Tests

**Files:**
- Create: `backend/app/Http/Controllers/GoogleAuthController.php`
- Modify: `backend/routes/api.php`
- Create: `backend/tests/Feature/GoogleAuthTest.php`

**Interfaces:**
- Produces: `GET /api/v1/auth/google/redirect` and `GET /api/v1/auth/google/callback`.

- [ ] **Step 1: Write Feature Test (`backend/tests/Feature/GoogleAuthTest.php`)**
```php
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
        Role::create(['name' => 'Staff', 'guard_name' => 'web']);
    }

    public function test_google_redirect_returns_redirect_response(): void
    {
        $response = $this->get('/api/v1/auth/google/redirect');
        $response->assertRedirect();
    }

    public function test_google_callback_creates_new_user_with_staff_role(): void
    {
        $abstractUser = Mockery::mock(SocialiteUser::class);
        $abstractUser->shouldReceive('getId')->andReturn('google-123456');
        $abstractUser->shouldReceive('getName')->andReturn('Alex Designer');
        $abstractUser->shouldReceive('getEmail')->andReturn('alex.designer@gmail.com');
        $abstractUser->shouldReceive('getAvatar')->andReturn('https://lh3.googleusercontent.com/avatar.jpg');

        $provider = Mockery::mock('Laravel\Socialite\Two\GoogleProvider');
        $provider->shouldReceive('stateless->user')->andReturn($abstractUser);
        Socialite::shouldReceive('driver')->with('google')->andReturn($provider);

        $response = $this->get('/api/v1/auth/google/callback');

        $response->assertRedirect();
        $this->assertStringContainsString('token=', $response->headers->get('Location'));

        $user = User::where('email', 'alex.designer@gmail.com')->first();
        $this->assertNotNull($user);
        $this->assertEquals('google-123456', $user->google_id);
        $this->assertTrue($user->hasRole('Staff'));
    }

    public function test_google_callback_links_existing_active_user(): void
    {
        $user = User::factory()->create([
            'email' => 'existing@lococreative.com',
            'status' => UserStatus::ACTIVE,
            'google_id' => null,
        ]);

        $abstractUser = Mockery::mock(SocialiteUser::class);
        $abstractUser->shouldReceive('getId')->andReturn('google-99999');
        $abstractUser->shouldReceive('getName')->andReturn($user->name);
        $abstractUser->shouldReceive('getEmail')->andReturn('existing@lococreative.com');
        $abstractUser->shouldReceive('getAvatar')->andReturn('https://lh3.googleusercontent.com/new-avatar.jpg');

        $provider = Mockery::mock('Laravel\Socialite\Two\GoogleProvider');
        $provider->shouldReceive('stateless->user')->andReturn($abstractUser);
        Socialite::shouldReceive('driver')->with('google')->andReturn($provider);

        $response = $this->get('/api/v1/auth/google/callback');

        $response->assertRedirect();
        $this->assertStringContainsString('token=', $response->headers->get('Location'));

        $user->refresh();
        $this->assertEquals('google-99999', $user->google_id);
    }

    public function test_google_callback_rejects_suspended_user(): void
    {
        User::factory()->create([
            'email' => 'banned@lococreative.com',
            'status' => UserStatus::SUSPENDED,
        ]);

        $abstractUser = Mockery::mock(SocialiteUser::class);
        $abstractUser->shouldReceive('getId')->andReturn('google-banned');
        $abstractUser->shouldReceive('getName')->andReturn('Banned User');
        $abstractUser->shouldReceive('getEmail')->andReturn('banned@lococreative.com');
        $abstractUser->shouldReceive('getAvatar')->andReturn(null);

        $provider = Mockery::mock('Laravel\Socialite\Two\GoogleProvider');
        $provider->shouldReceive('stateless->user')->andReturn($abstractUser);
        Socialite::shouldReceive('driver')->with('google')->andReturn($provider);

        $response = $this->get('/api/v1/auth/google/callback');

        $response->assertRedirect();
        $this->assertStringContainsString('error=account_suspended', $response->headers->get('Location'));
    }
}
```

- [ ] **Step 2: Implement `GoogleAuthController.php`**
```php
<?php

namespace App\Http\Controllers;

use App\Enums\UserStatus;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use Spatie\Permission\Models\Role;

class GoogleAuthController extends Controller
{
    public function redirect()
    {
        return Socialite::driver('google')
            ->scopes(['openid', 'profile', 'email'])
            ->stateless()
            ->redirect();
    }

    public function callback(Request $request)
    {
        $frontendUrl = rtrim(config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:3000')), '/');

        try {
            $googleUser = Socialite::driver('google')->stateless()->user();
        } catch (\Exception $e) {
            return redirect("{$frontendUrl}/signin?error=oauth_failed");
        }

        $email = $googleUser->getEmail();
        $googleId = $googleUser->getId();
        $name = $googleUser->getName() ?: 'User';
        $avatar = $googleUser->getAvatar();

        $user = User::where('email', $email)->orWhere('google_id', $googleId)->first();

        if ($user) {
            if ($user->status !== UserStatus::ACTIVE) {
                return redirect("{$frontendUrl}/signin?error=account_suspended");
            }

            // Link google_id and avatar if missing
            $user->update([
                'google_id' => $googleId,
                'avatar' => $avatar ?: $user->avatar,
                'email_verified_at' => $user->email_verified_at ?: now(),
            ]);
        } else {
            // Generate unique username
            $baseUsername = Str::slug(explode('@', $email)[0], '');
            $username = $baseUsername;
            $counter = 1;
            while (User::where('username', $username)->exists()) {
                $username = "{$baseUsername}{$counter}";
                $counter++;
            }

            $user = User::create([
                'google_id' => $googleId,
                'name' => $name,
                'email' => $email,
                'username' => $username,
                'avatar' => $avatar,
                'status' => UserStatus::ACTIVE,
                'join_date' => now()->toDateString(),
                'email_verified_at' => now(),
            ]);

            // Assign default Staff role
            if (Role::where('name', 'Staff')->exists()) {
                $user->assignRole('Staff');
            }
        }

        // Generate Sanctum Token
        $token = $user->createToken('google-auth')->plainTextToken;

        if (function_exists('activity')) {
            activity('auth')
                ->causedBy($user)
                ->log('User logged in via Google OAuth');
        }

        return redirect("{$frontendUrl}/auth/callback?token={$token}&status=success");
    }
}
```

- [ ] **Step 3: Register Routes in `backend/routes/api.php`**
```php
Route::middleware('throttle:10,1')->group(function () {
    Route::get('/auth/google/redirect', [\App\Http\Controllers\GoogleAuthController::class, 'redirect']);
    Route::get('/auth/google/callback', [\App\Http\Controllers\GoogleAuthController::class, 'callback']);
});
```

- [ ] **Step 4: Run Tests**
Run: `php artisan test --filter GoogleAuthTest` in `backend`.

- [ ] **Step 5: Commit**
Commit: `git commit -am "feat(auth): implement GoogleAuthController with security checks and feature tests"`

---

### Task 3: Frontend Sign In Integration and Auth Callback Handler

**Files:**
- Modify: `free-nextjs-admin-dashboard/src/components/auth/SignInForm.tsx`
- Create: `free-nextjs-admin-dashboard/src/app/(full-width-pages)/(auth)/callback/page.tsx`

**Interfaces:**
- Consumes: Backend `GET /api/v1/auth/google/redirect`, handles query params `?token=...` or `?error=...`.

- [ ] **Step 1: Update `SignInForm.tsx`**
Connect Google button to initiate OAuth redirect:
```tsx
const handleGoogleSignIn = () => {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:8000';
  window.location.href = `${backendUrl}/api/v1/auth/google/redirect`;
};
```
Add error alert display if URL has `?error=...`.

- [ ] **Step 2: Create `src/app/(full-width-pages)/(auth)/callback/page.tsx`**
Implement client page that extracts token, calls `localStorage.setItem('auth_token', token)` (or Sanctum auth sync), redirects to `/dashboard`, and handles errors gracefully.

- [ ] **Step 3: Test Build**
Run: `npm run build` in `free-nextjs-admin-dashboard`.

- [ ] **Step 4: Commit**
Commit: `git commit -am "feat(auth): integrate Google sign in button and auth callback route in frontend"`
