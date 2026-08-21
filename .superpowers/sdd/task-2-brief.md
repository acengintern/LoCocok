# Task 2: Backend Google OAuth Controller, Routes, Security Logic, and Feature Tests

## Task Details
**Files:**
- Create: `backend/app/Http/Controllers/GoogleAuthController.php`
- Modify: `backend/routes/api.php`
- Create: `backend/tests/Feature/GoogleAuthTest.php`

**Requirements:**
1. Implement `GoogleAuthController.php`:
   - `redirect()`: Return `Socialite::driver('google')->scopes(['openid', 'profile', 'email'])->stateless()->redirect();`.
   - `callback(Request $request)`:
     - Wrap Google user fetch in `try...catch`, redirecting to `${frontendUrl}/signin?error=oauth_failed` on failure.
     - Check if user exists by `email` or `google_id`.
     - If user exists:
       - If `user->status !== UserStatus::ACTIVE`: redirect to `${frontendUrl}/signin?error=account_suspended`.
       - Link `google_id`, `avatar`, and mark `email_verified_at` if needed.
     - If user does not exist:
       - Generate unique slugified `username` from email handle.
       - Create new `User` with `status = UserStatus::ACTIVE`, `email_verified_at = now()`, and `join_date = now()`.
       - Assign default role **`Staff`** using Spatie Permission.
     - Generate Sanctum token: `$token = $user->createToken('google-auth')->plainTextToken;`.
     - Log activity via Spatie ActivityLog if available.
     - Return redirect to `${frontendUrl}/auth/callback?token={$token}&status=success`.
2. Register routes in `backend/routes/api.php`:
   - `GET /api/v1/auth/google/redirect`
   - `GET /api/v1/auth/google/callback`
   - Wrap with `throttle:10,1` middleware.
3. Write comprehensive feature tests in `backend/tests/Feature/GoogleAuthTest.php`:
   - `test_google_redirect_returns_redirect_response`
   - `test_google_callback_creates_new_user_with_staff_role`
   - `test_google_callback_links_existing_active_user`
   - `test_google_callback_rejects_suspended_user`
   - `test_google_callback_handles_socialite_exception_gracefully`
4. Run: `php artisan test --filter GoogleAuthTest` and `php artisan test` (all 94+ tests passing).
5. Commit: `git commit -am "feat(auth): implement GoogleAuthController with security checks and feature tests"`
6. Report back.
