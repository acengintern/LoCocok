# LOCO TRACK Phase 5 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Implement the frontend feature modules for LOCO TRACK using the existing TailAdmin design system and integrating with the Laravel API.

**Architecture:** Next.js client-side/server-side components adhering to TailAdmin UI conventions, fetching from Laravel Sanctum API.

**Tech Stack:** Next.js, Tailwind CSS, TailAdmin.

## Global Constraints
- Work exclusively inside ree-nextjs-admin-dashboard/.
- Do NOT replace TailAdmin. Use existing layouts, cards, tables, forms, etc.
- Do NOT hardcode business data/statistics. Consume the API.
- Do NOT bypass the Laravel API.
- Reuse UX components instead of duplicating CRUD logic.
- Phase 5 is broken into 12 execution tasks.
- For every task, commit your work in the submodule, then update the submodule hash in the root.

---

### Task 1: UX Consistency & Reusable Components (5.13)

**Files:**
- Create: src/components/common/DataTable.tsx
- Create: src/components/common/Modal.tsx
- Create: src/components/common/ConfirmationDialog.tsx
- Create: src/components/common/StatusBadge.tsx
- Create: src/components/common/EmptyState.tsx
- Create: src/components/common/ErrorState.tsx

- [ ] **Step 1: Create generic components**
Implement these components leveraging existing TailAdmin aesthetics. The DataTable should support columns, data, pagination, and a loading state. Modal and ConfirmationDialog should handle overlay and basic actions.

- [ ] **Step 2: Commit changes**
Commit to submodule, then root.

---

### Task 2: Dashboard (5.1)

**Files:**
- Modify: src/app/(admin)/dashboard/page.tsx
- Create: src/components/Dashboard/SummaryCards.tsx
- Create: src/components/Dashboard/WorkloadChart.tsx

- [ ] **Step 1: Implement Dashboard UI**
Fetch /api/v1/dashboard/summary and /api/v1/dashboard/workload. Handle loading and error states. Render total projects, active projects, and workload using TailAdmin charts and metric cards.

- [ ] **Step 2: Commit changes**

---

### Task 3: Notifications (5.12)

**Files:**
- Modify: src/components/Header/DropdownNotification.tsx
- Create: src/app/(admin)/notifications/page.tsx

- [ ] **Step 1: Header Integration**
Fetch /api/v1/notifications/unread-count in DropdownNotification.tsx and show the badge. Update to show recent notifications.

- [ ] **Step 2: Notifications Page**
Implement list of notifications. Support "mark as read" and "mark all as read". 

- [ ] **Step 3: Commit changes**

---

### Task 4: Master Data (5.2)

**Files:**
- Create: src/app/(admin)/master-data/layout.tsx
- Create: src/app/(admin)/master-data/teams/page.tsx (and similar for Project Types, Output Types, Task Types, File Types)

- [ ] **Step 1: Master Data UI**
Create generic CRUD pages for Master Data entities. Use the reusable DataTable and Modal for create/edit. Protect actions behind hasRole('System Administrator').

- [ ] **Step 2: Commit changes**

---

### Task 5: Users & RBAC (5.3)

**Files:**
- Create: src/app/(admin)/users/page.tsx
- Create: src/app/(admin)/roles/page.tsx

- [ ] **Step 1: Users & Roles UI**
Implement User list, create, edit, and role assignment. Restrict to Admin.

- [ ] **Step 2: Commit changes**

---

### Task 6: Clients (5.4)

**Files:**
- Create: src/app/(admin)/clients/page.tsx
- Create: src/app/(admin)/clients/[id]/page.tsx

- [ ] **Step 1: Clients CRUD**
Implement Client list, detail, create, and edit. Filter by status, PIC.

- [ ] **Step 2: Commit changes**

---

### Task 7: Projects (5.5)

**Files:**
- Create: src/app/(admin)/projects/page.tsx
- Create: src/app/(admin)/projects/[id]/page.tsx

- [ ] **Step 1: Projects List & Detail Base**
Implement Projects list with search, status/priority filters.
Implement Project Detail shell (information, team, dates) fetching with ?include=client,projectType,ae,sms,cd.

- [ ] **Step 2: Commit changes**

---

### Task 8: Contracts & Financials (5.6)

**Files:**
- Create: src/components/Projects/ContractsTab.tsx
- Create: src/components/Projects/FinancialTab.tsx

- [ ] **Step 1: Contracts & Financial UI**
Integrate into the Project Detail page. Implement contract CRUD. Implement financial summary, payments, and costs. Secure behind Admin/Finance roles.

- [ ] **Step 2: Commit changes**

---

### Task 9: Output Management & Content Planning (5.7 & 5.8)

**Files:**
- Create: src/components/Projects/OutputsTab.tsx
- Create: src/components/Projects/ContentPlanningTab.tsx

- [ ] **Step 1: Outputs & Content**
Implement output tracking (target vs actual). Implement Briefs, Content Plans, and Scripts UI. Role-based actions for SMS (create) and CD (review).

- [ ] **Step 2: Commit changes**

---

### Task 10: Task Management (5.9)

**Files:**
- Create: src/app/(admin)/tasks/page.tsx (Global)
- Create: src/components/Projects/TasksTab.tsx

- [ ] **Step 1: Task UI**
Global task list for the user. Project-specific task list. Create, edit, update status. Assignment management.

- [ ] **Step 2: Commit changes**

---

### Task 11: Files & Versioning (5.10)

**Files:**
- Create: src/components/Projects/FilesTab.tsx

- [ ] **Step 1: Files UI**
Implement file upload, list, version history, download. Show current version indicator.

- [ ] **Step 2: Commit changes**

---

### Task 12: Approvals & Revisions (5.11)

**Files:**
- Create: src/components/common/ApprovalHistory.tsx
- Create: src/components/common/ApprovalActions.tsx

- [ ] **Step 1: Reusable Approval UI**
Create components that fetch and display /api/v1/{type}/{id}/approvals and /revisions. Plug them into Tasks, Content Plans, Scripts where applicable based on role.

- [ ] **Step 2: Commit changes**

---

### Task 13: Final Testing & Audit (5.14 & 5.15)

**Files:**
- No code creation, purely verification and reporting.

- [ ] **Step 1: Verification**
Run 
pm run lint and 
pm run build. Ensure responsive design.
- [ ] **Step 2: Report**
Generate Phase5_Audit.md containing the final comprehensive report.

