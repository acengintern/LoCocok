### Task 13: Files & Versions API

**Global Constraints:**
- API endpoints prefixed with /api/v1/.
- Standard API response structure using ApiResponse trait.
- Form Requests for validation.
- Enforce Laravel Policies on every endpoint.
- Write Feature/API tests for every implemented module (happy path, validation, authorization, ownership/isolation).

**Requirements:**
1. Use Laravel Storage abstraction for uploaded files. DO NOT store binary files directly in MySQL.
2. File version numbers must be server-controlled (auto-incrementing per file).
3. Create controllers: FileController, FileVersionController.
4. FileController nested under projects:
   - GET /api/v1/projects/{project}/files
   - POST /api/v1/projects/{project}/files (expects a file upload. This creates the File AND the initial FileVersion (v1) automatically).
   - GET /api/v1/projects/{project}/files/{file}
   - DELETE /api/v1/projects/{project}/files/{file}
5. FileVersionController nested under files:
   - GET /api/v1/projects/{project}/files/{file}/versions
   - POST /api/v1/projects/{project}/files/{file}/versions (Upload a new version. The server must automatically increment the ersion_number based on the highest existing version for this file).
   - GET /api/v1/projects/{project}/files/{file}/versions/{version}/download (Stream/download the file from Laravel Storage. Ensure this returns the actual file response, not JSON).
6. Create StoreFileRequest, StoreFileVersionRequest.
7. Create FileResource, FileVersionResource.
8. Create FilePolicy.
   - iewAny, iew, download: Inherits project visibility.
   - create, update, delete: Allowed for project team members (AE, SMS, CD) or Admins.
9. Write tests in 	ests/Feature/FileApiTest.php to verify:
   - File upload (use Illuminate\Http\UploadedFile::fake()).
   - Adding a new version correctly increments the version number.
   - Downloading returns the correct file response.

Ensure tests pass (php artisan test).
Commit your changes, then write your report to .superpowers/sdd/task-13-report.md.
