### Phase 5 Task 8: Contracts & Financials (5.6)

**Global Constraints:**
- Work exclusively inside ree-nextjs-admin-dashboard/.
- Use existing TailAdmin aesthetics.

**Requirements:**
1. Work inside the Project Detail context (src/app/(admin)/projects/[id]/page.tsx or related components).
2. Create src/components/Projects/ContractsTab.tsx.
   - Implement Contract list fetching from /api/v1/projects/{projectId}/contracts.
   - Provide "Add Contract" and "Edit Contract" functionality.
3. Create src/components/Projects/FinancialTab.tsx.
   - Fetch the project financial summary (maybe from /api/v1/projects/{projectId}/financials or calculate it).
   - Display tabs or sections for Payments and Costs.
   - Fetch payments from /api/v1/projects/{projectId}/payments.
   - Fetch costs from /api/v1/projects/{projectId}/costs.
   - Provide "Add Payment" and "Add Cost".
4. Use hasRole / hasPermission to hide the Financial tab completely if the user does not have Finance or System Administrator roles (or whatever role should see it).
5. Ensure the UI fits smoothly into the empty tabs you created in Task 7.
6. Commit your changes inside the submodule (git add . && git commit -m "feat: implement contracts and financials tabs").
7. Commit the submodule update in the root directory.
8. Write your report to .superpowers/sdd/phase5-task-8-report.md.
