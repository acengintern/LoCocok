### Phase 5 Task 12: Approvals & Revisions (5.11)

**Global Constraints:**
- Work exclusively inside ree-nextjs-admin-dashboard/.
- Use existing TailAdmin aesthetics.

**Requirements:**
1. Create src/components/common/ApprovalHistory.tsx.
   - This component should take a 	arget_type (e.g., 'task', 'content-plan') and 	arget_id.
   - Fetch the approval history: /api/v1/{target_type}/{target_id}/approvals.
   - Fetch the revision history: /api/v1/{target_type}/{target_id}/revisions.
   - Display a unified or tabbed timeline/list of these interactions.
2. Create src/components/common/ApprovalActions.tsx.
   - This component provides the buttons to "Approve" or "Request Revision".
   - "Approve" should POST to /api/v1/{target_type}/{target_id}/approvals with { notes: "optional" }.
   - "Request Revision" should open a small Modal/Dialog to ask for notes, then POST to /api/v1/{target_type}/{target_id}/revisions with { notes: "required" }.
3. You do not need to deeply integrate this into every existing tab (since it requires a specific target), but demonstrate its usage by placing it at the bottom of the TasksTab.tsx detail modal, or simply export it so it's ready for Phase 6. Or add it to ContentPlanningTab.tsx for Briefs. Just place it somewhere visible for demonstration.
4. Commit your changes inside the submodule (git add . && git commit -m "feat: implement approvals and revisions ui").
5. Commit the submodule update in the root directory.
6. Write your report to .superpowers/sdd/phase5-task-12-report.md.
