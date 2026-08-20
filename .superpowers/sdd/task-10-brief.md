### Task 10: Outputs API

**Global Constraints:**
- API endpoints prefixed with /api/v1/.
- Standard API response structure using ApiResponse trait.
- Form Requests for validation.
- Enforce Laravel Policies on every endpoint.
- Write Feature/API tests for every implemented module (happy path, validation, authorization, ownership/isolation).

**Requirements:**
1. Create pp/Http/Controllers/ProjectOutputController.php.
2. Implement endpoints nested under projects:
   - GET /api/v1/projects/{project}/outputs
   - POST /api/v1/projects/{project}/outputs
   - GET /api/v1/projects/{project}/outputs/{output}
   - PUT /api/v1/projects/{project}/outputs/{output}
   - DELETE /api/v1/projects/{project}/outputs/{output}
3. Use FormRequests: StoreProjectOutputRequest, UpdateProjectOutputRequest. Ensure output_type_id, 
ame, 	arget_quantity, and ctual_quantity are validated.
4. Create ProjectOutputResource to optionally include the related outputType model ($this->whenLoaded('outputType')).
5. Create ProjectOutputPolicy.
   - iewAny, iew: Inherits from Project visibility.
   - create, update, delete: Allowed for users who can update the project (AE, SMS, CD, Admin).
6. Authorization: Enforce that the output belongs to the project (404 otherwise).
7. Write tests in 	ests/Feature/OutputApiTest.php to verify:
   - Nested output creation works for AE.
   - Creation fails for normal non-team user.
   - Accessing an output belonging to Project A via the URL of Project B fails (404).

Ensure tests pass (php artisan test).
Commit your changes, then write your report to .superpowers/sdd/task-10-report.md.
