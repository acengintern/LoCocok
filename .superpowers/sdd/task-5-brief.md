### Task 5: Spatie RBAC & Activity Log Configuration

**Global Constraints:**
- N/A

**Files:**
- Modify: ackend/app/Models/User.php
- Modify: ackend/app/Models/*.php

**Instructions:**
1. **RBAC Trait:** Add Spatie\Permission\Traits\HasRoles trait to the User model.
2. **Activity Log Trait:** Add Spatie\Activitylog\Traits\LogsActivity trait and the required getActivitylogOptions() method to key business models:
   - Project
   - Task
   - File
   - ContentPlan
   - Script
   - Brief
   - Contract
   - ProjectFinancial

Example implementation for LogsActivity:
`php
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Project extends Model
{
    use LogsActivity;

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logAll()
            ->logOnlyDirty();
    }
}
`

Check that all models compile without syntax errors by running php artisan tinker --execute="echo 'OK';" or similar.

Commit your changes, then write your report to .superpowers/sdd/task-5-report.md.
