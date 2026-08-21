# Task 3: Frontend Sign In Integration and Auth Callback Handler

## Task Details
**Files:**
- Modify: `free-nextjs-admin-dashboard/src/lib/api/client.ts`
- Modify: `free-nextjs-admin-dashboard/src/contexts/AuthContext.tsx`
- Modify: `free-nextjs-admin-dashboard/src/components/auth/SignInForm.tsx`
- Create: `free-nextjs-admin-dashboard/src/app/(full-width-pages)/(auth)/callback/page.tsx`

**Requirements:**
1. Update `src/lib/api/client.ts` to attach `Authorization: Bearer <auth_token>` from `localStorage` if present.
2. Update `src/contexts/AuthContext.tsx` to clear `localStorage.getItem('auth_token')` on logout.
3. Update `src/components/auth/SignInForm.tsx`:
   - Bind "Sign in with Google" button onClick to navigate to `${backendUrl}/api/v1/auth/google/redirect`.
   - Read `searchParams.get('error')` (e.g. `account_suspended`, `oauth_failed`) and show clear Alert message.
4. Create `src/app/(full-width-pages)/(auth)/callback/page.tsx` (using `Suspense` for App Router client navigation) to:
   - Extract `token` and `error` from URL search params.
   - Save `auth_token` to `localStorage`.
   - Call `refreshUser()`.
   - Redirect to `/dashboard`.
   - If error, redirect to `/signin?error=...`.
5. Run `npm run build` in `free-nextjs-admin-dashboard` to verify 0 errors.
6. Commit: `git commit -am "feat(auth): integrate Google sign in button and auth callback route in frontend"`
7. Report back.
