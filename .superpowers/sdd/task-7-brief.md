### Task 7: API Foundation

**Global Constraints:**
- N/A

**Files:**
- Create: ackend/routes/api.php
- Modify: ackend/bootstrap/app.php

**Instructions:**
1. **Setup Basic API Routes:**
Create ackend/routes/api.php and set up standard route groups with uth:sanctum middleware. Include a /ping route that returns ['status' => 'ok'].

2. **Configure Global Exception Handler:**
Modify ackend/bootstrap/app.php to ensure API endpoints return JSON formatted errors by customizing the exception handler. Add $exceptions->shouldRenderJsonWhen(function (\Illuminate\Http\Request $request, \Throwable $e) { return $request->is('api/*'); });.
Also ensure pi: __DIR__.'/../routes/api.php', is registered in the routing configuration in ootstrap/app.php.

Commit your changes, then write your report to .superpowers/sdd/task-7-report.md.
