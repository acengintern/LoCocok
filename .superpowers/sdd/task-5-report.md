# Task 5 Report: Users & RBAC

## Test Results
- Total Tests: 27
- Passed: 27
- Assertions: 72
- Duration: ~6.6s

All Feature/API tests passed successfully, including the newly added `UserApiTest`.

## Commits
- `feat: Implement Users & RBAC API` (43b12bd)
  - Created `UserController` with standard CRUD endpoints (`index`, `store`, `show`, `update`, `destroy`) using `SoftDeletes`.
  - Added role management endpoints to `UserController` (`getRoles`, `assignRole`, `removeRole`).
  - Added form validation requests (`StoreUserRequest`, `UpdateUserRequest`, `AssignRoleRequest`), including `username` uniqueness and Enum validation for `UserStatus`.
  - Updated `UserResource` to conditionally load and serialize `roles`.
  - Added `manageRoles` method to `UserPolicy` using the `manage` permission, and enforced authorization on all endpoints.
  - Registered all user and role API endpoints under `/api/v1` in `routes/api.php`.
  - Created and ran comprehensive test cases in `UserApiTest` verifying CRUD isolation, authorization checks, and role assignment/removal logic.
