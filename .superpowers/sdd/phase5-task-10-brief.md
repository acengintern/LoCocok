### Phase 5 Task 10: Task Management (5.9)

**Global Constraints:**
- Work exclusively inside ree-nextjs-admin-dashboard/.
- Use existing TailAdmin aesthetics.

**Requirements:**
1. Create src/app/(admin)/production/tasks/page.tsx (Global Tasks List).
   - Show a global list of tasks using DataTable.
   - Implement filters (status, priority, assignee).
2. Create src/components/Projects/TasksTab.tsx.
   - Implement the project-specific task list inside the Project Details view.
   - Fetch from /api/v1/projects/{projectId}/tasks.
   - Provide "Create Task", "Edit Task", and "Delete Task" via Modal.
3. The Task UI should show: task number, project (if global), title, task type, assignees, priority, due date, status.
4. Implement an Assignment Interface (either in the Edit Task modal or a separate modal).
   - Use PUT /api/v1/tasks/{taskId}/assign with { user_ids: [...] }.
5. Implement Status Update UI. Only assignees (or Admins) can update status natively, but on the frontend just provide the dropdown/buttons and let the API return 403 if unauthorized. Catch and display the error cleanly.
6. Commit your changes inside the submodule (git add . && git commit -m "feat: implement global and project tasks UI").
7. Commit the submodule update in the root directory.
8. Write your report to .superpowers/sdd/phase5-task-10-report.md.
