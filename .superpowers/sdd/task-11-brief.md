### Task 11: Content Planning API

**Global Constraints:**
- API endpoints prefixed with /api/v1/.
- Standard API response structure using ApiResponse trait.
- Form Requests for validation.
- Enforce Laravel Policies on every endpoint.
- Write Feature/API tests for every implemented module (happy path, validation, authorization, ownership/isolation).

**Requirements:**
1. Create controllers: BriefController, ContentPlanController, ScriptController.
2. Implement endpoints nested under projects:
   - GET|POST|PUT|DELETE for /api/v1/projects/{project}/briefs
   - GET|POST|PUT|DELETE for /api/v1/projects/{project}/content-plans
   - GET|POST|PUT|DELETE for /api/v1/projects/{project}/scripts
3. Create corresponding FormRequests (StoreBriefRequest, etc.). 
4. Create corresponding Resources.
5. Content Plans have an optional output_type_id. Ensure it is validated if provided (exists in output_types).
6. Create Policies for all three. They all inherit authorization from the project:
   - iewAny, iew: Inherits from Project visibility.
   - create, update, delete: Allowed for users who can update the project (AE, SMS, CD, Admin).
7. Authorization: Enforce that the entity belongs to the project (404 otherwise).
8. Write tests in 	ests/Feature/ContentPlanningApiTest.php to verify:
   - Nested creation works for an authorized project member.
   - Cross-project checking (fetching brief from wrong project yields 404).
   - Unauthorized users receive 403.

Ensure tests pass (php artisan test).
Commit your changes, then write your report to .superpowers/sdd/task-11-report.md.
