# Task 7 Report: Projects API

## Test Results
Ran `php artisan test` and all 38 tests passed successfully, including the 5 new tests in `ProjectApiTest`:
- `test_can_create_project_with_valid_data`
- `test_validation_fails_when_required_fields_missing`
- `test_assigned_ae_can_update_project`
- `test_unassigned_user_cannot_update_project`
- `test_relationship_inclusion_via_query_string`

## Commit Summary
- **feat: implement Project API**
  - Generated and implemented `ProjectController` with full CRUD operations using soft deletes.
  - Added eager loading via query string (`?include=client,projectType,ae,sms,cd,outputs,tasks,financialSummary`).
  - Implemented `StoreProjectRequest` and `UpdateProjectRequest` for input validation.
  - Added `ProjectResource` that utilizes `$this->whenLoaded(...)` for eager-loaded relationships.
  - Implemented `ProjectPolicy` ensuring isolation. Only assigned AE, SMS, CD or users with the 'manage' permission can update/delete projects.
  - Registered `projects` apiResource route in `routes/api.php` under the `auth:sanctum` middleware.
  - Wrote comprehensive API tests in `tests/Feature/ProjectApiTest.php` ensuring validation, relationship inclusion, and isolated authorization.
