# Task 1: Backend Database Migration and ProfileController Endpoints

## Context & Purpose
We are adding authentic agency profile management to the Laravel backend.
Work in: `D:/01-projek/LocoCok/web-track-nextjs/backend`

## Requirements
1. **Migration**: Create migration `2026_08_21_000001_add_profile_fields_to_users_table.php` adding nullable columns:
   - `phone` (string, nullable)
   - `bio` (text, nullable)
   - `division` (string, nullable)
   Update `User.php` `$fillable` to include `phone`, `bio`, `division`.
   Run `php artisan migrate`.

2. **UserResource**: Update `app/Http/Resources/UserResource.php` to include `phone`, `bio`, `division`.

3. **Controller**: Create `app/Http/Controllers/Api/V1/ProfileController.php` with:
   - `updateProfile(Request $request)`:
     - Validates: `name` (required|string|max:255), `phone` (nullable|string|max:50), `division` (nullable|string|max:100), `bio` (nullable|string|max:1000).
     - Updates `$request->user()`, returns `UserResource` with success message "Profile updated successfully".
   - `updatePassword(Request $request)`:
     - Validates: `current_password` (nullable|string), `password` (required|string|min:8|confirmed).
     - If user has existing password, verify `Hash::check($request->current_password, $user->password)`. Return 422 with error if incorrect.
     - Hash and save new password, returns success response "Password updated successfully".
   - `stats(Request $request)`:
     - Returns statistics: `total_projects` (count of projects user is assigned or created), `total_tasks` (count of tasks assigned to user), `completed_tasks` (count of completed tasks assigned to user), `pending_tasks` (count of in-progress/pending tasks).

4. **Routes**: In `backend/routes/api.php` under `auth:sanctum` group:
   - `PUT /users/me/profile` -> `[ProfileController::class, 'updateProfile']`
   - `PUT /users/me/password` -> `[ProfileController::class, 'updatePassword']`
   - `GET /users/me/stats` -> `[ProfileController::class, 'stats']`

5. **Testing**: Create `tests/Feature/ProfileTest.php` testing:
   - `test_user_can_update_profile_info`
   - `test_user_can_change_password_with_valid_current_password`
   - `test_user_cannot_change_password_with_invalid_current_password`
   - `test_user_without_existing_password_can_set_password_without_current_password`
   - `test_user_can_retrieve_workload_stats`
   Run: `php artisan test --filter ProfileTest` and verify all tests pass.
   Run: `php artisan test` and verify full test suite passes.

6. **Git Commit**: Commit backend changes with a clear commit message.
