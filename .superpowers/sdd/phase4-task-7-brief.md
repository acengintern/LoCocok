### Task 7: CORS / Cookie Verification Test

**Global Constraints:**
- Phase 4 is ONLY integration foundation.

**Requirements:**
1. This is the final task of Phase 4.
2. The user has requested to verify the actual cross-origin setup between Next.js and Laravel (Sanctum stateful domains, session cookie domain, CSRF cookie).
3. First, review ackend/.env and ensure SANCTUM_STATEFUL_DOMAINS and SESSION_DOMAIN are set correctly. For Next.js running on localhost:3000, SANCTUM_STATEFUL_DOMAINS usually needs localhost:3000 (or 127.0.0.1:3000). If they are missing or wrong, fix them in ackend/.env.
4. Also verify ackend/config/cors.php has supports_credentials => true.
5. Run the frontend linter and build to make sure everything compiles:
   cd free-nextjs-admin-dashboard && npm run lint && npm run build
6. Write a small node script or just rely on the build result to prove it works. (Since we can't easily open a browser, simply ensuring the .env settings are correct and the Next.js build succeeds is enough).
7. If you change ackend/.env or ackend/config/cors.php, commit those changes in the root.
8. Write your final report to .superpowers/sdd/phase4-task-7-report.md.
