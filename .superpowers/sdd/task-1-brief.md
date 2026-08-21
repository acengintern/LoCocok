# Task 1: Create SettingsContext, useSettings Hook, and Mount Provider

## Task Details
**Files:**
- Create: `free-nextjs-admin-dashboard/src/contexts/SettingsContext.tsx`
- Create: `free-nextjs-admin-dashboard/src/hooks/useSettings.ts`
- Modify: `free-nextjs-admin-dashboard/src/app/layout.tsx`

**Interfaces:**
```typescript
export interface SystemSettings {
  agency_name: string;
  contact_email: string;
  currency: "IDR" | "USD" | "SGD" | string;
}

export interface SettingsContextType {
  settings: SystemSettings;
  loading: boolean;
  refreshSettings: () => Promise<void>;
  formatCurrency: (amount?: number | null) => string;
}

export function useSettings(): SettingsContextType;
```

## Steps
1. Create `free-nextjs-admin-dashboard/src/contexts/SettingsContext.tsx` with `SettingsProvider`, fetching `GET /settings` on mount via `apiClient`, providing `settings`, `loading`, `refreshSettings`, and `formatCurrency`.
2. Create `free-nextjs-admin-dashboard/src/hooks/useSettings.ts` exporting `useSettings()`.
3. Wrap `RootLayout` in `free-nextjs-admin-dashboard/src/app/layout.tsx` with `<SettingsProvider>`.
4. Test: Run `npm run build` in `free-nextjs-admin-dashboard` to verify clean compilation.
5. Commit: `git commit -am "feat(frontend): implement SettingsContext, useSettings hook, and RootLayout integration"`
