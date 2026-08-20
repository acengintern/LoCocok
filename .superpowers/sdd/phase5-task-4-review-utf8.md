diff --git a/src/app/(admin)/administration/file-types/page.tsx b/src/app/(admin)/administration/file-types/page.tsx
new file mode 100644
index 0000000..0240bd1
--- /dev/null
+++ b/src/app/(admin)/administration/file-types/page.tsx
@@ -0,0 +1,14 @@
+import React from "react";
+import MasterDataCrud from "@/components/master-data/MasterDataCrud";
+
+export const metadata = {
+  title: "File Types | Administration",
+};
+
+export default function FileTypesPage() {
+  return (
+    <div className="p-4 md:p-6">
+      <MasterDataCrud title="File Types" endpoint="file-types" />
+    </div>
+  );
+}
diff --git a/src/app/(admin)/administration/layout.tsx b/src/app/(admin)/administration/layout.tsx
new file mode 100644
index 0000000..8bdbeb1
--- /dev/null
+++ b/src/app/(admin)/administration/layout.tsx
@@ -0,0 +1,37 @@
+"use client";
+import React, { useEffect, useState } from "react";
+import { useAuth } from "@/hooks/useAuth";
+import { useRouter, usePathname } from "next/navigation";
+
+export default function AdministrationLayout({ children }: { children: React.ReactNode }) {
+  const { user, loading } = useAuth();
+  const router = useRouter();
+  const [isAuthorized, setIsAuthorized] = useState(false);
+
+  useEffect(() => {
+    if (!loading) {
+      if (!user) {
+        router.push("/signin");
+        return;
+      }
+      
+      const isSystemAdmin = user.roles?.some((role: any) => role.name === "System Administrator");
+      if (!isSystemAdmin) {
+        // Not authorized
+        router.push("/dashboard");
+      } else {
+        setIsAuthorized(true);
+      }
+    }
+  }, [user, loading, router]);
+
+  if (loading || !isAuthorized) {
+    return (
+      <div className="flex justify-center items-center p-12 min-h-[400px]">
+        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
+      </div>
+    );
+  }
+
+  return <>{children}</>;
+}
diff --git a/src/app/(admin)/administration/output-types/page.tsx b/src/app/(admin)/administration/output-types/page.tsx
new file mode 100644
index 0000000..cdfcfb6
--- /dev/null
+++ b/src/app/(admin)/administration/output-types/page.tsx
@@ -0,0 +1,14 @@
+import React from "react";
+import MasterDataCrud from "@/components/master-data/MasterDataCrud";
+
+export const metadata = {
+  title: "Output Types | Administration",
+};
+
+export default function OutputTypesPage() {
+  return (
+    <div className="p-4 md:p-6">
+      <MasterDataCrud title="Output Types" endpoint="output-types" />
+    </div>
+  );
+}
diff --git a/src/app/(admin)/administration/project-types/page.tsx b/src/app/(admin)/administration/project-types/page.tsx
new file mode 100644
index 0000000..75231a1
--- /dev/null
+++ b/src/app/(admin)/administration/project-types/page.tsx
@@ -0,0 +1,14 @@
+import React from "react";
+import MasterDataCrud from "@/components/master-data/MasterDataCrud";
+
+export const metadata = {
+  title: "Project Types | Administration",
+};
+
+export default function ProjectTypesPage() {
+  return (
+    <div className="p-4 md:p-6">
+      <MasterDataCrud title="Project Types" endpoint="project-types" />
+    </div>
+  );
+}
diff --git a/src/app/(admin)/administration/task-types/page.tsx b/src/app/(admin)/administration/task-types/page.tsx
new file mode 100644
index 0000000..e2c7392
--- /dev/null
+++ b/src/app/(admin)/administration/task-types/page.tsx
@@ -0,0 +1,14 @@
+import React from "react";
+import MasterDataCrud from "@/components/master-data/MasterDataCrud";
+
+export const metadata = {
+  title: "Task Types | Administration",
+};
+
+export default function TaskTypesPage() {
+  return (
+    <div className="p-4 md:p-6">
+      <MasterDataCrud title="Task Types" endpoint="task-types" />
+    </div>
+  );
+}
diff --git a/src/app/(admin)/administration/teams/page.tsx b/src/app/(admin)/administration/teams/page.tsx
index 64a4ecc..b0eaa5d 100644
--- a/src/app/(admin)/administration/teams/page.tsx
+++ b/src/app/(admin)/administration/teams/page.tsx
@@ -1,10 +1,14 @@
 import React from "react";
