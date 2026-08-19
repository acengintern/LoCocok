### Task 5: Users & RBAC

**Global Constraints:**
- API endpoints prefixed with /api/v1/.
- Standard API response structure using ApiResponse trait.
- Form Requests for validation.
- Enforce Laravel Policies and Spatie Permissions on every endpoint (no frontend-only security).
- Write Feature/API tests for every implemented module.

**Requirements:**
1. Create pp/Http/Controllers/UserController.php.
2. Implement standard CRUD endpoints for users (GET /api/v1/users, POST /api/v1/users, GET /api/v1/users/{user}, PUT /api/v1/users/{user}, DELETE /api/v1/users/{user}). Use SoftDeletes for delete.
3. Implement Role management endpoints:
   - GET /api/v1/users/{user}/roles (List user roles)
   - POST /api/v1/users/{user}/roles (Assign role, expects e.g., {"role": "Creative Director"})
   - DELETE /api/v1/users/{user}/roles/{role} (Remove role)
4. Use FormRequests: StoreUserRequest, UpdateUserRequest, AssignRoleRequest.
5. Use existing UserResource (update it if necessary to optionally include roles).
6. Authorization: Enforce via the existing UserPolicy. iewAny / create / update / delete for users. For roles, you can check manage permissions or create custom policy methods.
7. Write tests in 	ests/Feature/UserApiTest.php to verify:
   - CRUD isolation and authorization.
   - Assigning a role succeeds for Admin, fails for normal user.
   - Removing a role succeeds for Admin.

Ensure tests pass (php artisan test).
Commit your changes, then write your report to .superpowers/sdd/task-5-report.md.
