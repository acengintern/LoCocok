### Task 4: Master Data API (Continuation)

**Context:**
You previously started Task 4 and created Controllers, Policies, FormRequests, and Routes. 
Permissions have now been authorized, allowing you to complete the remaining tasks.

**Requirements:**
1. Fix and finalize the FormRequests validation (ensure unique rules ignore the current ID on updates, e.g., unique:teams,name, . $this->team->id or similar depending on the route param).
2. Create 	ests/Feature/MasterDataApiTest.php to verify:
   - Admin can list, create, update, and soft-delete a Team.
   - Normal user (without manage permission) cannot create a Team (403).
   - Test validation (e.g., unique name requirement).
3. Run php artisan test --filter MasterDataApiTest.
4. Fix any test or implementation failures.
5. Create the report at .superpowers/sdd/task-4-report.md.
6. Commit the completed Task 4 changes.

Ensure standard API response structure using ApiResponse trait is applied in the controllers.
