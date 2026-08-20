### Phase 5 Task 9: Output Management & Content Planning (5.7 & 5.8)

**Global Constraints:**
- Work exclusively inside ree-nextjs-admin-dashboard/.
- Use existing TailAdmin aesthetics.

**Requirements:**
1. Create src/components/projects/OutputsTab.tsx.
   - List project outputs (fetch from /api/v1/projects/{projectId}/outputs).
   - Display target quantity, actual quantity, and progress visually.
   - Provide "Add Output", "Edit Output", "Delete" using Modal and Confirmation.
2. Create src/components/projects/ContentPlanningTab.tsx.
   - Fetch Briefs, Content Plans, and Scripts from their respective nested routes:
     - /api/v1/projects/{projectId}/briefs
     - /api/v1/projects/{projectId}/content-plans
     - /api/v1/projects/{projectId}/scripts
   - Use inner tabs or separate tables for Briefs, Plans, and Scripts.
   - For Content Plans, ensure output_type_id is supported per the Phase 2 audit requirements.
   - Support CRUD UI for each entity.
   - Show workflow status for each.
3. Integrate these tabs into the main src/app/(admin)/projects/[id]/page.tsx tabs array.
4. Commit your changes inside the submodule (git add . && git commit -m "feat: implement outputs and content planning tabs").
5. Commit the submodule update in the root directory.
6. Write your report to .superpowers/sdd/phase5-task-9-report.md.
