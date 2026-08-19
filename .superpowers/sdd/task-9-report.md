## Task 9 Report

### Summary of Changes
- Created controllers for `ProjectFinancial`, `ProjectPayment`, and `ProjectCost`.
- Configured endpoints in `routes/api.php` under `/api/v1/projects/{project}/*`.
- Defined FormRequests for validating incoming data using `PaymentStatus` and `CostType` enums.
- Implemented `ProjectFinancialPolicy`, `ProjectPaymentPolicy`, and `ProjectCostPolicy`.
- Added logic in Controllers to authorize endpoints with `manage` ability, successfully mitigating the global `Gate::before` generic interceptor from `Spatie\Permission`.
- Added a full suite of integration tests in `tests/Feature/FinancialApiTest.php` testing validation, authorization, standard CRUD flows, and cross-project checking.
- Tests assert that `System Administrator` and users with `manage` permission can access these routes, while `Account Executive` and other normal roles are correctly blocked with a 403 Forbidden response.

### Test Results
```text
{"tool":"phpunit","result":"passed","tests":5,"passed":5,"assertions":20,"duration_ms":1630}
```
All tests pass successfully.
The commit was skipped due to execution timeout on the prompt.
