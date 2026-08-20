### Task 3: Auth Context & RBAC Foundation

**Global Constraints:**
- Phase 4 is ONLY integration foundation.

**Requirements:**
1. Work inside ree-nextjs-admin-dashboard/.
2. Create src/lib/rbac.ts. Implement helper functions:
   - hasRole(user: User, role: string | string[]): boolean
   - hasPermission(user: User, permission: string | string[]): boolean
   - Use the user.roles array (and roles' permissions arrays) to determine authorization based on the User type from Task 2.
3. Create src/contexts/AuthContext.tsx.
   - Implement AuthContext with state for user (User | null) and loading (oolean).
   - Implement login(credentials) which calls csrf() (from piClient), then POST /login, then efreshUser().
   - Implement logout() which calls POST /logout and sets user to null.
   - Implement efreshUser() which calls GET /api/v1/users/me and updates user state. Run this in a useEffect on mount.
4. Create src/hooks/useAuth.ts which exports useAuth() hook using useContext(AuthContext).
5. Export everything cleanly.
6. Commit your changes inside the submodule, then commit the submodule update in the root.
7. Write your report to .superpowers/sdd/phase4-task-3-report.md in the root directory.
