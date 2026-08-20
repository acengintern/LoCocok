### Task 14: Approvals & Revisions API

**Global Constraints:**
- API endpoints prefixed with /api/v1/.
- Standard API response structure using ApiResponse trait.
- Form Requests for validation.
- Enforce Laravel Policies on every endpoint.
- Write Feature/API tests for every implemented module (happy path, validation, authorization, ownership/isolation).

**Requirements:**
1. Create ApprovalController and RevisionController.
2. Implement polymorphic endpoints using an explicit whitelist.
   - GET /api/v1/{target_type}/{id}/approvals (List approvals history)
   - POST /api/v1/{target_type}/{id}/approvals (Submit an approval: requires status [APPROVED, REJECTED] and optional 
otes).
   - GET /api/v1/{target_type}/{id}/revisions (List revisions history)
   - POST /api/v1/{target_type}/{id}/revisions (Submit a revision request: requires evision_notes).
3. 	arget_type MUST be strictly validated via a whitelist in the controllers or a middleware (e.g., ['files' => File::class, 'file_versions' => FileVersion::class, 'content_plans' => ContentPlan::class, 'scripts' => Script::class, 'tasks' => Task::class]). If the 	arget_type is not in the whitelist, abort with 400 or 404.
4. Authorization: Ensure the user actually has permission to view or interact with the underlying polymorphic model. You can fetch the model using the whitelist mapping and authorize against it (e.g., $this->authorize('view', )).
5. Create Resources ApprovalResource, RevisionResource.
6. Write tests in 	ests/Feature/PolymorphicApiTest.php to verify:
   - Valid polymorphic attachment (e.g., approving a task).
   - Invalid 	arget_type throws an error.
   - Unauthorized user cannot approve an entity they do not have access to.

Ensure tests pass (php artisan test).
Commit your changes, then write your report to .superpowers/sdd/task-14-report.md.
