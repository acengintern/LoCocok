# LOCO TRACK Phase 8: Production Deployment & Verification Plan

**Goal:** Execute the Phase 8 production deployment workflow, verify system pre-requisites, execute safe production optimizations without destructive migrations or data loss, and document full audit results in Phase8_Deployment_Audit.md.

## Pre-Deployment Verification Matrix
- **Host OS:** Windows (Current Local Environment) / Target Remote Linux Server (Nginx + PHP-FPM + PM2)
- **PHP Version:** PHP 8.3.31 (ZTS x64) with all 21 required extensions enabled
- **Node.js / npm:** Node v24.15.0 / npm 11.12.1
- **Composer:** 2.8.10
- **Git Commit:** Latest approved commit (29674d0 on main)
- **Backend Test Status:** 76/76 passed (212 assertions, 0 failures)
- **Frontend Build Status:** 49 routes successfully compiled

## Safety & Non-Destructive Directives
- NEVER run migrate:fresh, db:wipe, or schema:drop.
- ALWAYS verify backups before running migrate --force.
- NO secrets or credentials exposed in reports or source control.
- NO uncommitted code deployed.

## Tasks & Phases
1. **Pre-Deployment & Environment Audit (8.1, 8.2)**
   - Audit local vs target environment availability
   - Document toolchains, extensions, and network ports
2. **Code & Dependency Production Staging (8.3, 8.5, 8.6)**
   - Verify clean git working tree matching approved commit
   - Cache config/routes/views safely
   - Verify storage link and permissions
3. **Database Migration & Backup Verification (8.4, 8.11)**
   - Perform database backup snapshot
   - Verify migration status with non-destructive check
4. **Process, Web Server & Security Audit (8.7, 8.8, 8.10)**
   - Verify Nginx configuration and PM2/Supervisor manifests
   - Audit security headers, CORS, CSRF, and HTTP-only cookie settings
5. **Production Smoke Testing & Monitoring (8.9, 8.12, 8.13)**
   - Run end-to-end smoke test suite
   - Verify log streaming and rollback procedures
6. **Generate Final Audit Report**
   - Compile Phase8_Deployment_Audit.md with final verdict