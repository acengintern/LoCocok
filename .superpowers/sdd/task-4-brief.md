### Task 4: Models & Eloquent Relationships

**Global Constraints:**
- Database tables must use standard snake_case plural naming.
- Project hasMany/hasOne Contract (no circular foreign key in projects).
- Use SoftDeletes trait where specified.

**Files:**
- Create: ackend/app/Models/*.php

**Instructions:**
Read the database architecture spec located at docs/superpowers/specs/2026-08-19-loco-track-backend-design.md.

You must create and implement the Eloquent Models for all entities in the database schema.
1. Apply $casts for Enums. Example: 'status' => \App\Enums\ProjectStatus::class.
2. Apply $guarded = []; to all models to allow mass assignment.
3. Implement Eloquent relationships (hasMany, elongsTo, elongsToMany, morphTo/morphMany). Ensure you follow the spec exactly (e.g., projects has relationships e(), sms(), creativeDirector() pointing to the User model).
4. Apply the Illuminate\Database\Eloquent\SoftDeletes trait to models exactly where specified in the design doc.

Check that all models exist in ackend/app/Models/ without syntax errors by running php artisan tinker --execute="echo 'OK';" or similar.

Commit your changes, then write your report to .superpowers/sdd/task-4-report.md.