-import EmptyState from "@/components/common/EmptyState";
+import MasterDataCrud from "@/components/master-data/MasterDataCrud";
 
-export default function Page() {
+export const metadata = {
+  title: "Teams | Administration",
+};
+
+export default function TeamsPage() {
   return (
-    <div className="flex flex-col gap-6">
-      <EmptyState title="Coming in Phase 2" message="This module is under construction." />
+    <div className="p-4 md:p-6">
+      <MasterDataCrud title="Teams" endpoint="teams" />
     </div>
   );
 }
diff --git a/src/components/master-data/MasterDataCrud.tsx b/src/components/master-data/MasterDataCrud.tsx
new file mode 100644
index 0000000..598ebfa
--- /dev/null
+++ b/src/components/master-data/MasterDataCrud.tsx
@@ -0,0 +1,226 @@
+"use client";
+import React, { useState, useEffect } from "react";
+import DataTable, { ColumnDef } from "../common/DataTable";
+import Modal from "../common/Modal";
+import ConfirmationDialog from "../common/ConfirmationDialog";
+import Button from "../ui/button/Button";
+import Label from "../form/Label";
+import Input from "../form/input/InputField";
+
+export interface MasterDataItem {
+  id: string | number;
+  name: string;
+  description: string;
+  is_active: boolean;
+  [key: string]: any;
+}
+
+interface MasterDataCrudProps {
+  title: string;
+  endpoint: string;
+}
+
+export default function MasterDataCrud({ title, endpoint }: MasterDataCrudProps) {
+  const [data, setData] = useState<MasterDataItem[]>([]);
+  const [loading, setLoading] = useState(true);
+  const [isModalOpen, setIsModalOpen] = useState(false);
+  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
+  const [selectedItem, setSelectedItem] = useState<MasterDataItem | null>(null);
+  const [formData, setFormData] = useState({ name: "", description: "", is_active: true });
+
+  const fetchData = async () => {
+    setLoading(true);
+    try {
+      const res = await fetch(`/api/v1/master-data/${endpoint}`);
+      if (res.ok) {
+        const json = await res.json();
+        // Handle different possible response structures
+        if (Array.isArray(json)) {
+          setData(json);
+        } else if (json.data && Array.isArray(json.data)) {
+          setData(json.data);
+        } else {
+          setData([]);
+        }
+      } else {
+        setData([]);
+      }
+    } catch (error) {
+      console.error("Failed to fetch data", error);
+      setData([]);
+    } finally {
+      setLoading(false);
+    }
+  };
+
+  useEffect(() => {
+    fetchData();
+  }, [endpoint]);
+
+  const handleOpenModal = (item?: MasterDataItem) => {
+    if (item) {
+      setSelectedItem(item);
+      setFormData({ name: item.name, description: item.description, is_active: item.is_active });
+    } else {
+      setSelectedItem(null);
+      setFormData({ name: "", description: "", is_active: true });
+    }
+    setIsModalOpen(true);
+  };
+
+  const handleCloseModal = () => {
+    setIsModalOpen(false);
+    setSelectedItem(null);
+  };
+
+  const handleSave = async () => {
+    const url = selectedItem 
+      ? `/api/v1/master-data/${endpoint}/${selectedItem.id}` 
+      : `/api/v1/master-data/${endpoint}`;
+    
+    const method = selectedItem ? "PUT" : "POST";
+
+    try {
+      const res = await fetch(url, {
+        method,
+        headers: { "Content-Type": "application/json" },
+        body: JSON.stringify(formData),
+      });
+      if (res.ok) {
+        handleCloseModal();
+        fetchData();
+      } else {
+        console.error("Failed to save");
+      }
+    } catch (error) {
+      console.error("Error saving data", error);
+    }
+  };
+
+  const handleOpenDelete = (item: MasterDataItem) => {
+    setSelectedItem(item);
+    setIsDeleteOpen(true);
+  };
+
+  const handleDeleteConfirm = async () => {
+    if (!selectedItem) return;
+    try {
+      const res = await fetch(`/api/v1/master-data/${endpoint}/${selectedItem.id}`, {
+        method: "DELETE",
+      });
+      if (res.ok) {
+        fetchData();
+      } else {
+        console.error("Failed to delete");
+      }
+    } catch (error) {
+      console.error("Error deleting data", error);
+    } finally {
+      setIsDeleteOpen(false);
+      setSelectedItem(null);
+    }
+  };
+
+  const columns: ColumnDef<MasterDataItem>[] = [
+    { header: "Name", accessorKey: "name" },
+    { header: "Description", accessorKey: "description" },
+    { 
+      header: "Status", 
+      accessorKey: "is_active",
+      cell: (item) => (
+        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.is_active ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"}`}>
+          {item.is_active ? "Active" : "Inactive"}
+        </span>
+      )
+    },
+    {
+      header: "Actions",
+      accessorKey: "actions",
+      cell: (item) => (
+        <div className="flex items-center gap-3">
+          <button 
+            onClick={() => handleOpenModal(item)}
+            className="text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-300 text-sm font-medium"
+          >
+            Edit
+          </button>
+          <button 
+            onClick={() => handleOpenDelete(item)}
+            className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium"
+          >
+            Delete
+          </button>
+        </div>
+      )
+    }
+  ];
+
+  return (
+    <div className="flex flex-col gap-6">
+      <div className="flex items-center justify-between">
+        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
+        <Button onClick={() => handleOpenModal()}>
+          Add New
+        </Button>
+      </div>
+
+      <DataTable 
+        columns={columns} 
+        data={data} 
+        loading={loading} 
+        emptyStateMessage={`No ${title.toLowerCase()} found.`} 
+      />
+
+      <Modal 
+        isOpen={isModalOpen} 
+        onClose={handleCloseModal} 
+        title={selectedItem ? \`Edit \${title}\` : \`Add \${title}\`}
+      >
+        <div className="space-y-4">
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
+            <Label>Description</Label>
+            <Input 
+              type="text" 
+              value={formData.description} 
+              onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
+              placeholder="Enter description"
+            />
+          </div>
+          <div className="flex items-center gap-2 mt-2">
+            <input 
+              type="checkbox" 
+              id="is_active" 
+              checked={formData.is_active} 
+              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} 
+              className="w-4 h-4 text-brand-500 border-gray-300 rounded focus:ring-brand-500"
+            />
+            <Label>Active</Label>
+          </div>
+          <div className="flex justify-end gap-3 mt-6">
+            <Button variant="outline" onClick={handleCloseModal}>Cancel</Button>
+            <Button onClick={handleSave}>Save</Button>
+          </div>
+        </div>
+      </Modal>
+
+      <ConfirmationDialog 
+        isOpen={isDeleteOpen}
+        onClose={() => setIsDeleteOpen(false)}
+        onConfirm={handleDeleteConfirm}
+        title="Confirm Deletion"
+        message={\`Are you sure you want to delete this \${title.toLowerCase().replace(/s$/, '')}? This action cannot be undone.\`}
+        confirmText="Delete"
+        isDestructive={true}
+      />
+    </div>
+  );
+}
diff --git a/src/layout/AppSidebar.tsx b/src/layout/AppSidebar.tsx
index 6dd9306..26d3560 100644
--- a/src/layout/AppSidebar.tsx
+++ b/src/layout/AppSidebar.tsx
@@ -101,8 +101,10 @@ const navItems: NavItem[] = [
       { name: "Roles & Permissions", path: "/administration/roles" },
       { name: "Clients", path: "/administration/clients" },
       { name: "Teams", path: "/administration/teams" },
+      { name: "Project Types", path: "/administration/project-types" },
       { name: "Output Types", path: "/administration/output-types" },
-      { name: "Status", path: "/administration/status" },
+      { name: "Task Types", path: "/administration/task-types" },
+      { name: "File Types", path: "/administration/file-types" },
       { name: "System Settings", path: "/administration/settings" },
     ],
   },

