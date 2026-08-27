# Task 2: Frontend Profile Page Components Revitalization

## Context & Purpose
Revitalize the Next.js `/profile` page and components to display authentic agency employee profile details, Google OAuth connection status, password management, and workload statistics.
Work in: `D:/01-projek/LocoCok/web-track-nextjs/free-nextjs-admin-dashboard`

## Requirements
1. **User Types**: Update `src/types/api.ts` to ensure `User` interface includes `phone?: string | null; bio?: string | null; division?: string | null;`.
2. **UserMetaCard.tsx**:
   - Clean TailAdmin card layout with avatar (Google or default fallback).
   - Display real user name, username (`@username`), roles badge (e.g. `System Administrator`), status badge (`ACTIVE`), and join date.
   - Display Google OAuth verification badge if `user.google_id` or `user.email_verified_at` exists.
   - Quick action button to trigger edit modal or scroll to edit.
3. **UserInfoCard.tsx**:
   - Displays real user agency fields: Full Name, Username, Email (Google Linked), Phone / WhatsApp, Division, Bio.
   - Modal form for editing details (Name, Phone, Division, Bio).
   - On submit, call `PUT /api/v1/users/me/profile` via `apiClient`, update context via `refreshUser()`, show success toast, and close modal.
4. **UserSecurityCard.tsx**:
   - Create `src/components/user-profile/UserSecurityCard.tsx`.
   - Section 1: Google OAuth Status (Shows connected Google email & ID with green verified badge).
   - Section 2: Change Password form (Current Password, New Password, Confirm Password).
   - Calls `PUT /api/v1/users/me/password` with loading state and error handling / toast notification.
5. **UserStatsCard.tsx**:
   - Create `src/components/user-profile/UserStatsCard.tsx`.
   - Fetches `GET /api/v1/users/me/stats` on mount.
   - Displays 4 metric tiles:
     - Active Projects (Total assigned/created projects)
     - Assigned Tasks (Total workload tasks)
     - Completed Tasks (Finished tasks count)
     - Completion Rate (% progress bar)
6. **Profile Page**:
   - Update `src/app/(admin)/(others-pages)/profile/page.tsx` to mount:
     `<UserMetaCard />`
     `<UserStatsCard />`
     `<UserInfoCard />`
     `<UserSecurityCard />`
   - Delete obsolete `src/components/user-profile/UserAddressCard.tsx`.
7. **Verification**:
   - Run `npm run build` to verify clean compilation with 0 TypeScript/build errors across all 54 routes.
8. **Git Commit**:
   - Commit all changes in `free-nextjs-admin-dashboard`.
   - Write full report to: `D:/01-projek/LocoCok/web-track-nextjs/.superpowers/sdd/task-2-report.md`.
