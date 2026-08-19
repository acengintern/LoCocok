### Task 2: Authentication

**Global Constraints:**
- API endpoints prefixed with /api/v1/.
- Standard API response structure: { "success": bool, "message": string, "data": object|array, "meta": object }.
- Laravel Sanctum SPA authentication strictly via HTTP-only cookies (NO localStorage for tokens).
- Configure CORS, credentials, session domain, and CSRF correctly for Next.js frontend.
- Write Feature/API tests for every implemented module (happy path, validation, authentication).

**Requirements:**
1. Configure config/sanctum.php to set stateful domains (add localhost, 127.0.0.1, and Next.js default localhost:3000).
2. Configure CORS to strictly allow Next.js origin with credentials. In Laravel 11, do this by publishing the cors config (php artisan config:publish cors) and setting supports_credentials = true, or by configuring ootstrap/app.php. Also ensure Sanctum's EnsureFrontendRequestsAreStateful middleware is active for the API group.
3. Configure ackend/.env (and .env.example) to ensure SESSION_DRIVER=cookie or similar standard file/database, and SANCTUM_STATEFUL_DOMAINS properly set.
4. Create pp/Http/Controllers/AuthController.php with login, logout, and me methods. Use the ApiResponse trait.
5. Create pp/Http/Requests/Auth/LoginRequest.php for validating email and password.
6. Create pp/Http/Resources/UserResource.php.
7. Add routes to outes/api.php under the 1 group. /login is public. /logout and /me must use uth:sanctum middleware.
8. Write tests in 	ests/Feature/AuthTest.php:
   - Login success (returns user data).
   - Login failure (wrong password).
   - Logout (success).
   - Get me (returns authenticated user data).
   - Verify /sanctum/csrf-cookie is accessible.

Ensure tests pass (php artisan test).
Commit your changes, then write your report to .superpowers/sdd/task-2-report.md.
