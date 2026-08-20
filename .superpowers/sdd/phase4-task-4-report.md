### Task 4 Report: Route Protection & Loading UX

**Work Completed:**
1. Created `LoadingSpinner.tsx` at `src/components/LoadingSpinner.tsx`. It uses Tailwind CSS to present a simple, centered spinner with the primary theme color.
2. Created `ProtectedRoute.tsx` at `src/components/ProtectedRoute.tsx`.
   - Utilizes the `useAuth()` hook.
   - Shows `<LoadingSpinner />` while checking the authentication state.
   - Redirects unauthenticated users to `/signin` using `useRouter` from `next/navigation`.
   - Renders its children once authentication is verified.

**Git Activity:**
1. Committed `LoadingSpinner.tsx` and `ProtectedRoute.tsx` inside the submodule (`free-nextjs-admin-dashboard/`).
2. Committed the submodule update in the root directory.

**Notes:**
- A custom `ErrorAlert` was deemed unnecessary as `TailAdmin` already provides a feature-complete `<Alert />` component under `src/components/ui/alert/Alert.tsx` that can handle any 403 or unauthorized states appropriately if required in the future.
- The redirect path used in `ProtectedRoute` is `/signin`, corresponding with the template's App Router setup using Route Groups (`(auth)/signin`).
