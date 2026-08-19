### Task 8: Contracts API

**Global Constraints:**
- API endpoints prefixed with /api/v1/.
- Standard API response structure using ApiResponse trait.
- Form Requests for validation.
- Enforce Laravel Policies on every endpoint.
- Write Feature/API tests for every implemented module (happy path, validation, authorization, ownership/isolation).

**Requirements:**
1. Create pp/Http/Controllers/ContractController.php.
2. Implement CRUD nested under projects:
   - GET /api/v1/projects/{project}/contracts
   - POST /api/v1/projects/{project}/contracts
   - GET /api/v1/projects/{project}/contracts/{contract}
   - PUT /api/v1/projects/{project}/contracts/{contract}
   - DELETE /api/v1/projects/{project}/contracts/{contract}
3. Use FormRequests: StoreContractRequest, UpdateContractRequest.
4. Create pp/Http/Resources/ContractResource.php.
5. Authorization: Verify the contract actually belongs to the project (e.g., if $contract->project_id !== ->id, abort 404). This is built-in if you use scoped bindings ({project}/contracts/{contract:id} or rely on $project->contracts()->findOrFail()).
6. Create pp/Policies/ContractPolicy.php.
   - iewAny, iew: Inherit visibility from the Project (if you can view the project, you can view its contracts).
   - create, update, delete: Only users who can update the project (AE, SMS, CD, or Admin). You can authorize these by checking the project's policy or directly in ContractPolicy by doing $user->can('update', ).
7. Write tests in 	ests/Feature/ContractApiTest.php to verify:
   - The contract creation succeeds for AE/Admin, fails for normal user.
   - Accessing a contract that belongs to Project A using the URL for Project B yields 404.
   - Validation works.

Ensure tests pass (php artisan test).
Commit your changes, then write your report to .superpowers/sdd/task-8-report.md.
