### Phase 6 Task 1: API & Security Audit

**Requirements:**
1. Search the frontend codebase (ree-nextjs-admin-dashboard/src) for localStorage.setItem or localStorage.getItem to ensure authentication tokens are NOT being stored there.
2. Review ree-nextjs-admin-dashboard/src/lib/api/client.ts. Ensure it handles 401, 403, 404, 422, and 500 errors gracefully without exposing sensitive backend stack traces.
3. Review ackend/config/sanctum.php and ackend/config/cors.php. Ensure CSRF and stateful domains are configured.
4. Review the Laravel Policies (ackend/app/Policies) to ensure cross-project data isolation is enforced for Tasks, Files, Financials, etc. (Look for $user->can('view', ) or similar boundaries).
5. Do NOT add new features. If you find a security hole, fix it. If you fix it, commit it.
6. Write your findings to .superpowers/sdd/phase6-task-1-report.md. Make sure to list any issues found and whether they were fixed.
