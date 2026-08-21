# Task 1: Modernize SignInForm.tsx and signin/page.tsx

## Task Details
**Files:**
- Modify: `free-nextjs-admin-dashboard/src/components/auth/SignInForm.tsx`
- Modify: `free-nextjs-admin-dashboard/src/app/(full-width-pages)/(auth)/signin/page.tsx`

**Requirements:**
1. Remove the "Back to dashboard" top link.
2. Replace social auth buttons with a single, full-width "Sign in with Google" button with TailAdmin styling.
3. Keep Username/Email + Password form with toggleable eye icon, "Ingat saya" checkbox, "Lupa password?" link, and full-width "Sign In" button.
4. Integrate `useSettings()` to show dynamic agency name (`settings.agency_name || "LOCO TRACK"`).
5. Update `signin/page.tsx` metadata.
6. Verify with `npm run build` (0 errors).
7. Commit: `git commit -am "feat(auth): modernize SignInForm with TailAdmin design and single Google auth"`
