# Design Specification: LOCO TRACK Admin Dashboard (Executive Command Center)

**Date:** 2026-08-20  
**Target Role:** System Administrator (Admin)  
**Status:** Approved  

---

## 1. Objective
Transform the default `/dashboard` into an Executive & Operations Command Center specifically tailored for the System Administrator, providing high-level KPIs, real-time workload tracking, financial overview, recent campaign progression, and fast administrative shortcuts.

---

## 2. Layout & Component Architecture

### 2.1 Header & Quick Actions Toolbar
- **Greeting Banner**: "Welcome back, Administrator" with current date and quick status summary.
- **Action Shortcuts**:
  - `+ New Project` (redirects to `/projects` with modal trigger / create)
  - `+ Add Client` (redirects to `/administration/clients`)
  - `Manage Users` (redirects to `/administration/users`)
  - `Permission Matrix` (redirects to `/administration/roles`)

### 2.2 Top KPI Summary Cards (4 Cards)
1. **Total Projects**: Total registered projects with breakdown badge (Active vs Completed).
2. **Active Clients**: Total onboarded brand clients with Active status.
3. **Total Pipeline Revenue**: Formatted IDR currency (`Rp xxx.xxx.xxx`) from total nett project revenues.
4. **Pending Approvals & Overdue**: Combined alert card showing items waiting for review or requiring intervention.

### 2.3 Visual Analytics Grid (2 Columns on Desktop)
1. **Team Workload Distribution (Bar Chart)**: Real-time count of active task assignments grouped by team members (AE, SMS, Graphic Designer, Video Editor).
2. **Project Status Breakdown (Progress / Status Distribution)**: Visual donut/horizontal distribution showing proportions of projects across workflow stages (`CONTENT_PLANNING`, `DESIGN`, `EDITING`, `QC_INTERNAL`, `APPROVED`, `DONE`).

### 2.4 Recent Active Projects Table
A clean, streamlined DataTable showing the top 6 most recent projects:
- **Project Name & Code**: e.g., `PRJ-0001 — Cawan Putih`
- **Client**: Brand name link
- **PIC Team**: AE badge and SMS badge
- **Priority**: Badge (`LOW`, `MID`, `HIGH`, `URGENT`)
- **Status**: Status badge (`BRIEF_RECEIVED`, `CONTENT_PLANNING`, `DESIGN`, `PUBLISHED`, `DONE`)
- **Action**: "View Detail" button redirecting to `/projects/[id]`

---

## 3. Data Flow & API Contracts

### Endpoint: `GET /api/v1/dashboard/summary`
```json
{
  "success": true,
  "message": "Dashboard summary retrieved successfully.",
  "data": {
    "total_projects": 91,
    "active_projects": 15,
    "completed_projects": 76,
    "total_clients": 54,
    "revenue": 145000000.0,
    "pending_approvals": 0,
    "status_distribution": {
      "CONTENT_PLANNING": 12,
      "DESIGN": 2,
      "PUBLISHED": 1,
      "DONE": 76
    },
    "recent_projects": [
      {
        "id": 1,
        "project_code": "PRJ-0001",
        "name": "Cawan Putih",
        "client": { "id": 1, "name": "Cawan Putih" },
        "project_type": { "id": 1, "name": "Social Media Management" },
        "ae": { "id": 5, "name": "Sera" },
        "sms": { "id": 7, "name": "Amel" },
        "priority": "MID",
        "status": "DONE",
        "start_date": "2025-01-01",
        "end_date": "2025-12-31"
      }
    ]
  }
}
```

### Endpoint: `GET /api/v1/dashboard/workload`
Returns array of active task load per user.

---

## 4. Frontend Design & Styling Standards
- Follows TailAdmin token guidelines in `globals.css`.
- High contrast, dark mode compatible (`dark:bg-gray-900`, `dark:border-gray-800`, `dark:text-white`).
- Responsive breakpoints (`grid-cols-1 md:grid-cols-2 xl:grid-cols-4` for summary cards; `grid-cols-1 xl:grid-cols-2` for charts).
- Interactive hover effects and smooth transitions.
