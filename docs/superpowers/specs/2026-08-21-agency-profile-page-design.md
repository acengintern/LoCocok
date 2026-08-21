# Agency Profile Page Revitalization - Design Specification

## 1. Overview & Goals
Revitalize the Next.js `/profile` page and supporting Laravel backend endpoints to replace generic TailAdmin template placeholders (e.g. Arizona addresses, Tax IDs, Pimjo social links, and fake names) with an authentic, dynamic, and agency-relevant profile workspace.

---

## 2. Architecture & Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js (/profile)                       │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ 1. UserMetaCard (Avatar, Full Name, Roles, Join Date) │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ 2. UserInfoCard (Personal Details, Phone, Bio, Edit)  │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ 3. UserSecurityCard (Google OAuth Status, Password)   │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ 4. UserStatsCard (Assigned Projects, Tasks Progress)  │  │
│  └───────────────────────────────────────────────────────┘  │
└──────────────────────────────┬──────────────────────────────┘
                               │ REST API (Sanctum Authenticated)
┌──────────────────────────────▼──────────────────────────────┐
│                      Laravel Backend                        │
│  • GET  /api/v1/me (Extended with phone, bio, division)     │
│  • PUT  /api/v1/users/me/profile (Update name, phone, bio)  │
│  • PUT  /api/v1/users/me/password (Update password)         │
│  • GET  /api/v1/users/me/stats (Assigned projects & tasks)  │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Database Schema Updates
Add optional profile metadata fields to `users` table via migration `2026_08_21_000001_add_profile_fields_to_users_table.php`:
- `phone` (string, nullable)
- `bio` (text, nullable)
- `division` (string, nullable)

---

## 4. Backend Endpoints & Security Logic

### 4.1. `PUT /api/v1/users/me/profile`
- **Request Body**:
  - `name`: `required|string|max:255`
  - `phone`: `nullable|string|max:50`
  - `division`: `nullable|string|max:100`
  - `bio`: `nullable|string|max:1000`
- **Response**: `UserResource` with updated data and success message.

### 4.2. `PUT /api/v1/users/me/password`
- **Validation**:
  - `current_password`: `nullable|string` (required only if user currently has a password set).
  - `password`: `required|string|min:8|confirmed`
- **Logic**:
  - If user has an existing password, verify `Hash::check($request->current_password, $user->password)`.
  - Update user's password to `Hash::make($request->password)`.
  - Log password change activity.

### 4.3. `GET /api/v1/users/me/stats`
- **Response**:
  - `total_projects`: Count of active projects where user is assigned or created.
  - `total_tasks`: Count of tasks assigned to user.
  - `completed_tasks`: Count of completed tasks assigned to user.
  - `pending_tasks`: Count of active/in-progress tasks assigned to user.

---

## 5. Frontend UI Components

### 5.1. `UserMetaCard.tsx`
- Displays user's Google/uploaded avatar with fallback.
- Displays full name, username badge (`@username`), roles badge (e.g. `System Administrator`), account status (`ACTIVE`), and join date.
- Google OAuth connected badge with verified checkmark.

### 5.2. `UserInfoCard.tsx`
- Displays read-only view of Name, Username, Email, Phone, Division, Bio.
- Modal dialog for editing profile information (Name, Phone, Division, Bio) with real-time saving and Toast notification feedback.

### 5.3. `UserSecurityCard.tsx` (Replaces `UserAddressCard.tsx`)
- Displays Google OAuth connection status.
- Form to update account password securely.
- Handles validation errors (e.g. password mismatch, invalid current password).

### 5.4. `UserStatsCard.tsx`
- Visual metric cards displaying:
  - Active Assigned Projects
  - Pending Tasks
  - Completed Tasks
  - Completion Rate percentage

---

## 6. Testing & Verification Plan
1. Backend feature test suite `ProfileTest.php`:
   - Test profile update (`PUT /users/me/profile`).
   - Test password change with correct & incorrect current password (`PUT /users/me/password`).
   - Test user stats retrieval (`GET /users/me/stats`).
2. Frontend integration verification:
   - Run `npm run build` to ensure 0 TypeScript or compile errors across all 54 routes.
   - Verify modal submission updates state smoothly without page reload.
