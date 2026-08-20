diff --git a/src/app/(admin)/administration/roles/RolesClient.tsx b/src/app/(admin)/administration/roles/RolesClient.tsx
new file mode 100644
index 0000000..8c1d814
--- /dev/null
+++ b/src/app/(admin)/administration/roles/RolesClient.tsx
@@ -0,0 +1,89 @@
+"use client";
+import React, { useEffect, useState } from "react";
+import { apiClient } from "@/lib/api/client";
+import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
+import Badge from "@/components/ui/badge/Badge";
+
+interface Role {
+  id: number;
+  name: string;
+  permissions?: { id: number; name: string }[];
+}
+
+export default function RolesClient() {
+  const [roles, setRoles] = useState<Role[]>([]);
+  const [loading, setLoading] = useState(true);
+  const [error, setError] = useState<string | null>(null);
+
+  useEffect(() => {
+    const fetchRoles = async () => {
+      try {
+        const res = await apiClient.get("/roles");
+        // Check if data is nested inside data (Laravel style)
+        const data = res.data.data ? res.data.data : res.data;
+        setRoles(Array.isArray(data) ? data : []);
+      } catch (err: any) {
+        setError(err.message || "Failed to fetch roles");
+      } finally {
+        setLoading(false);
+      }
+    };
+    fetchRoles();
+  }, []);
+
+  if (loading) return <div className="text-gray-500">Loading roles...</div>;
+  if (error) return <div className="text-red-500">{error}</div>;
+
+  return (
+    <div className="flex flex-col gap-6">
+      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
+        <div className="max-w-full overflow-x-auto">
+          <div className="min-w-[800px]">
+            <Table>
+              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
+                <TableRow>
+                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
+                    Role Name
+                  </TableCell>
+                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
+                    Permissions
+                  </TableCell>
+                </TableRow>
+              </TableHeader>
+              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
+                {roles.length === 0 ? (
+                  <TableRow>
+                    <TableCell className="px-5 py-4 text-center text-gray-500 dark:text-gray-400" colSpan={2}>
+                      No roles found.
+                    </TableCell>
+                  </TableRow>
+                ) : (
+                  roles.map((role) => (
+                    <TableRow key={role.id}>
+                      <TableCell className="px-5 py-4 text-start font-medium text-gray-800 text-theme-sm dark:text-white/90">
+                        {role.name}
+                      </TableCell>
+                      <TableCell className="px-4 py-3 text-start">
+                        <div className="flex flex-wrap gap-2">
+                          {role.permissions && role.permissions.length > 0 ? (
+                            role.permissions.map((perm) => (
+                              <Badge key={perm.id} size="sm" color="light">
+                                {perm.name}
+                              </Badge>
+                            ))
+                          ) : (
+                            <span className="text-gray-500 text-theme-xs">No permissions</span>
+                          )}
+                        </div>
+                      </TableCell>
+                    </TableRow>
+                  ))
+                )}
+              </TableBody>
+            </Table>
+          </div>
+        </div>
+      </div>
+    </div>
+  );
+}
diff --git a/src/app/(admin)/administration/roles/page.tsx b/src/app/(admin)/administration/roles/page.tsx
index 64a4ecc..625210d 100644
--- a/src/app/(admin)/administration/roles/page.tsx
+++ b/src/app/(admin)/administration/roles/page.tsx
@@ -1,10 +1,19 @@
 import React from "react";
-import EmptyState from "@/components/common/EmptyState";
+import RolesClient from "./RolesClient";
+import { Metadata } from "next";
+
+export const metadata: Metadata = {
+  title: "Roles | TailAdmin - Next.js Dashboard Template",
+  description: "Roles list page",
+};
 
 export default function Page() {
   return (
     <div className="flex flex-col gap-6">
-      <EmptyState title="Coming in Phase 2" message="This module is under construction." />
+      <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
+        Roles Management
+      </h2>
+      <RolesClient />
     </div>
   );
 }
