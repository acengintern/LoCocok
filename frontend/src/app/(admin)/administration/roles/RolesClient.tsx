"use client";
import React, { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/client";
import DataTable, { ColumnDef } from "@/components/common/DataTable";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { useToast } from "@/context/ToastContext";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ProtectedContent from "@/components/ProtectedContent";

interface Permission {
  id: number;
  name: string;
}

interface Role {
  id: number;
  name: string;
  permissions?: Permission[];
}

const PROTECTED_ROLE = "system administrator";

export default function RolesClient() {
  const { showToast } = useToast();
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [currentRole, setCurrentRole] = useState<Role | null>(null);
  const [roleName, setRoleName] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Delete modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/roles");
      const data = res.data.data ? res.data.data : res.data;
      setRoles(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch roles");
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      const res = await apiClient.get("/permissions");
      const data = res.data.data ? res.data.data : res.data;
      setPermissions(Array.isArray(data) ? data : []);
    } catch {
      // permissions optional
    }
  };

  const handleOpenCreate = () => {
    setModalMode("create");
    setCurrentRole(null);
    setRoleName("");
    setSelectedPermissions([]);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (role: Role) => {
    setModalMode("edit");
    setCurrentRole(role);
    setRoleName(role.name);
    setSelectedPermissions(role.permissions?.map((p) => p.id) ?? []);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentRole(null);
  };

  const togglePermission = (id: number) => {
    setSelectedPermissions((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim()) {
      setFormError("Role name is required.");
      return;
    }
    setFormError(null);
    setSubmitting(true);
    try {
      if (modalMode === "create") {
        await apiClient.post("/roles", {
          name: roleName.trim(),
          permissions: selectedPermissions,
        });
        showToast({ variant: "success", title: "Role created", message: `"${roleName}" has been added.` });
      } else if (currentRole) {
        await apiClient.put(`/roles/${currentRole.id}`, {
          name: roleName.trim(),
          permissions: selectedPermissions,
        });
        showToast({ variant: "success", title: "Role updated", message: `"${roleName}" has been updated.` });
      }
      handleCloseModal();
      fetchRoles();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "An error occurred";
      setFormError(msg);
      showToast({ variant: "error", title: "Failed", message: msg });
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDelete = (role: Role) => {
    setRoleToDelete(role);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!roleToDelete) return;
    setDeleting(true);
    try {
      await apiClient.delete(`/roles/${roleToDelete.id}`);
      showToast({ variant: "success", title: "Role deleted", message: `"${roleToDelete.name}" has been removed.` });
      setIsDeleteModalOpen(false);
      setRoleToDelete(null);
      fetchRoles();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to delete role";
      showToast({ variant: "error", title: "Delete failed", message: msg });
    } finally {
      setDeleting(false);
    }
  };

  const columns: ColumnDef<Role>[] = [
    {
      header: "Role Name",
      accessorKey: "name",
      cell: (role) => (
        <span className="font-medium text-gray-800 dark:text-white/90">
          {role.name}
        </span>
      ),
    },
    {
      header: "Permissions",
      accessorKey: "permissions",
      sortable: false,
      cell: (role) => (
        <div className="flex flex-wrap gap-1.5 max-w-md">
          {role.permissions && role.permissions.length > 0 ? (
            role.permissions.slice(0, 4).map((perm) => (
              <span
                key={perm.id}
                className="inline-flex items-center px-2 py-0.5 rounded-md text-theme-xs font-medium bg-brand-50 text-brand-700 border border-brand-200/60 dark:bg-brand-500/10 dark:text-brand-300 dark:border-brand-800/40"
              >
                {perm.name}
              </span>
            ))
          ) : (
            <span className="text-gray-400 text-xs italic">No permissions assigned</span>
          )}
          {role.permissions && role.permissions.length > 4 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-theme-xs font-semibold bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
              +{role.permissions.length - 4} more
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Actions",
      accessorKey: "id",
      sortable: false,
      cell: (role) => {
        const isProtected = role.name.toLowerCase() === PROTECTED_ROLE;
        return (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={isProtected}
              onClick={() => handleOpenEdit(role)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 disabled:opacity-40 disabled:cursor-not-allowed dark:bg-amber-500/10 dark:text-amber-400 dark:hover:bg-amber-500/20 border border-amber-200 dark:border-amber-800/40 transition-colors cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>
            <button
              type="button"
              disabled={isProtected}
              onClick={() => handleOpenDelete(role)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-40 disabled:cursor-not-allowed dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 border border-red-200 dark:border-red-800/40 transition-colors cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <ProtectedContent>
      <PageBreadcrumb pageTitle="Roles & Permissions" />

      {/* Main Card Container */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Roles & Access Levels
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Define organizational roles and security access boundaries
            </p>
          </div>
          <Button
            size="md"
            onClick={handleOpenCreate}
            startIcon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
            }
          >
            Add New Role
          </Button>
        </div>

        {error && (
          <div className="mb-4 p-4 text-sm text-error-600 bg-error-50 rounded-xl border border-error-200 dark:bg-error-950/30 dark:border-error-800/40 dark:text-error-400">
            {error}
          </div>
        )}

        <DataTable
          columns={columns}
          data={roles}
          loading={loading}
          enableSelection={true}
          emptyStateMessage="No roles found."
          searchPlaceholder="Search roles..."
        />
      </div>

      {/* Create / Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} className="w-[95vw] max-w-[560px] p-5 sm:p-6 mx-auto">
        <h3 className="mb-4 text-lg font-bold text-gray-800 dark:text-white/90">
          {modalMode === "create" ? "Create Role" : "Edit Role"}
        </h3>
        {formError && (
          <div className="mb-4 rounded-lg bg-error-50 px-4 py-3 text-sm text-error-600 dark:bg-error-950/30 dark:text-error-400">
            {formError}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4">
            <div>
              <Label>Role Name <span className="text-error-500">*</span></Label>
              <Input
                type="text"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                placeholder="e.g. Content Editor"
              />
            </div>

            {permissions.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label>Permissions ({selectedPermissions.length} selected)</Label>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedPermissions.length === permissions.length) {
                        setSelectedPermissions([]);
                      } else {
                        setSelectedPermissions(permissions.map((p) => p.id));
                      }
                    }}
                    className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline cursor-pointer"
                  >
                    {selectedPermissions.length === permissions.length ? "Deselect All" : "Select All"}
                  </button>
                </div>
                <div className="max-h-56 overflow-y-auto rounded-xl border border-gray-200 dark:border-gray-700/80 p-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2 bg-gray-50/50 dark:bg-gray-900/40 custom-scrollbar">
                  {permissions.map((perm) => {
                    const isSelected = selectedPermissions.includes(perm.id);
                    return (
                      <button
                        type="button"
                        key={perm.id}
                        onClick={() => togglePermission(perm.id)}
                        className={`flex items-center justify-between p-2.5 rounded-lg border text-left text-xs font-medium transition-all cursor-pointer ${
                          isSelected
                            ? "border-brand-500 bg-brand-50 text-brand-700 dark:border-brand-600 dark:bg-brand-500/15 dark:text-brand-300 font-semibold shadow-xs"
                            : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/5"
                        }`}
                      >
                        <span className="truncate mr-2 font-mono text-[11px]">{perm.name}</span>
                        <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                          isSelected
                            ? "border-brand-500 bg-brand-500 text-white"
                            : "border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800"
                        }`}>
                          {isSelected && (
                            <svg className="w-3 h-3 stroke-current" fill="none" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-2 flex justify-end gap-2.5">
              <Button variant="outline" size="sm" onClick={handleCloseModal} type="button">
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={submitting}>
                {submitting ? "Saving..." : "Save Role"}
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} className="w-[95vw] max-w-[450px] p-5 sm:p-6 mx-auto">
        <h3 className="mb-3 text-lg font-bold text-gray-800 dark:text-white/90">Delete Role</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
          Are you sure you want to delete role{" "}
          <strong className="text-gray-800 dark:text-white">{roleToDelete?.name}</strong>?
          Users with this role will lose access.
        </p>
        <div className="flex justify-end gap-2.5">
          <Button variant="outline" size="sm" onClick={() => setIsDeleteModalOpen(false)} disabled={deleting} type="button">
            Cancel
          </Button>
          <button
            type="button"
            onClick={handleConfirmDelete}
            disabled={deleting}
            className="inline-flex h-8 items-center justify-center rounded-lg bg-error-500 px-3.5 text-theme-xs font-semibold text-white shadow-theme-xs hover:bg-error-600 active:bg-error-700 disabled:opacity-50 transition-colors cursor-pointer"
          >
            {deleting ? "Deleting..." : "Delete Role"}
          </button>
        </div>
      </Modal>
    </ProtectedContent>
  );
}
