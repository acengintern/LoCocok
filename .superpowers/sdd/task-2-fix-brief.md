### Task 2: Authentication (Fix)

**Findings from Review:**
The requirement strictly stated to configure ackend/.env **and** .env.example. While .env was updated, .env.example was missed.

**Instructions:**
1. Open ackend/.env.example.
2. Add SANCTUM_STATEFUL_DOMAINS="localhost,localhost:3000,127.0.0.1,127.0.0.1:8000,::1" (or whatever you set in .env)
3. Add FRONTEND_URL="http://localhost:3000" (since it is used in config).
4. Run php artisan test --filter AuthTest to ensure everything still passes.
5. Commit your changes.
6. Write a short fix summary to the bottom of .superpowers/sdd/task-2-report.md.
