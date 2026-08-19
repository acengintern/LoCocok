dsffs# LOCO TRACK Backend Phase 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (- [ ]) syntax for tracking.

**Goal:** Establish the Laravel backend foundation, configure core packages, and implement the comprehensive database architecture.

**Architecture:** A REST API Laravel backend serving a Next.js frontend, utilizing native PHP Enums, Spatie RBAC, and Spatie Activitylog.

**Tech Stack:** Laravel 11, PHP 8.2+, MySQL.

## Global Constraints

- Use PHP 8.1+ Enums for stable system states.
- Do not use UserStatus for clients; use ClientStatus (ACTIVE, INACTIVE, PROSPECT).
- Project hasMany/hasOne Contract (no circular foreign key in projects).
- All foreign keys must enforce cascading or strict restriction as appropriate.
- Database tables must use standard snake_case plural naming.

---

### Task 1: Laravel Backend Setup & Composer Packages

**Files:**

- Create: ackend/

- [ ] **Step 1: Install Laravel**
      `ash
composer create-project laravel/laravel backend
`

- [ ] **Step 2: Install Spatie Packages**
      `ash
cd backend
composer require spatie/laravel-permission spatie/laravel-activitylog
`

- [ ] **Step 3: Publish Spatie Config & Migrations**
      `ash
php artisan vendor:publish --provider="Spatie\Permission\PermissionServiceProvider"
php artisan vendor:publish --provider="Spatie\Activitylog\ActivitylogServiceProvider" --tag="activitylog-migrations"
`

- [ ] **Step 4: Configure Database in .env**
      Modify ackend/.env to configure MySQL connection parameters.

---

### Task 2: Implement Enums

**Files:**

- Create: ackend/app/Enums/\*.php

- [ ] **Step 1: Create Enum Files**
      Create pp/Enums/UserStatus.php, ClientStatus.php, ProjectStatus.php, TaskStatus.php, Priority.php, ContentPlanStatus.php, ScriptStatus.php, ApprovalStatus.php, ApprovalType.php, RevisionStatus.php, FileVersionApprovalStatus.php, PaymentStatus.php, CostType.php, TimelineActivityStatus.php

`php
// Example: app/Enums/ClientStatus.php
namespace App\Enums;

enum ClientStatus: string {
case ACTIVE = 'ACTIVE';
case INACTIVE = 'INACTIVE';
case PROSPECT = 'PROSPECT';
}
`

---

### Task 3: Migration Order & Dependencies

_Order:_

1. Master Data (teams, project_types, output_types, task_types, file_types)
2. Users, Clients, Team_Members
3. Projects, Contracts, Project_Financials, Project_Payments, Project_Costs, Project_Outputs
4. Content Planning (briefs, content_plans, scripts)
5. Tasks (tasks, task_assignments, additional_loads)
6. Files & File Versions
7. Polymorphic & Tracking (approvals, revisions, timeline_activities)

**Files:**

- Create: ackend/database/migrations/\*.php

- [ ] **Step 1: Generate Master Data Migrations**
      `ash
      php artisan make:migration create_teams_table

# Repeat for other master tables

`
_Write migration contents ensuring softDeletes() where required._

- [ ] **Step 2: Generate Core Migrations (Users, Clients, Projects)**
      _Include foreign keys to master tables. Ensure ClientStatus is used for clients._

- [ ] **Step 3: Generate Remaining Migrations**
      _Including the delayed foreign key for files.current_version_id._

- [ ] **Step 4: Run Migrations**
      `ash
php artisan migrate
`

---

### Task 4: Models & Eloquent Relationships

**Files:**

- Create: ackend/app/Models/\*.php

- [ ] **Step 1: Create Models with Casting**
      Generate all models (User, Team, Client, Project, etc.). Apply $casts for Enums.
      `php
protected  = [
    'status' => \App\Enums\ProjectStatus::class,
];
`

- [ ] **Step 2: Define Relationships**
      Implement hasMany, elongsTo, elongsToMany, and morphTo/morphMany.

- [ ] **Step 3: Implement SoftDeletes Trait**
      Apply Illuminate\Database\Eloquent\SoftDeletes where specified in the design.

---

### Task 5: Spatie RBAC & Activity Log Configuration

**Files:**

- Modify: ackend/app/Models/User.php
- Modify: ackend/config/activitylog.php

- [ ] **Step 1: Attach RBAC Trait**
      Add HasRoles trait to User model.

- [ ] **Step 2: Attach LogsActivity Trait**
      Add LogsActivity trait to key models (e.g., Project, Task, File) to automatically track changes.

---

### Task 6: Factories & Seeders

**Files:**

- Create: ackend/database/seeders/DatabaseSeeder.php
- Create: ackend/database/seeders/RolePermissionSeeder.php

- [ ] **Step 1: Seed Roles and Permissions**
      Create RolePermissionSeeder to insert the 8 LOCO TRACK roles and standard permissions (view, create, edit, delete, assign, upload, approve, publish, export, manage). Assign permissions to roles.

- [ ] **Step 2: Create Factories**
      Generate basic factories for User, Team, Client, Project to facilitate testing.

- [ ] **Step 3: Run Seeder**
      `ash
php artisan db:seed
`

---

### Task 7: API Foundation

**Files:**

- Create: ackend/routes/api.php
- Modify: ackend/bootstrap/app.php

- [ ] **Step 1: Setup Basic API Routes**
      Configure standard route groups with uth:sanctum middleware placeholder.

- [ ] **Step 2: Configure Global Exception Handler**
      Ensure API endpoints return JSON formatted errors.

---

### Task 8: Database Validation & Final Acceptance

- [ ] **Step 1: Verify Schema**
      Run php artisan migrate:fresh --seed to ensure no foreign key cycles or migration ordering issues occur.

- [ ] **Step 2: Run Automated Checks**
      Use Tinker or basic tests to verify Enum casting and relationship loading.

## Final Acceptance Criteria

- Laravel backend installed and accessible.
- Spatie Permissions and Activity Log configured and migrated.
- All Enums correctly created and cast in Models.
- All migrations run successfully with migrate:fresh without foreign key constraint errors.
- RolePermissionSeeder successfully populates the 8 core roles.
