### Phase 5 Task 6: Clients (5.4)

**Global Constraints:**
- Work exclusively inside ree-nextjs-admin-dashboard/.
- Use existing TailAdmin aesthetics.

**Requirements:**
1. Create src/app/(admin)/administration/clients/page.tsx (the sidebar has this link under Administration).
   - *Wait, the spec states Clients should be accessible here, but the brief says "Clients CRUD: Implement Client list, detail, create, and edit. Filter by status, PIC."*
   - Let's put the main page at src/app/(admin)/administration/clients/page.tsx.
   - Create a ClientsClient.tsx that fetches from /api/v1/clients.
2. The Client List should display: Brand/Client name, Contact, Email, Phone, AE, SMS, and Status.
3. Provide "Create Client" and "Edit Client" via Modal.
   - Payload to /api/v1/clients should handle 
ame, rand_name, ddress, phone, email, pic_name, pic_phone, pic_email, status.
   - The backend might assign AE and SMS automatically based on who created it, or you might need to allow assigning them if the user is an admin. For now, focus on the standard string/text fields and status (Enum: 'ACTIVE', 'INACTIVE').
4. Implement basic filtering (search by name, maybe a status dropdown filter) on the client side or via API query strings if supported.
5. Create src/app/(admin)/administration/clients/[id]/page.tsx (Client Detail view).
   - Fetch client details from /api/v1/clients/{id}.
   - Display all fields cleanly using TailAdmin card layout.
6. Commit your changes inside the submodule (git add . && git commit -m "feat: implement clients CRUD").
7. Commit the submodule update in the root directory.
8. Write your report to .superpowers/sdd/phase5-task-6-report.md.
