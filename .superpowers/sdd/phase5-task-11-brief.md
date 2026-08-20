### Phase 5 Task 11: Files & Versioning (5.10)

**Global Constraints:**
- Work exclusively inside ree-nextjs-admin-dashboard/.
- Use existing TailAdmin aesthetics.

**Requirements:**
1. Create src/components/Projects/FilesTab.tsx.
   - Implement this inside the Project Details view.
   - Fetch the list of files: /api/v1/projects/{projectId}/files.
   - Display a list/table of files showing: Name, Type, Current Version, Uploaded By, Created At.
2. Implement File Upload UI.
   - Use a generic file input <input type="file">.
   - Post to /api/v1/projects/{projectId}/files using multipart/form-data.
   - The payload should include ile and ile_type_id.
3. Implement File Detail / Version History.
   - You can either open a Modal showing the version history or expand a row.
   - Fetch /api/v1/files/{fileId}/versions if necessary, or rely on included versions from the files endpoint.
   - Provide a button to "Upload New Version" (POST /api/v1/files/{fileId}/versions).
   - Provide a button to "Download" a version (using the ile_path provided by the API).
4. Do not expose storage internals to the user; just use standard download links or blobs.
5. Commit your changes inside the submodule (git add . && git commit -m "feat: implement files and versioning UI").
6. Commit the submodule update in the root directory.
7. Write your report to .superpowers/sdd/phase5-task-11-report.md.
