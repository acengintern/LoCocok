### Task 12: Tasks & Assignments API

**Global Constraints:**
- API endpoints prefixed with /api/v1/.
- Standard API response structure using ApiResponse trait.
- Form Requests for validation.
- Enforce Laravel Policies on every endpoint.
- Write Feature/API tests for every implemented module (happy path, validation, authorization, ownership/isolation).

**Requirements:**
1. Create controllers: TaskController and TaskAssignmentController.
2. TaskController:
   - GET /api/v1/tasks (Global list of tasks for the current user)
   - GET /api/v1/projects/{project}/tasks (List tasks for a specific project)
   - POST /api/v1/projects/{project}/tasks
   - GET /api/v1/projects/{project}/tasks/{task}
   - PUT /api/v1/projects/{project}/tasks/{task}
   - DELETE /api/v1/projects/{project}/tasks/{task}
3. TaskAssignmentController:
   - GET /api/v1/projects/{project}/tasks/{task}/assignments (List assignments/history)
   - POST /api/v1/projects/{project}/tasks/{task}/assignments (Assign user)
   - DELETE /api/v1/projects/{project}/tasks/{task}/assignments/{assignment} (Remove assignment)
4. Use FormRequests (StoreTaskRequest, UpdateTaskRequest, AssignTaskRequest). Validate status against App\Enums\TaskStatus and priority against App\Enums\Priority.
5. Create Resources (TaskResource, TaskAssignmentResource). TaskResource should optionally load ssignments and 	askType.
6. Create Policies.
   - For Tasks, iewAny for global tasks. iewAny for project tasks inherits from project visibility.
   - create, update, delete tasks: AE, SMS, CD, or Admin. A user assigned to a task can ALSO update the status of the task (but not delete it).
   - Assignments: AE, SMS, CD, Admin can assign/remove users.
7. Write tests in 	ests/Feature/TaskApiTest.php. Test:
   - Assignee can update task status.
   - Non-assignee (who is not a manager) cannot update the task (403).
   - Global list only returns tasks assigned to the current user (if they are not an admin/manager).

Ensure tests pass (php artisan test).
Commit your changes, then write your report to .superpowers/sdd/task-12-report.md.
