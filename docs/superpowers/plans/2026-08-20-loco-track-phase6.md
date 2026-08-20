# LOCO TRACK Phase 6 Verification & QA Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Verify and refine the existing LOCO TRACK application (Backend + Frontend) to ensure it is production-ready across functionality, UX, security, and integration.

**Architecture:** Next.js frontend + Laravel Sanctum API. 

## Global Constraints
- Phase 6 is NOT a feature expansion phase. Do NOT add new business modules.
- Do NOT replace TailAdmin or redesign the UI.
- Do NOT store tokens in localStorage.
- Do NOT use mock data.
- Fix genuine bugs, responsive issues, and lint/build failures.
- Document findings for the final report.

---

### Task 1: API & Security Audit (6.2, 6.3, 6.6, 6.7, 6.11)

**Files:**
- Read/Verify: ackend/routes/api.php, ackend/app/Policies/*.php, rontend/src/contexts/AuthContext.tsx, rontend/src/lib/api/client.ts
- Target: .superpowers/sdd/phase6-task-1-report.md

- [ ] **Step 1: Auth & Cookie Security Check**
Verify localStorage is not used for tokens in the frontend codebase. Verify Sanctum config is enforcing stateful domains. Verify CSRF is enabled.
- [ ] **Step 2: RBAC & Data Isolation Check**
Review Laravel policies to ensure data isolation (e.g., cross-project access blocks). Review frontend route protection.
- [ ] **Step 3: API Error Handling**
Verify the piClient interceptors correctly handle 401, 403, 404, 422, 500 errors.

---

### Task 2: Code Quality, UI/UX, and Responsive Audit (6.1, 6.8, 6.9, 6.10, 6.12)

**Files:**
- Read/Verify: rontend/src/components/**/*.tsx, rontend/src/app/**/*.tsx
- Target: .superpowers/sdd/phase6-task-2-report.md

- [ ] **Step 1: Code Quality Scan**
Check for ny types, duplicated components, unused imports, or dead code in the frontend. Fix minor ones if found.
- [ ] **Step 2: UI/UX & Responsive Scan**
Verify the use of TailAdmin classes (e.g., grid system) to ensure responsive behavior across major pages. Ensure loading/empty/error states are implemented consistently.
- [ ] **Step 3: Performance Scan**
Check for excessive eager loading in Laravel ($with arrays) or missing dependencies in React useEffect arrays.

---

### Task 3: Backend Automated Testing & Verification (6.4, 6.5, 6.13, 6.14)

**Files:**
- Target: .superpowers/sdd/phase6-task-3-report.md

- [ ] **Step 1: Run Backend Tests**
Execute cd backend && php artisan test. Note the number of tests, assertions, and any failures.
- [ ] **Step 2: Database & Workflow Checks**
Verify the database schema matches the required workflow (Client -> Project -> Brief -> Content Plan -> Script -> Task -> Output -> File). Note any gaps.

---

### Task 4: Frontend Automated Testing & Final Build (6.13, 6.14)

**Files:**
- Target: .superpowers/sdd/phase6-task-4-report.md

- [ ] **Step 1: Run Frontend Tests/Lint**
Execute cd free-nextjs-admin-dashboard && npm run lint. Fix any blocking issues.
- [ ] **Step 2: Run Frontend Build**
Execute cd free-nextjs-admin-dashboard && npm run build. Verify it succeeds.

---

### Task 5: Final Audit Report Compilation

**Files:**
- Create: docs/superpowers/reports/Phase6_Audit.md

- [ ] **Step 1: Compile Report**
Read all previous reports from Tasks 1-4. Generate the final Phase6_Audit.md according to the 18-point requirement list. Use severity levels. Give a final "READY FOR PRODUCTION" or "NOT READY FOR PRODUCTION" assessment.
- [ ] **Step 2: Commit**
Commit the final report to the repository.
