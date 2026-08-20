### Task 1: Environment & API Architecture

**Global Constraints:**
- Do NOT store authentication tokens in localStorage. Use HTTP-only cookies via Sanctum SPA.
- Phase 4 is ONLY integration foundation.
- Use NEXT_PUBLIC_API_URL for backend URL. No hardcoded localhost URLs.

**Requirements:**
1. Check if rontend/.env.local exists. If not, create it. Add NEXT_PUBLIC_API_URL=http://localhost:8000.
2. Ensure you have xios installed in the frontend (
pm install axios).
3. Create rontend/src/lib/api/client.ts.
4. Configure the Axios client:
   - aseURL: process.env.NEXT_PUBLIC_API_URL
   - withCredentials: true (Critical for Sanctum CSRF and Session cookies)
   - Headers: Accept: 'application/json'
5. Add an interceptor to cleanly reject requests or format standard error responses for 401, 403, 422, etc.
6. Export an xios instance.
7. Export a csrf() helper function that makes a GET request to http://localhost:8000/sanctum/csrf-cookie. (Use NEXT_PUBLIC_API_URL for the base but note that /sanctum/csrf-cookie is outside /api/v1/).

Write your report to .superpowers/sdd/phase4-task-1-report.md.
