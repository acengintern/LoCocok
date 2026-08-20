### Task 11 Report: Content Planning API

**Summary of Changes:**
- **Controllers**: Created `BriefController`, `ContentPlanController`, `ScriptController` nested under the `projects` route scope.
- **Routing**: Added API routes for `projects.briefs`, `projects.content-plans`, and `projects.scripts` using scoped bindings to enforce that the entity belongs to the project.
- **Form Requests**: Created `StoreBriefRequest`, `UpdateBriefRequest`, `StoreContentPlanRequest`, `UpdateContentPlanRequest`, `StoreScriptRequest`, and `UpdateScriptRequest`. The `ContentPlan` requests now correctly validate the optional `output_type_id`.
- **Database/Migrations**: Created a migration `add_output_type_id_to_content_plans_table` to add the missing `output_type_id` column to the `content_plans` table. Updated the `ContentPlan` model to define the `outputType()` relationship.
- **Resources**: Created `BriefResource`, `ContentPlanResource`, and `ScriptResource`.
- **Policies**: Created `BriefPolicy`, `ContentPlanPolicy`, and `ScriptPolicy`. Due to Spatie Permissions intercepting abilities like `create`, the controllers enforce project authorization directly for the mutation endpoints via `$this->authorize('update', $project)`, guaranteeing only `AE`, `SMS`, `CD`, or `Admin` can create/update/delete entities in the project.
- **Base Controller**: Added the `AuthorizesRequests` trait to the base `Controller` to allow the use of `$this->authorize()` seamlessly.

**Testing:**
- Created `tests/Feature/ContentPlanningApiTest.php` to verify:
  - Authorized users can create Briefs, Content Plans, and Scripts.
  - Cross-project fetching returns `404 Not Found` (verified by the route scoped bindings).
  - Unauthorized users receive `403 Forbidden` when attempting to modify a Brief on a project they do not have access to.
- **Test Results**: All tests successfully passed (`php artisan test`).

**Commit details:**
`9de1de9 feat: Implement Content Planning API (Task 11)`
