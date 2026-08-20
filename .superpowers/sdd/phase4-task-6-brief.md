### Task 6: Authentication Pages

**Global Constraints:**
- Phase 4 is ONLY integration foundation.

**Requirements:**
1. Work inside ree-nextjs-admin-dashboard/.
2. Locate the existing sign-in page (src/app/auth/signin/page.tsx or similar, depending on the template structure - it might be in src/components/Auth/Signin.tsx).
3. Wire the login form up to the AuthContext's login() function.
   - Replace dummy form submissions with an actual call to login(email, password).
   - Prevent default form submission.
   - On success, redirect to /dashboard or / (wherever the protected route is).
   - Catch and handle validation errors (422). If error.response.data.errors exists, display those errors below the relevant input fields (email, password).
   - Also handle general errors (like 401 Unauthorized for bad credentials) and show a generic error alert.
4. Ensure the UI looks clean and matches the existing template.
5. Commit your changes inside the submodule, then commit the submodule update in the root.
6. Write your report to .superpowers/sdd/phase4-task-6-report.md in the root directory.
