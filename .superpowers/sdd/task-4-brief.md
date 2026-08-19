### Task 4: Master Data API

**Global Constraints:**
- API endpoints prefixed with /api/v1/.
- Standard API response structure using ApiResponse trait.
- Form Requests for validation.
- API Resources for response transformation.
- Master data managed via API with auth.
- Write Feature/API tests for every implemented module (happy path, validation, authorization).

**Requirements:**
1. This module handles CRUD for Team, ProjectType, OutputType, TaskType, FileType.
2. Create standard Laravel REST controllers:
   - TeamController
   - ProjectTypeController
   - OutputTypeController
   - TaskTypeController
   - FileTypeController
   (Or a generic MasterDataController if you prefer, but separate controllers are often cleaner for resource binding and FormRequests. Let's use separate controllers to keep form requests specific, e.g., StoreTeamRequest, StoreProjectTypeRequest, etc., checking for unique names).
3. Create generic MasterDataResource or specific resources (e.g. TeamResource). The tables are mostly just id, 
ame (and code for some like TaskType).
4. Endpoints in outes/api.php:
   - GET /master/teams, POST /master/teams, GET /master/teams/{id}, PUT /master/teams/{id}, DELETE /master/teams/{id}
   - Repeat for project-types, output-types, 	ask-types, ile-types.
   - Protect all routes with uth:sanctum.
5. Authorization: Ensure ONLY users with manage permission (or System Administrator role via Gate) can perform POST/PUT/DELETE. GET routes can be accessible to users with iew permission. You can use standard Controller uthorizeResource() or manual $this->authorize('viewAny', Team::class). You will need to create Policies for these models (e.g. TeamPolicy) mirroring this logic.
6. Write tests in 	ests/Feature/MasterDataApiTest.php:
   - Admin can list, create, update, and soft-delete a Team.
   - Normal user (without manage permission) cannot create a Team (403).
   - Test validation (e.g. unique name requirement).

Ensure tests pass (php artisan test).
Commit your changes, then write your report to .superpowers/sdd/task-4-report.md.
