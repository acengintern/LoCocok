### Task 16: Dashboard API

**Global Constraints:**
- API endpoints prefixed with /api/v1/.
- Standard API response structure using ApiResponse trait.
- Enforce Laravel Policies on every endpoint.
- Write Feature/API tests for every implemented module (happy path, validation, authorization, ownership/isolation).
- Use raw DB queries for the dashboard if needed, no caching/Redis.

**Requirements:**
1. Create DashboardController.
2. Implement endpoints:
   - GET /api/v1/dashboard/summary (High-level summary)
   - GET /api/v1/dashboard/workload (User workload data)
3. Provide summary data based on the user's role.
   - For an Admin/Manager: Total projects, active projects, revenue (sum of project_financials.nett_project_revenue), pending approvals.
   - For an AE/SMS/Design/Video: Total active projects assigned to them, tasks pending, content plans due this week.
4. Provide workload data: count of active tasks grouped by user (or just for the current user's team/department).
5. Authorization: Ensure standard authenticated users can access the dashboard, but restrict the scope of the data returned based on their role (uth()->user()->hasRole(...) or via a dedicated policy method iewSummary).
6. Write tests in 	ests/Feature/DashboardApiTest.php to verify:
   - Admin sees company-wide totals.
   - Normal user sees only their assigned metrics.

Ensure tests pass (php artisan test).
Commit your changes, then write your report to .superpowers/sdd/task-16-report.md.
