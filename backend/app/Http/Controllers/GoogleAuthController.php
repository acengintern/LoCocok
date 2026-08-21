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
    /**
     * Redirect the user to the Google authentication page.
     */
    public function redirect()
    {
        $frontendUrl = rtrim(config('app.frontend_url') ?? env('FRONTEND_URL', 'http://localhost:3000'), '/');
        $clientId = config('services.google.client_id');
        $clientSecret = config('services.google.client_secret');

        if (empty($clientId) || empty($clientSecret)) {
            return redirect()->away("{$frontendUrl}/signin?error=google_not_configured");
        }

        return Socialite::driver('google')
            ->scopes(['openid', 'profile', 'email'])
            ->stateless()
            ->redirect();
    }

    /**
     * Obtain the user information from Google and authenticate.
     */
    public function callback(Request $request)
    {
        $frontendUrl = rtrim(config('app.frontend_url') ?? env('FRONTEND_URL', 'http://localhost:3000'), '/');

        try {
            $googleUser = Socialite::driver('google')->stateless()->user();

            if (!$googleUser || !$googleUser->getEmail()) {
                return redirect()->away("{$frontendUrl}/signin?error=oauth_failed");
            }
        } catch (\Throwable $e) {
            return redirect()->away("{$frontendUrl}/signin?error=oauth_failed");
        }

        $googleId = $googleUser->getId();
        $email = $googleUser->getEmail();

        try {
            $user = User::withTrashed()->where(function ($query) use ($googleId, $email) {
                if ($googleId) {
                    $query->where('google_id', $googleId);
                }
                if ($email) {
                    $query->orWhere('email', $email);
                }
            })->first();

            if ($user) {
                // If the user was soft-deleted, restore them upon verified Google sign-in
                if ($user->trashed()) {
                    $user->restore();
                }

                $status = $user->status instanceof UserStatus ? $user->status : UserStatus::tryFrom((string) $user->status);
                if ($status === UserStatus::SUSPENDED) {
                    return redirect()->away("{$frontendUrl}/signin?error=account_suspended");
                }

                $user->status = UserStatus::ACTIVE;

                if ($googleId && $user->google_id !== $googleId) {
                    $user->google_id = $googleId;
                }
                if ($googleUser->getAvatar()) {
                    $user->avatar = $googleUser->getAvatar();
                }
                if ($googleUser->getName() && (empty($user->name) || $user->name === 'sdfs')) {
                    $user->name = $googleUser->getName();
                }
                if (!$user->email_verified_at) {
                    $user->email_verified_at = now();
                }
                $user->save();

                // Ensure role is assigned if user has no role
                if ($user->roles()->count() === 0) {
                    $role = Role::firstOrCreate(['name' => 'Staff', 'guard_name' => 'web']);
                    $user->assignRole($role);
                }
            } else {
                $handle = explode('@', $email)[0];
                $baseUsername = Str::slug($handle, '_') ?: 'user';
                $username = $baseUsername;
                $counter = 1;
                while (User::withTrashed()->where('username', $username)->exists()) {
                    $username = $baseUsername . $counter;
                    $counter++;
                }

                $user = User::create([
                    'name' => $googleUser->getName() ?? $googleUser->getNickname() ?? $username,
                    'email' => $email,
                    'username' => $username,
                    'google_id' => $googleId,
                    'avatar' => $googleUser->getAvatar(),
                    'status' => UserStatus::ACTIVE,
                    'email_verified_at' => now(),
                    'join_date' => now(),
                ]);

                $role = Role::firstOrCreate(['name' => 'Staff', 'guard_name' => 'web']);
                $user->assignRole($role);
            }

            $token = $user->createToken('google-auth')->plainTextToken;

            if (function_exists('activity')) {
                activity('auth')
                    ->performedOn($user)
                    ->causedBy($user)
                    ->log('User logged in via Google OAuth');
            }

            $exchangeCode = Str::random(48);
            \Illuminate\Support\Facades\Cache::put("oauth_exchange:{$exchangeCode}", $token, now()->addSeconds(60));

            return redirect()->away("{$frontendUrl}/auth/callback?code={$exchangeCode}&status=success");
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('Google OAuth callback database error: ' . $e->getMessage());
            return redirect()->away("{$frontendUrl}/signin?error=oauth_failed");
        }
    }

    /**
     * Exchange short-lived one-time code for the actual Bearer token.
     */
    public function exchange(Request $request)
    {
        $request->validate([
            'code' => 'required|string',
        ]);

        $code = $request->input('code');
        $token = \Illuminate\Support\Facades\Cache::get("oauth_exchange:{$code}");

        if (!$token) {
            return response()->json([
                'success' => false,
                'message' => 'Kode autentikasi tidak valid atau telah kedaluwarsa.',
            ], 400);
        }

        // Allow concurrent React StrictMode requests in development while auto-expiring in 10s
        \Illuminate\Support\Facades\Cache::put("oauth_exchange:{$code}", $token, now()->addSeconds(10));

        return response()->json([
            'success' => true,
            'token' => $token,
        ]);
    }
}
