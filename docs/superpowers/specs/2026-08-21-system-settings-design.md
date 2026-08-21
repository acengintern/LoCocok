# System Settings Design Specification

**Date:** 2026-08-21
**Topic:** System Settings (Administration)
**Status:** Approved

## 1. Overview
The System Settings module allows System Administrators to configure global agency parameters, such as the agency name, administrative contact email, and primary currency. This ensures that global preferences are dynamic and can be managed directly from the frontend dashboard.

## 2. Architecture & Data Model

We will use a **Key-Value Store** approach to provide flexibility for future configurations without requiring schema changes.

### Database Table: `settings`
- `id` (bigint, primary key)
- `key` (string, unique, indexed) — e.g., 'agency_name', 'currency'
- `value` (text, nullable) — The configuration value.
- `created_at`, `updated_at`

### Seeder: `SettingSeeder`
Default values to seed:
- `agency_name`: "Loco Creative Agency"
- `contact_email`: "admin@lococreative.com"
- `currency`: "IDR"

## 3. API Endpoints (Laravel)

### `GET /api/v1/settings`
- **Purpose**: Fetch all settings.
- **Access**: Authenticated users (`auth:sanctum`).
- **Response Format**:
  ```json
  {
    "success": true,
    "data": {
      "agency_name": "Loco Creative Agency",
      "contact_email": "admin@lococreative.com",
      "currency": "IDR"
    }
  }
  ```

### `POST /api/v1/settings`
- **Purpose**: Batch update system settings.
- **Access**: `auth:sanctum` AND must have `System Administrator` role.
- **Payload**:
  ```json
  {
    "settings": {
      "agency_name": "New Name",
      "currency": "USD"
    }
  }
  ```
- **Behavior**: Uses an `upsert` mechanism or loops through keys to `updateOrCreate`.

## 4. Frontend Implementation (Next.js)

### Component: `SettingsClient.tsx`
- **Location**: `src/app/(admin)/administration/settings/SettingsClient.tsx`
- **State Management**: Convert hardcoded `useState` initial values to dynamically loaded values from the API.
- **Lifecycle**:
  - `useEffect` to fetch `GET /api/v1/settings` on mount.
  - Set local form state.
- **Actions**:
  - `handleSave`: Sends `POST /api/v1/settings` with the modified form state.
  - Triggers the existing success/error Toast notification.

## 5. Security & Constraints
- Only System Administrators can view and use the `/administration/settings` UI page (already enforced by `AppSidebar` and Next.js layout restrictions).
- API POST route is strictly protected by Spatie Permission middleware (`role:System Administrator`).
- System-level governance (Sanctum Auth, Audit Logging) remain read-only UI indicators representing core codebase functionalities.
