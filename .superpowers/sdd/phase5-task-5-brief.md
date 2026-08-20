### Phase 5 Task 5: Users & RBAC (5.3)

**Global Constraints:**
- Work exclusively inside ree-nextjs-admin-dashboard/.
- Use existing TailAdmin aesthetics.

**Requirements:**
1. Create src/app/(admin)/administration/users/page.tsx
   - Implement a user list fetching from /api/v1/users.
   - The UI should support displaying the users (Name, Email, Roles, Status) via DataTable.
   - Provide "Create User" and "Edit User" functionalities (in a Modal).
   - Create payload to /api/v1/users should handle name, email, password, etc.
   - For role assignment, fetch available roles from /api/v1/roles and provide a multiple-select or checkbox list in the Edit/Create User modal. Use PUT /api/v1/users/{id}/roles with { roles: ['Role Name'] }.
2. Create src/app/(admin)/administration/roles/page.tsx
   - Implement a simple list of Roles fetching from /api/v1/roles.
   - Display the role names and their associated permissions via DataTable.
   - The backend API might not have a full CRUD for roles yet, so a read-only list is fine if the API lacks it. Check the API or just make it read-only for now.
3. Both pages should be implicitly protected by the AdministrationLayout from Task 4.
4. Commit your changes inside the submodule (git add . && git commit -m "feat: implement users and rbac UI").
5. Commit the submodule update in the root directory.
6. Write your report to .superpowers/sdd/phase5-task-5-report.md.
