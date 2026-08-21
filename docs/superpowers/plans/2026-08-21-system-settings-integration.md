# System Settings Cross-Module Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement global System Settings state management (`SettingsContext` & `useSettings` hook) and connect dynamic Agency Name and Currency formatting across the sidebar, dashboard, and settings pages.

**Architecture:** A React Context (`SettingsProvider`) is mounted in the root layout to fetch `/api/v1/settings` on startup and cache the data. It exposes `settings`, `refreshSettings()`, and a `formatCurrency()` helper function that formats currency dynamically for IDR, USD, and SGD. Consuming components (`AppSidebar`, `SummaryCards`, `SettingsClient`) consume the hook reactively.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Axios (`apiClient`), Tailwind CSS v4.

## Global Constraints

- Backend endpoints: `GET /api/v1/settings` and `POST /api/v1/settings`.
- Response format: `{ success: true, data: { agency_name, contact_email, currency } }`.
- Default fallback values: `agency_name: "LOCO TRACK"`, `contact_email: "admin@lococreative.com"`, `currency: "IDR"`.
- Must pass `npm run build` with zero TypeScript errors.

---

### Task 1: Create `SettingsContext`, `useSettings` Hook, and Mount Provider

**Files:**
- Create: `free-nextjs-admin-dashboard/src/contexts/SettingsContext.tsx`
- Create: `free-nextjs-admin-dashboard/src/hooks/useSettings.ts`
- Modify: `free-nextjs-admin-dashboard/src/app/layout.tsx`

**Interfaces:**
- Produces:
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

- [ ] **Step 1: Create `src/contexts/SettingsContext.tsx`**

```tsx
'use client';

import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { apiClient } from '@/lib/api/client';

export interface SystemSettings {
  agency_name: string;
  contact_email: string;
  currency: string;
}

export interface SettingsContextType {
  settings: SystemSettings;
  loading: boolean;
  refreshSettings: () => Promise<void>;
  formatCurrency: (amount?: number | null) => string;
}

export const DEFAULT_SETTINGS: SystemSettings = {
  agency_name: "LOCO TRACK",
  contact_email: "admin@lococreative.com",
  currency: "IDR",
};

export const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshSettings = useCallback(async () => {
    try {
      const response = await apiClient.get('/settings');
      if (response.data?.data) {
        setSettings((prev) => ({
          ...prev,
          ...response.data.data,
        }));
      }
    } catch (error) {
      // Retain fallback defaults if unauthenticated or offline
      console.warn("Could not fetch system settings, using defaults.", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSettings();
  }, [refreshSettings]);

  const formatCurrency = useCallback((amount?: number | null): string => {
    const val = amount ?? 0;
    if (isNaN(val)) return "Rp 0";

    const curr = settings.currency || "IDR";
    switch (curr.toUpperCase()) {
      case "USD":
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 2,
        }).format(val);
      case "SGD":
        return new Intl.NumberFormat("en-SG", {
          style: "currency",
          currency: "SGD",
          maximumFractionDigits: 2,
        }).format(val);
      case "IDR":
      default:
        return new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          maximumFractionDigits: 0,
        }).format(val);
    }
  }, [settings.currency]);

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings, formatCurrency }}>
      {children}
    </SettingsContext.Provider>
  );
};
```

- [ ] **Step 2: Create `src/hooks/useSettings.ts`**

```typescript
import { useContext } from 'react';
import { SettingsContext, SettingsContextType } from '@/contexts/SettingsContext';

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
```

- [ ] **Step 3: Mount `SettingsProvider` in `src/app/layout.tsx`**

Modify `free-nextjs-admin-dashboard/src/app/layout.tsx` to wrap children with `SettingsProvider`:

```tsx
import { Inter } from 'next/font/google';
import './globals.css';
import "flatpickr/dist/flatpickr.css";
import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { SettingsProvider } from '@/contexts/SettingsContext';

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} font-sans antialiased dark:bg-gray-900`}>
        <ThemeProvider>
          <AuthProvider>
            <SettingsProvider>
              <SidebarProvider>{children}</SidebarProvider>
            </SettingsProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 4: Verify build passes**

