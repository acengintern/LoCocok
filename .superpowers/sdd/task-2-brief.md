# Task 2: Integrate SettingsContext into AppSidebar and SettingsClient

## Task Details
**Files:**
- Modify: `free-nextjs-admin-dashboard/src/layout/AppSidebar.tsx`
- Modify: `free-nextjs-admin-dashboard/src/app/(admin)/administration/settings/SettingsClient.tsx`

**Interfaces:**
- Consumes: `useSettings()` from `@/hooks/useSettings`

## Steps
1. In `src/layout/AppSidebar.tsx`:
   - Import `useSettings` from `@/hooks/useSettings`.
   - Read `settings` from `useSettings()`.
   - Replace the static text `"LOCO TRACK"` in the brand header with `settings.agency_name || "LOCO TRACK"`.
2. In `src/app/(admin)/administration/settings/SettingsClient.tsx`:
   - Import `useSettings` from `@/hooks/useSettings`.
   - Extract `refreshSettings` from `useSettings()`.
   - Call `await refreshSettings()` in `handleSave()` after the POST request succeeds.
3. Test: Run `npm run build` in `free-nextjs-admin-dashboard` to verify clean compilation with 0 errors.
4. Commit: `git commit -am "feat(frontend): integrate dynamic agency name in AppSidebar and reactive refresh in SettingsClient"`
