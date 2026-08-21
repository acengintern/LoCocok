# Agency Profile Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Revitalize the `/profile` page and backend endpoints to display authentic agency employee profile details, Google OAuth connection status, password management, and workload statistics.

**Architecture:** Extend Laravel `users` table with profile fields (`phone`, `bio`, `division`), implement `ProfileController` with profile update, password change, and stats endpoints, and update Next.js profile components with reactive API mutations and toast notifications.

**Tech Stack:** Laravel 11, PHP 8.2, PHPUnit, Next.js 16 (Turbopack), Tailwind CSS, TypeScript, Axios.

## Global Constraints
- Do not break existing user auth or role-permission bindings.
- Keep clean 100% test coverage with PHPUnit and zero TypeScript build errors.

---

### Task 1: Backend Database Migration and ProfileController Endpoints

**Files:**
- Create: `backend/database/migrations/2026_08_21_000001_add_profile_fields_to_users_table.php`
- Create: `backend/app/Http/Controllers/Api/V1/ProfileController.php`
- Modify: `backend/routes/api.php`
- Modify: `backend/app/Http/Resources/UserResource.php`
- Test: `backend/tests/Feature/ProfileTest.php`

**Interfaces:**
- Produces:
  - `PUT /api/v1/users/me/profile`
  - `PUT /api/v1/users/me/password`
  - `GET /api/v1/users/me/stats`

- [ ] **Step 1: Create migration for profile fields**
Add `phone`, `bio`, `division` to `users` table.

- [ ] **Step 2: Write feature tests in `ProfileTest.php`**
Test updating profile details, changing password (valid & invalid), and fetching stats.

- [ ] **Step 3: Implement `ProfileController.php` and register routes**
Implement `updateProfile`, `updatePassword`, `stats` methods.

- [ ] **Step 4: Run tests to verify they pass**
Run: `php artisan test --filter ProfileTest`
Expected: 100% PASS

- [ ] **Step 5: Commit backend changes**
```bash
git add backend/
git commit -m "feat(profile): add backend profile update, password change, and stats endpoints"
```

---

### Task 2: Frontend Profile Page Components Revitalization

**Files:**
- Modify: `free-nextjs-admin-dashboard/src/components/user-profile/UserMetaCard.tsx`
- Modify: `free-nextjs-admin-dashboard/src/components/user-profile/UserInfoCard.tsx`
- Create: `free-nextjs-admin-dashboard/src/components/user-profile/UserSecurityCard.tsx`
- Create: `free-nextjs-admin-dashboard/src/components/user-profile/UserStatsCard.tsx`
- Delete/Replace: `free-nextjs-admin-dashboard/src/components/user-profile/UserAddressCard.tsx`
- Modify: `free-nextjs-admin-dashboard/src/app/(admin)/(others-pages)/profile/page.tsx`

**Interfaces:**
- Consumes:
  - `PUT /api/v1/users/me/profile`
  - `PUT /api/v1/users/me/password`
  - `GET /api/v1/users/me/stats`
  - `useAuth()` & `useToast()`

- [ ] **Step 1: Update `UserMetaCard.tsx`**
Display dynamic avatar, name, `@username`, Role badge, Status badge, and Google verified status.

- [ ] **Step 2: Update `UserInfoCard.tsx`**
Display agency fields (Phone, Division, Bio, Email) with dynamic modal form calling `PUT /users/me/profile`.

- [ ] **Step 3: Create `UserSecurityCard.tsx`**
Display Google OAuth connection badge and password change form calling `PUT /users/me/password`.

- [ ] **Step 4: Create `UserStatsCard.tsx`**
Fetch and display real stats from `GET /users/me/stats` (Assigned Projects, Pending Tasks, Completed Tasks).

- [ ] **Step 5: Assemble in `profile/page.tsx` and delete `UserAddressCard.tsx`**
Mount all four cards in `profile/page.tsx`.

- [ ] **Step 6: Run build check**
Run: `npm run build` in `free-nextjs-admin-dashboard`
Expected: Clean compilation with 0 errors across 54 routes.

- [ ] **Step 7: Commit frontend changes**
```bash
git add free-nextjs-admin-dashboard/
git commit -m "feat(profile): revitalize profile page with dynamic agency info, security, and workload stats"
```
