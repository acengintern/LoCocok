### Task 3: Authorization / Policies

**Global Constraints:**
- Enforce Laravel Policies and Spatie Permissions on every endpoint (no frontend-only security).
- Write Feature/API tests for every implemented module (happy path, validation, authentication, authorization, ownership/isolation).

**Requirements:**
1. Create a pp/Policies/UserPolicy.php to handle user-related permissions (for now just baseline, e.g. iewAny, iew, create, update, delete). Users can view their own profile, but only users with manage permission or System Administrator role can manage other users. Since me is handled by AuthController, the UserPolicy is specifically for managing other users.
2. In Laravel 11, Policies are auto-discovered, but you need to ensure Spatie's Super Admin intercept is properly configured. Open pp/Providers/AppServiceProvider.php and in the oot method, add a Gate intercept:
`php
Gate::before(function ($user, $ability) {
    return $user->hasRole('System Administrator') ? true : null;
});
`
3. Write 	ests/Feature/AuthorizationTest.php to verify that a normal user without permissions CANNOT perform an action guarded by a permission (e.g. mock a dummy route or test a policy directly), and a user WITH the System Administrator role CAN perform it via the Gate bypass.

Ensure tests pass (php artisan test).
Commit your changes, then write your report to .superpowers/sdd/task-3-report.md.
