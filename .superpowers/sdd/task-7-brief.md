### Task 7: Projects API

**Global Constraints:**
- API endpoints prefixed with /api/v1/.
- Standard API response structure using ApiResponse trait.
- Form Requests for validation.
- Enforce Laravel Policies on every endpoint.
- Write Feature/API tests for every implemented module (happy path, validation, authorization, ownership/isolation).

**Requirements:**
1. Create pp/Http/Controllers/ProjectController.php with standard CRUD (GET /api/v1/projects, POST /api/v1/projects, GET /api/v1/projects/{project}, PUT /api/v1/projects/{project}, DELETE /api/v1/projects/{project}). Use SoftDeletes for delete.
2. Implement controlled include parameters via Query String (e.g. ?include=client,projectType,ae,sms,cd,outputs,tasks,financialSummary). Do not allow arbitrary relationships. In ProjectController@index and @show, check $request->query('include') and eagerly load ONLY the allowed relationships using ->with().
3. Use FormRequests: StoreProjectRequest, UpdateProjectRequest.
4. Create pp/Http/Resources/ProjectResource.php. Use $this->whenLoaded(...) to include the requested relationships in the response.
5. Create pp/Policies/ProjectPolicy.php.
   - iewAny, iew: Users with iew permission.
   - create: Users with create permission.
   - update, delete: A user can only edit/delete if they are the designated AE (e_id), SMS (sms_id), CD (cd_id), OR if they have the manage permission/System Administrator role.
6. Create pp/Services/ProjectService.php. When creating a project (POST), use this service to orchestrate creation. For now, it just creates the project, but we will use it as the designated place to create default financial records later. Have the controller inject and call $projectService->createProject(->validated()).
7. Write tests in 	ests/Feature/ProjectApiTest.php to verify:
   - Proper relationship inclusion (test that ?include=client returns the client object, while omitting it does not).
   - Validation.
   - Authorization isolation (a normal user without manage permissions who is NOT the AE/SMS/CD cannot update the project).

Ensure tests pass (php artisan test).
Commit your changes, then write your report to .superpowers/sdd/task-7-report.md.
