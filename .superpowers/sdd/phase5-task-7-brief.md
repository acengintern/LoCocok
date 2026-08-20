### Phase 5 Task 7: Projects (5.5)

**Global Constraints:**
- Work exclusively inside ree-nextjs-admin-dashboard/.
- Use existing TailAdmin aesthetics.

**Requirements:**
1. Create src/app/(admin)/projects/page.tsx
   - Implement the Projects list.
   - Use DataTable.
   - Implement filtering: search by name, status dropdown filter, priority filter, client filter, AE filter, CD filter. (For now, create the UI elements. If the API doesn't support a specific filter query parameter, filtering client-side or just providing the UI is fine).
   - Show project_number, 
ame, client, e, status, priority.
   - Provide "Create Project" button which probably routes to /projects/create or opens a large modal. Let's use a large modal for creation.
2. Create src/app/(admin)/projects/[id]/page.tsx (Project Detail).
   - Fetch project data: GET /api/v1/projects/{id}?include=client,projectType,ae,sms,cd
   - Render the Project information (name, type, status, priority, start/end dates, team assignments).
   - Lay out empty tabs or sections for the remaining features (Outputs, Tasks, Financial, Files, Timeline) that will be implemented in subsequent tasks.
3. Commit your changes inside the submodule (git add . && git commit -m "feat: implement project list and detail shell").
4. Commit the submodule update in the root directory.
5. Write your report to .superpowers/sdd/phase5-task-7-report.md.
