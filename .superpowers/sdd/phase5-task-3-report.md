# Phase 5 Task 3 Report: Notifications

## Summary of Changes
- Updated `src/components/header/NotificationDropdown.tsx` to dynamically fetch the unread notifications count from `/api/v1/notifications/unread-count` and a list of recent notifications from `/api/v1/notifications?limit=5`. Implemented a loading state and an empty state, handling the unread badge based on the response.
- Created the main notifications page at `src/app/(admin)/notifications/page.tsx` (using a server and client component setup with `NotificationsClient.tsx`).
- Integrated `DataTable` to display all notifications, and added buttons to "Mark Read" (per notification) and "Mark All as Read", targeting the backend endpoints (`PUT /api/v1/notifications/{id}/mark-read` and `POST /api/v1/notifications/mark-all-read`).
- Handled loading, empty, and error states gracefully in the UI.

## Commits
1. Submodule (`free-nextjs-admin-dashboard`):
   - `feat: implement notifications UI`
2. Root (`web-track-nextjs`):
   - `update submodule with notifications UI`
