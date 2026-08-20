### Task 2: TypeScript API Types

**Global Constraints:**
- Phase 4 is ONLY integration foundation.

**Requirements:**
1. Work inside ree-nextjs-admin-dashboard/.
2. Create src/types/api.ts.
3. Define the base response structure used by Laravel:
   `	ypescript
   export interface ApiResponse<T> {
       success: boolean;
       message: string;
       data: T;
       meta?: any;
   }
   
   export interface PaginatedResponse<T> {
       success: boolean;
       message: string;
       data: T[];
       meta: {
           current_page: number;
           last_page: number;
           per_page: number;
           total: number;
       };
   }
   `
4. Define interfaces matching the Laravel API Resources for the following models:
   - User, Role, Permission
   - Client, Project, Contract
   - ProjectFinancial, ProjectPayment, ProjectCost
   - ProjectOutput, Brief, ContentPlan, Script
   - Task, TaskAssignment
   - File, FileVersion
   - Approval, Revision
   - Notification
   *(You can look at the backend resources or migrations if you need to know exact field names, but standard properties like id, created_at, updated_at are expected everywhere).*
5. Commit your changes inside the submodule, then commit the submodule update in the root.
6. Write your report to .superpowers/sdd/phase4-task-2-report.md in the root directory.
