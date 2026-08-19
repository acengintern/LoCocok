### Task 1: API architecture / response helpers

**Global Constraints:**
- API endpoints prefixed with /api/v1/.
- Standard API response structure: { "success": bool, "message": string, "data": object|array, "meta": object }.
- Form Requests for validation.
- Write Feature/API tests for every implemented module (happy path, validation).

**Files:**
- Create: ackend/app/Traits/ApiResponse.php
- Modify: ackend/bootstrap/app.php
- Create: ackend/tests/Feature/ApiArchitectureTest.php

**Instructions:**
1. Create ApiResponse trait in pp/Traits/ with methods like successResponse(, , ) and errorResponse(, , ).
2. Configure ootstrap/app.php to format validation exceptions and general API exceptions consistently into the standard JSON structure { "success": false, "message": "...", "errors": {} }. Use $exceptions->render(function (ValidationException $e, Request $request) { ... }) and similar for NotFoundHttpException, AuthenticationException, AuthorizationException.
3. Update ackend/routes/api.php to use a 1 group, like Route::prefix('v1')->group(function () { ... })
4. Write a test in ApiArchitectureTest.php to verify the JSON structure for a missing route (404) and a successful /api/v1/ping response.

Ensure tests pass (php artisan test).
Commit your changes, then write your report to .superpowers/sdd/task-1-report.md.
