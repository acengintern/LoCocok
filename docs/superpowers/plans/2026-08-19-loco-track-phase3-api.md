# LOCO TRACK Phase 3 Implementation Plan

## Global Constraints
- Laravel Sanctum SPA authentication strictly via HTTP-only cookies (NO localStorage for tokens).
- Use uth:sanctum middleware.
- Configure CORS, credentials, session domain, and CSRF correctly for Next.js frontend.
- API endpoints prefixed with /api/v1/.
- Standard API response structure: { "success": bool, "message": string, "data": object|array, "meta": object }.
- Enforce Laravel Policies and Spatie Permissions on every endpoint (no frontend-only security).
- Form Requests for validation.
- API Resources for response transformation.
- Services for business logic/orchestration.
- Laravel Storage abstraction for files (do not store binary in MySQL).
- File version numbers server-controlled.
- Polymorphic targets (Approval/Revision) must use an explicit whitelist resolver.
- No caching or Redis.
- Master data managed via API with auth.
- DO NOT redesign Phase 2 DB architecture.
- Write Feature/API tests for every implemented module (happy path, validation, authentication, authorization, ownership/isolation, relationships).

## Tasks

- [ ] **Task 1: API architecture / response helpers**
  - Create standardized API Response traits/helpers (e.g., ApiResponse trait with successResponse, errorResponse).
  - Configure ootstrap/app.php to format validation exceptions and others consistently into { "success": false, "message": "...", "errors": {} }.
  
- [ ] **Task 2: Authentication**
  - Configure sanctum.php, cors.php and .env for SPA authentication.
  - Create AuthController (login, logout, me).
  - Implement login using HTTP-only cookie session (standard Sanctum SPA flow).
  - Create LoginRequest, UserResource.
  - Write tests: Login success/fail, logout, get me.
  
- [ ] **Task 3: Authorization / Policies**
  - Ensure Spatie Permissions is set up in User model.
  - Create Base Policy or configure global gate checks if necessary.
  - Create UserPolicy as a baseline.
  
- [ ] **Task 4: Master Data**
  - Create MasterDataController handling CRUD for Team, ProjectType, OutputType, TaskType, FileType.
  - Use uth:sanctum and require manage permissions or System Administrator role.
  - Create tests for Master Data endpoints.

- [ ] **Task 5: Users & RBAC**
  - Create UserController. CRUD for users.
  - Endpoints to assign/remove roles (POST /users/{user}/roles, DELETE /users/{user}/roles/{role}).
  - Endpoints to list user roles.
  - Write tests (authorization, CRUD).

- [ ] **Task 6: Clients**
  - Create ClientController (GET list, GET {client}, POST, PUT, DELETE).
  - ClientPolicy: AE/SMS can only edit their own, Admin manages all.
  - Write tests (cross-tenant isolation).

- [ ] **Task 7: Projects**
  - Create ProjectController.
  - Support ?include=client,projectType,ae,sms,cd,outputs,tasks,financialSummary.
  - ProjectPolicy: Team members view, Managers edit.
  - Write tests.

- [ ] **Task 8: Contracts**
  - Create ContractController nested under Project (/projects/{project}/contracts/{contract}).
  - Verify contract belongs to project.
  - Write tests.

- [ ] **Task 9: Financials**
  - Create controllers for ProjectFinancial, ProjectPayment, ProjectCost.
  - Routes nested under /projects/{project}/....
  - Strict Finance/Admin authorization.
  - Write tests.

- [ ] **Task 10: Outputs**
  - Create ProjectOutputController under /projects/{project}/outputs.
  - Allow detail/update for actual quantity vs target.
  - Write tests.

- [ ] **Task 11: Content Planning**
  - Create BriefController, ContentPlanController, ScriptController under /projects/{project}/....
  - Complete CRUD.
  - Write tests.

- [ ] **Task 12: Tasks & Assignments**
  - Create TaskController (global list, project list, CRUD, status update).
  - Create TaskAssignmentController (assign, list assignments, reassign, history).
  - Write tests.

- [ ] **Task 13: Files & Versions**
  - Create FileController, FileVersionController.
  - Upload file, upload new version (server auto-increments version number).
  - Download endpoint streams from Storage.
  - Write tests.

- [ ] **Task 14: Approvals & Revisions**
  - Create ApprovalController, RevisionController using polymorphic paths (/{type}/{id}/approve).
  - Whitelist types: files, file_versions, content_plans, scripts, tasks.
  - Expose history.
  - Write tests.

- [ ] **Task 15: Notifications**
  - Create NotificationController.
  - List, unread count, mark read, mark all read.
  - Write tests.

- [ ] **Task 16: Dashboard**
  - Create DashboardController (summary, workload).
  - Raw queries, no caching.
  - Role-based visibility.
  - Write tests.
