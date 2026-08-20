### Task 15: Notifications API

**Global Constraints:**
- API endpoints prefixed with /api/v1/.
- Standard API response structure using ApiResponse trait.
- Form Requests for validation.
- Enforce Laravel Policies on every endpoint.
- Write Feature/API tests for every implemented module (happy path, validation, authorization, ownership/isolation).

**Requirements:**
1. Create NotificationController.
2. Implement endpoints:
   - GET /api/v1/notifications (List notifications for current user)
   - GET /api/v1/notifications/unread-count (Get count of unread notifications)
   - PUT /api/v1/notifications/{id}/mark-read (Mark specific notification as read)
   - POST /api/v1/notifications/mark-all-read (Mark all as read)
3. Use Laravel's built-in DatabaseNotification model (if you use uth()->user()->notifications).
4. Format output using NotificationResource.
5. Authorization: A user can only view/mark read their own notifications. This is usually implicit via uth()->user()->notifications(), but if you inject a notification ID, ensure it belongs to the authenticated user.
6. Write tests in 	ests/Feature/NotificationApiTest.php to verify:
   - Unread count works.
   - Marking a notification as read works.
   - A user cannot mark another user's notification as read (403 or 404).

Ensure tests pass (php artisan test).
Commit your changes, then write your report to .superpowers/sdd/task-15-report.md.
