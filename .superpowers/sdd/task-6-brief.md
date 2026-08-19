### Task 6: Factories & Seeders

**Global Constraints:**
- Roles and permissions must match LOCO TRACK specs exactly.

**Files:**
- Create/Modify: ackend/database/seeders/DatabaseSeeder.php
- Create: ackend/database/seeders/RolePermissionSeeder.php
- Create: ackend/database/factories/*.php

**Instructions:**
1. **Seed Roles and Permissions:**
Create RolePermissionSeeder.
Define these permissions: iew, create, edit, delete, ssign, upload, pprove, publish, export, manage.
Define these roles: System Administrator, Creative Director, Account Executive, Social Media Specialist, Graphic Designer, Video Editor / DAV, KOL, Production Assistant.
Give the System Administrator all permissions. Give other roles a basic set of logical permissions (e.g., Creative Director gets approve, edit, view, etc.).

2. **Configure DatabaseSeeder:**
Ensure RolePermissionSeeder is called from DatabaseSeeder.

3. **Create Factories:**
Create basic valid factories for User, Team, Client, Project to facilitate testing.

4. **Verify Database Seeder runs successfully:**
Run php artisan migrate:fresh --seed in the ackend directory (using SQLite if MySQL isn't available).

Commit your changes, then write your report to .superpowers/sdd/task-6-report.md.
