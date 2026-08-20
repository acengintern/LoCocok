### Phase 5 Task 1: UX Consistency & Reusable Components

**Global Constraints:**
- Work exclusively inside ree-nextjs-admin-dashboard/.
- Use existing TailAdmin aesthetics.

**Requirements:**
1. Create src/components/common/DataTable.tsx. It should accept columns, data, pagination metadata, loading state, and an empty state message.
2. Create src/components/common/Modal.tsx. A generic modal overlay that matches the template's dark/light modes.
3. Create src/components/common/ConfirmationDialog.tsx. Uses Modal to ask for Yes/No confirmation (useful for deletes).
4. Create src/components/common/StatusBadge.tsx. A badge component mapping status strings (like 'DRAFT', 'APPROVED', 'ACTIVE') to specific tailwind colors.
5. Create src/components/common/EmptyState.tsx. A centered empty state graphic or text.
6. Create src/components/common/ErrorState.tsx. A component showing an error message and a retry button.
7. Ensure all components are cleanly exported.
8. Commit your changes inside the submodule (git add . && git commit -m "feat: reusable ui components").
9. Commit the submodule update in the root directory.
10. Write your report to .superpowers/sdd/phase5-task-1-report.md.
