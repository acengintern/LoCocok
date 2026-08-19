### Task 9: Financials API

**Global Constraints:**
- API endpoints prefixed with /api/v1/.
- Standard API response structure using ApiResponse trait.
- Form Requests for validation.
- Enforce Laravel Policies on every endpoint.
- Write Feature/API tests for every implemented module (happy path, validation, authorization, ownership/isolation).

**Requirements:**
1. Create controllers: ProjectFinancialController, ProjectPaymentController, ProjectCostController.
2. Financials (GET /api/v1/projects/{project}/financials, PUT /api/v1/projects/{project}/financials). ProjectFinancial was seeded as 1:1, so a show or index is functionally equivalent to getting the project's financial record. A PUT updates it.
3. Payments: GET, POST under /projects/{project}/payments. GET, PUT, DELETE under /projects/{project}/payments/{payment}.
4. Costs: Same CRUD as Payments but under /projects/{project}/costs.
5. Create respective FormRequests and Resources. Validate against Enums (PaymentStatus, CostType).
6. Authorization: Strict Finance/Admin authorization. Create ProjectFinancialPolicy, ProjectPaymentPolicy, ProjectCostPolicy. Only users with manage permission (or System Administrator via Gate) can perform ANY actions on these endpoints. Normal AE/SMS/Designers cannot view or edit financial data unless explicitly granted.
7. Write tests in 	ests/Feature/FinancialApiTest.php to verify:
   - Admin can view and modify financials, payments, and costs.
   - Normal users (even AE of the project) receive 403 Forbidden.
   - Cross-project checking (payment/cost must belong to the given project, else 404).

Ensure tests pass (php artisan test).
Commit your changes, then write your report to .superpowers/sdd/task-9-report.md.
