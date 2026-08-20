# Phase 5 Task 8 Report

## Summary of Changes
- Updated `src/app/(admin)/projects/[id]/page.tsx` to include `useAuth` and `hasRole` utilities for conditionally displaying the Financial tab based on user permissions (`System Administrator` or `Finance`).
- Added the `ContractsTab` and conditionally displayed `FinancialTab` components to the Project Detail view tabs context.
- Created `src/components/projects/ContractsTab.tsx`:
  - Implemented fetching project contracts via `/projects/{projectId}/contracts`.
  - Added UI placeholders for "Add Contract" and "Edit Contract" actions.
  - Displayed a table for existing contracts (including Contract Number, Start Date, End Date, Value).
- Created `src/components/projects/FinancialTab.tsx`:
  - Implemented logic for nested tabs inside the financial view ("Summary", "Payments", "Costs").
  - Fetched and displayed summary data (total vs used budget) from `/projects/{projectId}/financials`.
  - Fetched and displayed paginated data for payments and costs via `/projects/{projectId}/payments` and `/projects/{projectId}/costs`.
  - Provided placeholder buttons for "Add Payment" and "Add Cost".

## Commits
- `free-nextjs-admin-dashboard/`: `feat: implement contracts and financials tabs`
- Root repository: `feat: implement contracts and financials tabs`

Task completed successfully.
