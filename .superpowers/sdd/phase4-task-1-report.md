# Phase 4 Task 1 Report

## Summary of Commits
- `free-nextjs-admin-dashboard`: 
  - `feat: configure axios API client for sanctum auth` (a72ddb9)
- Root repository: 
  - `chore: phase4 task 1 - setup api client` (committed submodule updates)

## Changes Made
1. Checked for `.env.local` in `free-nextjs-admin-dashboard` and created it with `NEXT_PUBLIC_API_URL=http://localhost:8000`.
2. Installed `axios` as a dependency in the Next.js frontend (`npm install axios`).
3. Overwrote the previous `src/lib/api/client.ts` fetch wrapper with an Axios configuration.
4. Configured the Axios instance with:
   - `baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'`
   - `withCredentials: true` (Critical for Laravel Sanctum SPA authentication)
   - Headers: `Accept: 'application/json'`
5. Added an Axios response interceptor to handle common errors such as `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, and `422 Unprocessable Entity`.
6. Exported the configured `apiClient` Axios instance.
7. Exported a `csrf()` helper function that makes a GET request to `/sanctum/csrf-cookie` to initialize CSRF protection prior to auth requests.

All tasks for Phase 4 Task 1 are completed successfully.
