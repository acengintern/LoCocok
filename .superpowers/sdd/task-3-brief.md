# Task 3: Integrate Dynamic Currency Formatter into SummaryCards

## Task Details
**Files:**
- Modify: `free-nextjs-admin-dashboard/src/components/dashboard/SummaryCards.tsx`

**Interfaces:**
- Consumes: `formatCurrency` from `useSettings()`

## Steps
1. In `src/components/dashboard/SummaryCards.tsx`:
   - Import `useSettings` from `@/hooks/useSettings`.
   - Extract `formatCurrency` from `useSettings()`.
   - Remove the local hardcoded `formatCurrency` function that previously formatted `IDR` / `"Rp 0"`.
2. Test: Run `npm run build` in `free-nextjs-admin-dashboard` to verify clean compilation with 0 errors across all 51 routes.
3. Commit: `git commit -am "feat(frontend): integrate dynamic formatCurrency in Dashboard SummaryCards"`
