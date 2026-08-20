### Phase 7 Task 2: Database, Storage & Infrastructure (7.3, 7.6, 7.7, 7.8, 7.9)

**This is a documentation/audit task. Do NOT deploy anything. Do NOT run destructive operations.**

**Requirements:**

1. **MySQL Production Preparation (7.3)**
   - Read ackend/config/database.php. Document charset, collation, timezone settings.
   - Verify foreign keys are enabled (InnoDB).
   - Check if there are any missing indexes on frequently queried columns. Look at the migration files.
   - Document a safe migration procedure:
     1. Backup database
     2. Run php artisan migrate --force
     3. Verify migration status
     4. Rollback procedure if needed

2. **File Storage (7.6)**
   - Read ackend/config/filesystems.php.
   - Document the current storage configuration.
   - Document both options: local storage vs S3-compatible.
   - Verify upload validation: check FormRequests for file size limits and MIME validation.
   - Document the recommended production storage config.

3. **Database Backup Strategy (7.7)**
   - Design a practical backup strategy:
     - Daily automated backups
     - 30-day retention
     - Restoration procedure (step by step)
     - Backup verification (how to test restoration)

4. **Queue / Scheduler (7.8)**
   - Search the backend codebase for: dispatch(), Queue::, ShouldQueue, schedule() in pp/Console/Kernel.php.
   - Determine if the application actually uses queues or scheduled tasks.
   - Document findings: if queues are used, document the required worker setup. If not, state that no queue worker is needed.

5. **Web Server Architecture (7.9)**
   - Document the recommended production setup:
     - Nginx as reverse proxy
     - PHP-FPM for Laravel
     - Node.js (pm2 or similar) for Next.js
     - HTTPS via Let's Encrypt or similar
   - Provide a sample Nginx config snippet for both frontend and backend.

6. **Write report** to .superpowers/sdd/phase7-task-2-report.md.
