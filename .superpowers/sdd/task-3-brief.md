### Task 3: Database Migrations

**Global Constraints:**
- Database tables must use standard snake_case plural naming.
- Project hasMany/hasOne Contract (no circular foreign key in projects).
- Use SoftDeletes trait and $table->softDeletes() schema strictly where specified in the design spec.
- All foreign keys must enforce cascading or strict restriction as appropriate.

**Files:**
- Create: ackend/database/migrations/*.php

**Instructions:**
Read the database architecture spec located at docs/superpowers/specs/2026-08-19-loco-track-backend-design.md.

You must create and run the Laravel migrations for the ENTIRE database schema detailed in the spec.

**Important ordering constraints:**
1. Master Data (teams, project_types, output_types, task_types, file_types)
2. Users, Clients, team_members
3. Projects, Contracts, project_financials, project_payments, project_costs, project_outputs
4. Content Planning (briefs, content_plans, scripts)
5. Tasks (tasks, task_assignments, additional_loads)
6. Files (Create files table first WITHOUT current_version_id foreign key constraint)
7. FileVersions
8. Alter files table to add current_version_id foreign key referencing ile_versions.
9. Polymorphic & Tracking (approvals, revisions, timeline_activities)

Make sure to run php artisan migrate:fresh to verify everything builds correctly without foreign key constraint errors!

Commit your changes, then write your report to .superpowers/sdd/task-3-report.md.