Run: `npm run build` in `free-nextjs-admin-dashboard`  
Expected: Exit code 0 (Compiled successfully)

- [ ] **Step 5: Commit changes**

```bash
git add free-nextjs-admin-dashboard/src/contexts/SettingsContext.tsx free-nextjs-admin-dashboard/src/hooks/useSettings.ts free-nextjs-admin-dashboard/src/app/layout.tsx
git commit -m "feat(frontend): implement SettingsContext, useSettings hook, and RootLayout integration"
```

---

### Task 2: Integrate `SettingsContext` into `AppSidebar` and `SettingsClient`

**Files:**
- Modify: `free-nextjs-admin-dashboard/src/layout/AppSidebar.tsx`
- Modify: `free-nextjs-admin-dashboard/src/app/(admin)/administration/settings/SettingsClient.tsx`

**Interfaces:**
- Consumes: `useSettings()` from `@/hooks/useSettings`

- [ ] **Step 1: Update `AppSidebar.tsx` to use dynamic `agency_name`**

In `free-nextjs-admin-dashboard/src/layout/AppSidebar.tsx`:
1. Import `useSettings`:
   ```tsx
   import { useSettings } from "@/hooks/useSettings";
   ```
2. Inside `AppSidebar`:
   ```tsx
   const { settings } = useSettings();
   const agencyName = settings.agency_name || "LOCO TRACK";
   ```
3. Update brand logo header text:
   ```tsx
   <span className="font-bold text-lg tracking-tight text-gray-900 dark:text-white leading-none">
     {agencyName}
   </span>
   ```

- [ ] **Step 2: Update `SettingsClient.tsx` to trigger `refreshSettings()` on save**

In `free-nextjs-admin-dashboard/src/app/(admin)/administration/settings/SettingsClient.tsx`:
1. Import `useSettings`:
   ```tsx
   import { useSettings } from "@/hooks/useSettings";
   ```
2. Extract `refreshSettings`:
   ```tsx
   const { refreshSettings } = useSettings();
   ```
3. Inside `handleSave()`, call `await refreshSettings()` after successful POST:
   ```tsx
   await apiClient.post("/settings", {
     settings: {
       agency_name: agencyName,
       contact_email: contactEmail,
       currency: currency,
     }
   });
   await refreshSettings();
   ```

- [ ] **Step 3: Verify build passes**

Run: `npm run build` in `free-nextjs-admin-dashboard`  
Expected: Exit code 0

- [ ] **Step 4: Commit changes**

```bash
git add free-nextjs-admin-dashboard/src/layout/AppSidebar.tsx free-nextjs-admin-dashboard/src/app/\(admin\)/administration/settings/SettingsClient.tsx
git commit -m "feat(frontend): integrate dynamic agency name in AppSidebar and reactive refresh in SettingsClient"
```

---

### Task 3: Integrate Dynamic Currency Formatter into `SummaryCards`

**Files:**
- Modify: `free-nextjs-admin-dashboard/src/components/dashboard/SummaryCards.tsx`

**Interfaces:**
- Consumes: `formatCurrency` from `useSettings()`

- [ ] **Step 1: Update `SummaryCards.tsx` to use `formatCurrency` from `useSettings`**

In `free-nextjs-admin-dashboard/src/components/dashboard/SummaryCards.tsx`:
1. Import `useSettings`:
   ```tsx
   import { useSettings } from "@/hooks/useSettings";
   ```
2. Inside `SummaryCards`:
   ```tsx
   const { formatCurrency } = useSettings();
   ```
3. Remove the local hardcoded `formatCurrency` function so that it uses the dynamic global formatter directly.

- [ ] **Step 2: Run build and tests to verify entire integration**

Run: `npm run build` in `free-nextjs-admin-dashboard`  
Expected: Exit code 0, 51 static/dynamic pages compiled cleanly.

- [ ] **Step 3: Commit changes**

```bash
git add free-nextjs-admin-dashboard/src/components/dashboard/SummaryCards.tsx
git commit -m "feat(frontend): integrate dynamic formatCurrency in Dashboard SummaryCards"
```
