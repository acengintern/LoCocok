# System Settings Cross-Module Integration Design

**Date:** 2026-08-21  
**Status:** Approved  
**Author:** Antigravity / AI Pair Programming  

---

## 1. Executive Summary

This design specification details the full integration of the System Settings module across all application pages and components in the Next.js frontend, connecting dynamically to the Laravel REST API (`GET /api/v1/settings` & `POST /api/v1/settings`).

Key deliverables:
1. A global `SettingsContext` and `useSettings()` custom React hook.
2. Centralized, dynamic currency formatting (`formatCurrency`) that formats monetary figures across dashboards, projects, and financial widgets based on active currency (`IDR`, `USD`, `SGD`).
3. Dynamic Agency Name display in the sidebar brand header and layout titles.
4. Instant cache invalidation and UI state synchronization when settings are updated in `/administration/settings`.

---

## 2. Architecture & Data Flow

```
+-------------------------------------------------------------+
|                     Laravel Backend                         |
|   - Database: `settings` (key-value store)                  |
|   - Caching: `Cache::rememberForever('system_settings')`    |
|   - Routes: GET & POST /api/v1/settings                     |
+-------------------------------------------------------------+
                              |
                              | HTTP (Bearer Token / Cookie)
                              v
+-------------------------------------------------------------+
|             Next.js `SettingsProvider`                      |
|   - Location: `src/contexts/SettingsContext.tsx`            |
|   - Hook: `src/hooks/useSettings.ts`                        |
|   - Holds: { agency_name, contact_email, currency }         |
|   - Exposes: formatCurrency(), refreshSettings()            |
+-------------------------------------------------------------+
           |                      |                      |
           v                      v                      v
+--------------------+ +--------------------+ +--------------------+
|   `AppSidebar`     | |   `SummaryCards`   | |  `SettingsClient`  |
| - Shows dynamic    | | - Formats money    | | - Mutates settings |
|   agency name      | |   via helper       | | - Calls refresh    |
+--------------------+ +--------------------+ +--------------------+
```

---

## 3. Detailed Component Specifications

### 3.1 `SettingsContext` & `useSettings` Hook
- **Files:**
  - `src/contexts/SettingsContext.tsx`
  - `src/hooks/useSettings.ts`
- **State Definition:**
  ```typescript
  interface SystemSettings {
    agency_name: string;
    contact_email: string;
    currency: "IDR" | "USD" | "SGD" | string;
  }

  interface SettingsContextType {
    settings: SystemSettings;
    loading: boolean;
    refreshSettings: () => Promise<void>;
    formatCurrency: (amount?: number | null) => string;
  }
  ```
- **Fallback Defaults:**
  - `agency_name`: `"LOCO TRACK"`
  - `contact_email`: `"admin@lococreative.com"`
  - `currency`: `"IDR"`
- **Currency Formatter Logic:**
  - `IDR` -> `new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 })`
  - `USD` -> `new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 })`
  - `SGD` -> `new Intl.NumberFormat("en-SG", { style: "currency", currency: "SGD", maximumFractionDigits: 2 })`
  - Handles `null`, `undefined`, `NaN` gracefully (returns e.g. `"Rp 0"`, `"$0.00"`, `"S$0.00"`).

### 3.2 Provider Placement
- Wrapped in `src/app/(admin)/layout.tsx` (or `src/app/layout.tsx`) so all administrative and operational dashboard routes have access without requiring individual component-level fetches.

### 3.3 Target Consuming Modules

| Component / Page | Integrated Field / Helper | Behavior |
|---|---|---|
| `src/layout/AppSidebar.tsx` | `settings.agency_name` | Replaces static `"LOCO TRACK"` text in brand header with dynamic agency name |
| `src/components/dashboard/SummaryCards.tsx` | `formatCurrency()` | Replaces hardcoded `Rp` IDR format with dynamic active currency format |
| `src/app/(admin)/administration/settings/SettingsClient.tsx` | `refreshSettings()` | Calls `refreshSettings()` after saving so all open views immediately update |
| `src/app/(admin)/projects/page.tsx` & detail views | `formatCurrency()` | Ensures financial/budget fields format according to global currency |

---

## 4. Error Handling & Resilience

1. **Network Disconnection / API Outage:** If `/api/v1/settings` is unreachable, `SettingsProvider` catches the error, logs a warning, and gracefully retains the default fallback settings (`LOCO TRACK`, `IDR`).
2. **Unauthenticated Access:** Provider tolerates 401 unauthenticated requests during initial public landing or logout transitions.
3. **Invalid Values:** Numeric formatter safeguards against non-numeric inputs with zero-value formatting.

---

## 5. Verification & Testing Strategy

1. **Type & Build Check:** Run `npm run build` in `free-nextjs-admin-dashboard`.
2. **Functional Test Scenarios:**
   - Change currency to `USD` in `/administration/settings` -> Verify `SummaryCards` on Dashboard updates from `Rp ...` to `$ ...`.
   - Change agency name to `"Creative Studio X"` -> Verify Sidebar header brand changes to `"Creative Studio X"`.
   - Reload page -> Verify state persists across page transitions.
