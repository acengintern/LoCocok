### Phase 5 Task 4: Master Data (5.2)

**Global Constraints:**
- Work exclusively inside ree-nextjs-admin-dashboard/.
- Use existing TailAdmin aesthetics.

**Requirements:**
1. Create src/app/(admin)/administration/teams/page.tsx (and Clients.tsx or client-side component).
2. Create src/app/(admin)/administration/output-types/page.tsx.
3. Create src/app/(admin)/administration/status/page.tsx (or whatever the task/project types map to in the sidebar, maybe map them to project-types and 	ask-types instead of "status").
Wait, the sidebar defined: Teams, Output Types, Status (which might be task types), Project Types (actually let's just implement Teams and Output Types for now as a proof of concept for Master Data, we can add the rest easily if needed).
Let's stick to the spec: "Teams, Project Types, Output Types, Task Types, File Types".
Update the sidebar if necessary to match these exactly under Administration:
- Teams (/administration/teams)
- Project Types (/administration/project-types)
- Output Types (/administration/output-types)
- Task Types (/administration/task-types)
- File Types (/administration/file-types)
4. Build a generic MasterDataCrud component or implement them individually. They all share the exact same shape: id, 
ame, description, is_active.
   - List them using DataTable.
   - Create/Edit them using Modal with a form.
   - Delete them (Soft delete) using ConfirmationDialog.
   - Fetch from /api/v1/master-data/{teams|project-types|etc}.
5. Protect these pages behind System Administrator role.
6. Commit your changes inside the submodule (git add . && git commit -m "feat: implement master data CRUD").
7. Commit the submodule update in the root directory.
8. Write your report to .superpowers/sdd/phase5-task-4-report.md.
