### Phase 7 Task 1: Environment & Configuration Audit (7.1, 7.2, 7.4, 7.5)

**This is a documentation/audit task. Do NOT deploy anything. Do NOT expose real secrets.**

**Requirements:**

1. **Environment Variable Audit (7.1)**
   - Read ackend/.env.example (or ackend/.env if example doesn't exist).
   - Read ree-nextjs-admin-dashboard/.env.local.
   - Identify ALL environment variables required for production: Laravel, MySQL, Sanctum, CORS, Mail, Storage, Queue, App URL, etc.
   - Create/update ackend/.env.example with PLACEHOLDER values only (e.g., APP_KEY=base64:GENERATE_WITH_ARTISAN).
   - Create ree-nextjs-admin-dashboard/.env.example with placeholder values.
   - Verify .env and .env.local are in .gitignore.

2. **Production Domain Architecture (7.2)**
   - Document the recommended domain structure:
     - Frontend: https://<frontend-domain>
     - Backend API: https://<api-domain>
   - List all config values that must be updated for production domains:
     - APP_URL, SANCTUM_STATEFUL_DOMAINS, SESSION_DOMAIN, CORS_ALLOWED_ORIGINS, NEXT_PUBLIC_API_URL
   - Verify no hardcoded localhost URLs exist in production code paths. Search for localhost in both codebases.

3. **Laravel Production Configuration (7.4)**
   - Document the required production settings:
     - APP_ENV=production, APP_DEBUG=false
     - Logging (daily vs stack)
     - Session driver (file vs database vs redis)
     - Cache driver
     - Queue driver
     - Trusted proxies if behind load balancer
   - Verify error responses don't expose internal details (already fixed in Phase 6, just confirm).

4. **Next.js Production Configuration (7.5)**
   - Verify NEXT_PUBLIC_API_URL is the only public env var.
   - Verify no secrets are exposed through NEXT_PUBLIC_*.
   - Verify no console.log debug statements in production code (search for them).
   - Run 
pm run lint and 
pm run build inside ree-nextjs-admin-dashboard/.

5. **Commit** any new .env.example files or fixes.
6. **Write report** to .superpowers/sdd/phase7-task-1-report.md.
