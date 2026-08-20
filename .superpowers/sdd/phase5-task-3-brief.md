### Phase 5 Task 3: Notifications (5.12)

**Global Constraints:**
- Work exclusively inside ree-nextjs-admin-dashboard/.
- Use existing TailAdmin aesthetics.

**Requirements:**
1. Update src/components/Header/DropdownNotification.tsx.
   - On mount (and perhaps on an interval), fetch /api/v1/notifications/unread-count.
   - Update the badge number to show the unread count.
   - You can also fetch /api/v1/notifications to populate the recent dropdown list.
2. Create src/app/(admin)/notifications/page.tsx (the main notifications center).
   - Display a list of all notifications using the DataTable component or a custom list matching the aesthetic.
   - Fetch from /api/v1/notifications.
   - Add a "Mark all as read" button that calls POST /api/v1/notifications/mark-all-read.
   - Provide a way to mark individual notifications as read (PUT /api/v1/notifications/{id}/mark-read).
3. Handle loading and error states using your generic components.
4. Commit your changes inside the submodule (git add . && git commit -m "feat: implement notifications UI").
5. Commit the submodule update in the root directory.
6. Write your report to .superpowers/sdd/phase5-task-3-report.md.
