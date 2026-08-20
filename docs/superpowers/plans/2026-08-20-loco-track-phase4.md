# LOCO TRACK Phase 4 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Integrate Next.js frontend with Laravel Sanctum API using centralized auth, route protection, and typed foundational APIs.

**Architecture:** Next.js frontend interacting with Laravel API via a centralized axios client (or fetch wrapper). Cookie-based SPA authentication requiring CSRF token initialization.

**Tech Stack:** Next.js, TypeScript, Tailwind, TailAdmin (existing template).

## Global Constraints
- Do NOT store authentication tokens in localStorage. Use HTTP-only cookies via Sanctum SPA.
- Keep the existing TailAdmin design system. Do NOT replace the template.
- Phase 4 is ONLY integration foundation. Do NOT implement complete CRUD screens for entities yet.
- Use NEXT_PUBLIC_API_URL for backend URL. No hardcoded localhost URLs.

---

### Task 1: Environment & API Architecture

**Files:**
- Create: rontend/.env.local
- Create: rontend/src/lib/api/client.ts

- [ ] **Step 1: Environment Variables**
Configure NEXT_PUBLIC_API_URL in rontend/.env.local to point to the Laravel backend (e.g. http://localhost:8000).

- [ ] **Step 2: Create API Client**
Create an Axios client in rontend/src/lib/api/client.ts configured with withCredentials: true, aseURL: process.env.NEXT_PUBLIC_API_URL, and interceptors to handle 401/403/404/422 responses cleanly. Also implement a CSRF setup function.

---

### Task 2: TypeScript API Types

**Files:**
- Create: rontend/src/types/api.ts

- [ ] **Step 1: Define base Response structures**
Define interfaces for standard Laravel responses (ApiResponse<T>, PaginatedResponse<T>, ValidationError).

- [ ] **Step 2: Define Model Interfaces**
Define TypeScript interfaces for User, Role, Permission, Client, Project, etc., matching the API Resource output structure from Phase 3.

---

### Task 3: Auth Context & RBAC Foundation

**Files:**
- Create: rontend/src/contexts/AuthContext.tsx
- Create: rontend/src/hooks/useAuth.ts
- Create: rontend/src/lib/rbac.ts

- [ ] **Step 1: AuthContext implementation**
Implement React Context providing user, loading, login(), logout(), efreshUser(). The context should call /sanctum/csrf-cookie before login().

- [ ] **Step 2: RBAC utilities**
Create helper functions like hasRole(user, role), hasPermission(user, permission) in bac.ts.

---

### Task 4: Route Protection & Loading UX

**Files:**
- Create: rontend/src/components/ProtectedRoute.tsx
- Create: rontend/src/components/LoadingSpinner.tsx
- Create: rontend/src/components/ui/Alerts.tsx (or similar for unauthorized states)

- [ ] **Step 1: Create Loading/Error components**
Implement reusable loading and error UI components matching TailAdmin styling.

- [ ] **Step 2: ProtectedRoute component**
Implement a wrapper that redirects to /login if !user and !loading.

---

### Task 5: TailAdmin Dashboard Integration

**Files:**
- Modify: rontend/src/app/layout.tsx
- Modify: rontend/src/components/Header/index.tsx
- Modify: rontend/src/components/Sidebar/index.tsx
- Modify: rontend/src/app/page.tsx

- [ ] **Step 1: Wrap App with AuthContext**
Wrap the root layout in AuthContext.Provider.

- [ ] **Step 2: Integrate Navigation & Header**
Update Sidebar navigation using RBAC checks to conditionally show/hide links. Update Header to show the logged-in user's name and wire up a logout button.

- [ ] **Step 3: Secure Dashboard Page**
Wrap the main dashboard page (page.tsx) with ProtectedRoute.

---

### Task 6: Authentication Pages

**Files:**
- Modify: rontend/src/app/auth/signin/page.tsx (or create login/page.tsx depending on TailAdmin structure)

- [ ] **Step 1: Implement Login Form**
Wire up the existing login form to login() from AuthContext. Handle validation errors (422) and show them below fields.

---

### Task 7: CORS / Cookie Verification Test

**Files:**
- No file changes, just verify configuration.

- [ ] **Step 1: Build & Run verification**
Start Laravel API and Next.js. Attempt to log in via the browser. Ensure cookies are set and subsequent API requests (/api/v1/users/me) succeed. Write a short script or test in Next to verify this, or just rely on a 
pm run build and 
pm run lint step for Task 7.

