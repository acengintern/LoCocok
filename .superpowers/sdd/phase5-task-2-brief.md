### Phase 5 Task 2: Dashboard (5.1)

**Global Constraints:**
- Work exclusively inside ree-nextjs-admin-dashboard/.
- Use existing TailAdmin aesthetics.
- Do NOT hardcode business data/statistics. Consume the API.

**Requirements:**
1. Work in src/app/(admin)/dashboard/page.tsx (or whatever the main dashboard view is). 
2. Create src/components/Dashboard/SummaryCards.tsx and src/components/Dashboard/WorkloadChart.tsx.
3. Fetch data from GET /api/v1/dashboard/summary and GET /api/v1/dashboard/workload. (Use the piClient you created earlier).
4. The dashboard should render:
   - Total projects, active projects, completed projects, overdue projects (or whichever metrics come from the API summary endpoint).
   - The workload data (active tasks grouped by user) via the TailAdmin charts (you can repurpose ChartOne or ChartTwo or ChartThree from the template, just feed it the real API data).
5. Handle loading states and error states (using the generic components if applicable, or generic skeletons).
6. Commit your changes inside the submodule (git add . && git commit -m "feat: implement main dashboard").
7. Commit the submodule update in the root directory.
8. Write your report to .superpowers/sdd/phase5-task-2-report.md.
