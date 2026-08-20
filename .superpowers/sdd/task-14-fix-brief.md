### Task 14: Approvals & Revisions API (Fix)

**Findings from Review:**
The task was rejected due to "stream of consciousness" comments left in ApprovalController.php (e.g., // Map 'notes' from request to 'comments' in db if that's what's needed...).

**Instructions:**
1. Open pp/Http/Controllers/Api/V1/ApprovalController.php and RevisionController.php.
2. Remove all "stream of consciousness", conversational, or speculative comments.
3. Keep the code decisive and clean.
4. Run php artisan test --filter PolymorphicApiTest to ensure it still passes.
5. Commit your changes.
6. Append a short fix summary to .superpowers/sdd/task-14-report.md.
