### Task 4: Route Protection & Loading UX

**Global Constraints:**
- Phase 4 is ONLY integration foundation.
- Keep the existing TailAdmin design system. Do NOT replace the template.

**Requirements:**
1. Work inside ree-nextjs-admin-dashboard/.
2. Create src/components/LoadingSpinner.tsx. It should be a simple Tailwind-based spinner centered on the screen, matching TailAdmin's aesthetic if possible, or just a clean generic spinner.
3. Create src/components/ProtectedRoute.tsx.
   - It should accept children.
   - It should use the useAuth() hook.
   - If loading is true, return the LoadingSpinner.
   - If !loading and !user, redirect to /auth/signin using useRouter() or Next.js edirect() (or handle it cleanly on the client side since it's an SPA approach). Note: TailAdmin's default sign-in page is /auth/signin.
   - If !loading and user, render children.
4. (Optional but recommended) Create an Error Alert component or generic fallback UI component if you think it's necessary for handling 403s/unauthorized states, though ProtectedRoute is the main focus.
5. Export everything cleanly.
6. Commit your changes inside the submodule, then commit the submodule update in the root.
7. Write your report to .superpowers/sdd/phase4-task-4-report.md in the root directory.
