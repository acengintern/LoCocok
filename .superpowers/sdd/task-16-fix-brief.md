### Task 16: Dashboard API (Fix)

**Findings from Review:**
1. **Garbage Files Committed:** You accidentally committed ackend/test.php and ackend/update_routes_files.php. Remove them.
2. **SQL Logic Flaw:** In DashboardController@workload, you placed the 	asks.status filter in the WHERE clause. This causes users with only completed tasks to disappear from the result set, whereas users with zero tasks show up with 0. 
Move the task status filter into the LEFT JOIN closure. For example:
`php
$query->leftJoin('tasks', function ($join) {
    $join->on('users.id', '=', 'tasks.pic_id') // or however you're linking assignments
         ->whereNotIn('tasks.status', ['DONE', 'CANCELLED']); // match your actual enum states
});
`
*(Make sure to adjust the column names/relations based on your actual implementation, e.g. if it goes through 	ask_assignments first, apply the filter appropriately).*

**Instructions:**
1. Fix the SQL query in DashboardController.php.
2. Delete the garbage files.
3. Run php artisan test --filter DashboardApiTest to ensure it still passes.
4. Commit your changes.
5. Append a short fix summary to .superpowers/sdd/task-16-report.md.