diff --git a/src/app/(admin)/administration/users/UsersClient.tsx b/src/app/(admin)/administration/users/UsersClient.tsx
new file mode 100644
index 0000000..ed44a19
--- /dev/null
+++ b/src/app/(admin)/administration/users/UsersClient.tsx
@@ -0,0 +1,295 @@
+"use client";
+
+import React, { useEffect, useState } from "react";
+import { apiClient } from "@/lib/api/client";
+import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
+import Badge from "@/components/ui/badge/Badge";
+import Button from "@/components/ui/button/Button";
+import { Modal } from "@/components/ui/modal";
+import Input from "@/components/form/input/InputField";
+import Label from "@/components/form/Label";
+import Checkbox from "@/components/form/input/Checkbox";
+
+interface Role {
+  id: number;
+  name: string;
+}
+
+interface User {
+  id: number;
+  name: string;
+  email: string;
+  status: string;
+  roles?: { id: number; name: string }[];
+}
+
+export default function UsersClient() {
+  const [users, setUsers] = useState<User[]>([]);
+  const [roles, setRoles] = useState<Role[]>([]);
+  const [loading, setLoading] = useState(true);
+  const [error, setError] = useState<string | null>(null);
+
+  // Modal states
+  const [isModalOpen, setIsModalOpen] = useState(false);
+  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
+  const [submitting, setSubmitting] = useState(false);
+
+  // Form states
+  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
+  const [formData, setFormData] = useState({
+    name: "",
+    email: "",
+    password: "",
+  });
+  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
+  const [formError, setFormError] = useState<string | null>(null);
+
+  useEffect(() => {
+    fetchUsers();
+    fetchRoles();
+  }, []);
+
+  const fetchUsers = async () => {
+    try {
+      setLoading(true);
+      const res = await apiClient.get("/users");
+      const data = res.data.data ? res.data.data : res.data;
+      setUsers(Array.isArray(data) ? data : []);
+    } catch (err: any) {
+      setError(err.message || "Failed to fetch users");
+    } finally {
+      setLoading(false);
+    }
+  };
+
+  const fetchRoles = async () => {
+    try {
+      const res = await apiClient.get("/roles");
+      const data = res.data.data ? res.data.data : res.data;
+      setRoles(Array.isArray(data) ? data : []);
+    } catch (err: any) {
+      console.error("Failed to fetch roles", err);
+    }
+  };
+
+  const handleOpenModal = (mode: "create" | "edit", user?: User) => {
+    setFormError(null);
+    setModalMode(mode);
+    if (mode === "edit" && user) {
+      setCurrentUserId(user.id);
+      setFormData({
+        name: user.name,
+        email: user.email,
+        password: "", // empty password means don't change
+      });
+      setSelectedRoles(user.roles ? user.roles.map((r) => r.name) : []);
+    } else {
+      setCurrentUserId(null);
+      setFormData({
+        name: "",
+        email: "",
+        password: "",
+      });
+      setSelectedRoles([]);
+    }
+    setIsModalOpen(true);
+  };
+
+  const handleCloseModal = () => {
+    setIsModalOpen(false);
+  };
+
+  const handleRoleToggle = (roleName: string, checked: boolean) => {
+    if (checked) {
+      setSelectedRoles((prev) => [...prev, roleName]);
+    } else {
+      setSelectedRoles((prev) => prev.filter((r) => r !== roleName));
+    }
+  };
+
+  const handleSubmit = async (e: React.FormEvent) => {
+    e.preventDefault();
+    setFormError(null);
+    setSubmitting(true);
+
+    try {
+      let userId = currentUserId;
+
+      if (modalMode === "create") {
+        // Create User
+        const res = await apiClient.post("/users", {
+          name: formData.name,
+          email: formData.email,
+          password: formData.password,
+        });
+        const createdUser = res.data.data ? res.data.data : res.data;
+        userId = createdUser.id;
+      } else {
+        // Edit User
+        const payload: any = {
+          name: formData.name,
+          email: formData.email,
+        };
+        if (formData.password) {
+          payload.password = formData.password;
+        }
+        await apiClient.put(`/users/${userId}`, payload);
+      }
+
+      // Assign Roles if userId is valid
+      if (userId) {
+        await apiClient.put(`/users/${userId}/roles`, {
+          roles: selectedRoles,
+        });
+      }
+
+      handleCloseModal();
+      fetchUsers();
+    } catch (err: any) {
+      if (err.response && err.response.data) {
+        setFormError(err.response.data.message || "An error occurred");
+      } else {
+        setFormError(err.message || "An error occurred");
+      }
+    } finally {
+      setSubmitting(false);
+    }
+  };
+
+  if (loading && users.length === 0) return <div className="text-gray-500">Loading users...</div>;
+  if (error) return <div className="text-red-500">{error}</div>;
+
+  return (
+    <div className="flex flex-col gap-6">
+      <div className="flex justify-end">
+        <Button onClick={() => handleOpenModal("create")}>Create User</Button>
+      </div>
+
+      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
+        <div className="max-w-full overflow-x-auto">
+          <div className="min-w-[800px]">
+            <Table>
+              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
+                <TableRow>
+                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
+                    Name
+                  </TableCell>
+                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
+                    Email
+                  </TableCell>
+                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
+                    Roles
+                  </TableCell>
+                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
+                    Status
+                  </TableCell>
+                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
+                    Actions
+                  </TableCell>
+                </TableRow>
+              </TableHeader>
+              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
+                {users.length === 0 ? (
+                  <TableRow>
+                    <TableCell className="px-5 py-4 text-center text-gray-500 dark:text-gray-400" colSpan={5}>
+                      No users found.
+                    </TableCell>
+                  </TableRow>
+                ) : (
+                  users.map((user) => (
+                    <TableRow key={user.id}>
+                      <TableCell className="px-5 py-4 text-start font-medium text-gray-800 text-theme-sm dark:text-white/90">
+                        {user.name}
+                      </TableCell>
+                      <TableCell className="px-4 py-3 text-start text-gray-500 text-theme-sm dark:text-gray-400">
+                        {user.email}
+                      </TableCell>
+                      <TableCell className="px-4 py-3 text-start">
+                        <div className="flex flex-wrap gap-2">
+                          {user.roles && user.roles.length > 0 ? (
+                            user.roles.map((role) => (
+                              <Badge key={role.id} size="sm" color="light">
+                                {role.name}
+                              </Badge>
+                            ))
+                          ) : (
+                            <span className="text-gray-500 text-theme-xs">None</span>
+                          )}
+                        </div>
+                      </TableCell>
+                      <TableCell className="px-4 py-3 text-start text-gray-500 text-theme-sm dark:text-gray-400">
+                        {user.status || "Active"}
+                      </TableCell>
+                      <TableCell className="px-4 py-3 text-start">
+                        <Button size="sm" variant="outline" onClick={() => handleOpenModal("edit", user)}>
+                          Edit
+                        </Button>
+                      </TableCell>
+                    </TableRow>
+                  ))
+                )}
+              </TableBody>
+            </Table>
+          </div>
+        </div>
+      </div>
+
+      <Modal isOpen={isModalOpen} onClose={handleCloseModal} className="max-w-[500px] p-6">
+        <h3 className="mb-5 text-lg font-bold text-gray-800 dark:text-white/90">
+          {modalMode === "create" ? "Create User" : "Edit User"}
+        </h3>
+        {formError && <div className="mb-4 text-sm text-red-500">{formError}</div>}
+        <div className="flex flex-col gap-4">
+          <div>
+            <Label>Name</Label>
+            <Input
+              type="text"
+              value={formData.name}
+              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
+              placeholder="Enter name"
+            />
+          </div>
+          <div>
+            <Label>Email</Label>
+            <Input
+              type="email"
+              value={formData.email}
+              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
+              placeholder="Enter email"
+            />
+          </div>
+          <div>
+            <Label>Password {modalMode === "edit" && <span className="text-gray-400">(leave blank to keep current)</span>}</Label>
+            <Input
+              type="password"
+              value={formData.password}
+              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
+              placeholder="Enter password"
+            />
+          </div>
+          <div>
+            <Label>Roles</Label>
+            <div className="flex flex-col gap-2 mt-2 max-h-[150px] overflow-y-auto">
+              {roles.map((role) => (
+                <Checkbox
+                  key={role.id}
+                  label={role.name}
+                  checked={selectedRoles.includes(role.name)}
+                  onChange={(checked) => handleRoleToggle(role.name, checked)}
+                />
+              ))}
+            </div>
+          </div>
+          <div className="mt-4 flex justify-end gap-3">
+            <Button variant="outline" onClick={handleCloseModal}>
+              Cancel
+            </Button>
+            <Button onClick={(e: any) => handleSubmit(e)} disabled={submitting}>
+              {submitting ? "Saving..." : "Save"}
+            </Button>
+          </div>
+        </div>
+      </Modal>
+    </div>
+  );
+}
diff --git a/src/app/(admin)/administration/users/page.tsx b/src/app/(admin)/administration/users/page.tsx
index 64a4ecc..276516d 100644
--- a/src/app/(admin)/administration/users/page.tsx
+++ b/src/app/(admin)/administration/users/page.tsx
@@ -1,10 +1,19 @@
 import React from "react";
-import EmptyState from "@/components/common/EmptyState";
+import UsersClient from "./UsersClient";
+import { Metadata } from "next";
+
+export const metadata: Metadata = {
+  title: "Users | TailAdmin - Next.js Dashboard Template",
+  description: "Users list page",
+};
 
 export default function Page() {
   return (
     <div className="flex flex-col gap-6">
-      <EmptyState title="Coming in Phase 2" message="This module is under construction." />
+      <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
+        Users Management
+      </h2>
+      <UsersClient />
     </div>
   );
 }
