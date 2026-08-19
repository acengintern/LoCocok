### Task 1: Laravel Backend Setup & Composer Packages

**Global Constraints:**
- Database tables must use standard snake_case plural naming.
- Use DB_DATABASE=loco_track

**Files:**
- Create: ackend/

- [ ] **Step 1: Install Laravel**
Run: composer create-project laravel/laravel backend

- [ ] **Step 2: Install Spatie Packages**
Run: cd backend
Run: composer require spatie/laravel-permission spatie/laravel-activitylog

- [ ] **Step 3: Publish Spatie Config & Migrations**
Run: php artisan vendor:publish --provider="Spatie\Permission\PermissionServiceProvider"
Run: php artisan vendor:publish --provider="Spatie\Activitylog\ActivitylogServiceProvider" --tag="activitylog-migrations"

- [ ] **Step 4: Configure Database in .env**
Modify ackend/.env to configure MySQL connection parameters (DB_DATABASE=loco_track).

**Instructions:**
- Execute the commands exactly.
- Test that Laravel installed successfully by running php artisan inside ackend.
- Create a MySQL database named loco_track (e.g. via mysql -u root -e "CREATE DATABASE IF NOT EXISTS loco_track;").
- Commit the changes when done.
- Write your report to .superpowers/sdd/task-1-report.md.
