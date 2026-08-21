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

        $user = User::where(function ($query) use ($googleId, $email) {
            if ($googleId) {
                $query->where('google_id', $googleId);
            }
            if ($email) {
                $query->orWhere('email', $email);
            }
        })->first();

        if ($user) {
            $status = $user->status instanceof UserStatus ? $user->status : UserStatus::tryFrom((string) $user->status);
            if ($status !== UserStatus::ACTIVE) {
                return redirect()->away("{$frontendUrl}/signin?error=account_suspended");
            }

            if ($googleId && $user->google_id !== $googleId) {
                $user->google_id = $googleId;
            }
            if ($googleUser->getAvatar()) {
                $user->avatar = $googleUser->getAvatar();
            }
            if (!$user->email_verified_at) {
                $user->email_verified_at = now();
            }
            $user->save();
        } else {
            $handle = explode('@', $email)[0];
            $baseUsername = Str::slug($handle, '_') ?: 'user';
            $username = $baseUsername;
            $counter = 1;
            while (User::where('username', $username)->exists()) {
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

        return redirect()->away("{$frontendUrl}/auth/callback?token={$token}&status=success");
    }
}
