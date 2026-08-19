### Task 6: Clients API

**Global Constraints:**
- API endpoints prefixed with /api/v1/.
- Standard API response structure using ApiResponse trait.
- Form Requests for validation.
- Enforce Laravel Policies on every endpoint.
- Write Feature/API tests for every implemented module (happy path, validation, authorization, ownership/isolation).

**Requirements:**
1. Create pp/Http/Controllers/ClientController.php.
2. Implement CRUD (GET /api/v1/clients, POST /api/v1/clients, GET /api/v1/clients/{client}, PUT /api/v1/clients/{client}, DELETE /api/v1/clients/{client}).
3. Use FormRequests: StoreClientRequest, UpdateClientRequest. Be sure to cast or validate status against App\Enums\ClientStatus (ACTIVE, INACTIVE, PROSPECT).
4. Create pp/Policies/ClientPolicy.php.
   - iewAny, create: Users with iew / create permission.
   - iew, update, delete: A user can only manage the client if they are the designated AE (pic_ae_id) or SMS (pic_sms_id), OR if they have System Administrator role (handled by Gate intercept).
5. Ensure ClientResource returns related AE and SMS data if possible, or just standard output.
6. Write tests in 	ests/Feature/ClientApiTest.php to verify:
   - User who is the assigned AE CAN update the client.
   - User who is NOT the assigned AE or SMS CANNOT update the client (403 Forbidden).
   - Admin CAN update any client.

Ensure tests pass (php artisan test).
Commit your changes, then write your report to .superpowers/sdd/task-6-report.md.
