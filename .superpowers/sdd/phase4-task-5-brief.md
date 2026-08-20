### Task 5: TailAdmin Dashboard Integration

**Global Constraints:**
- Phase 4 is ONLY integration foundation.
- Keep the existing TailAdmin design system.

**Requirements:**
1. Work inside ree-nextjs-admin-dashboard/.
2. Wrap the root layout (src/app/layout.tsx or an inner provider component) with AuthContext.Provider so the auth state is available globally.
3. Update src/components/Header/index.tsx.
   - Use the useAuth() hook to get the current user.
   - Display the logged-in user's name and role instead of the default hardcoded placeholder.
   - Replace the default hardcoded "Log Out" functionality in the dropdown to trigger the logout() function from useAuth().
4. Update src/components/Sidebar/index.tsx.
   - Prepare the navigation structure (Dashboard, Projects, Clients, Tasks, Content Planning, Files, Financial, Master Data, Users & RBAC, Notifications).
   - Use hasRole / hasPermission (from useAuth user object) to conditionally render navigation items (e.g. Master Data and Users & RBAC only for System Administrator).
5. Secure the main dashboard page (src/app/page.tsx or similar default dashboard entry).
   - Wrap the dashboard contents with the <ProtectedRoute> component.
6. Commit your changes inside the submodule, then commit the submodule update in the root.
7. Write your report to .superpowers/sdd/phase4-task-5-report.md in the root directory.
