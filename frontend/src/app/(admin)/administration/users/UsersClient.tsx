"use client";

import React, { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/client";
import { useAuth } from "@/hooks/useAuth";
import DataTable, { ColumnDef } from "@/components/common/DataTable";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import { useToast } from "@/context/ToastContext";
import UserAvatar from "@/components/common/UserAvatar";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ProtectedContent from "@/components/ProtectedContent";

interface Role {
  id: number;
  name: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string | null;
  status: string;
  roles?: { id: number; name: string }[];
}

export default function UsersClient() {
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [submitting, setSubmitting] = useState(false);

  // Delete single modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Bulk Delete modal states
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [bulkDeleteIds, setBulkDeleteIds] = useState<(string | number)[]>([]);
  const [clearSelectionFn, setClearSelectionFn] = useState<(() => void) | null>(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [bulkDeleteError, setBulkDeleteError] = useState<string | null>(null);

  // Form states
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/users");
      const data = res.data.data ? res.data.data : res.data;
      setUsers(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await apiClient.get("/roles");
      const data = res.data.data ? res.data.data : res.data;
      setRoles(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Failed to fetch roles", err);
    }
  };

  const handleOpenModal = (mode: "create" | "edit", user?: User) => {
    setFormError(null);
    setModalMode(mode);
    if (mode === "edit" && user) {
      setCurrentUserId(user.id);
      setFormData({
        name: user.name,
        email: user.email,
        password: "", // empty password means don't change
      });
      const currentRole = user.roles && user.roles.length > 0
        ? (typeof user.roles[0] === "string" ? user.roles[0] : user.roles[0].name)
        : "";
      setSelectedRole(currentRole);
    } else {
      setCurrentUserId(null);
      setFormData({
        name: "",
        email: "",
        password: "",
      });
      setSelectedRole(roles.length > 0 ? roles[0].name : "");
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleOpenDeleteModal = (user: User) => {
    setUserToDelete(user);
    setDeleteError(null);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setUserToDelete(null);
    setDeleteError(null);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    setDeleteError(null);
    setDeleting(true);
    try {
      await apiClient.delete(`/users/${userToDelete.id}`);
      showToast({
        variant: "success",
        title: "User deleted",
        message: `"${userToDelete.name}" has been removed from the system.`,
      });
      handleCloseDeleteModal();
      fetchUsers();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to delete user";
      setDeleteError(msg);
      showToast({
        variant: "error",
        title: "Delete failed",
        message: msg,
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      let userId = currentUserId;

      if (modalMode === "create") {
        // Create User with single role
        const res = await apiClient.post("/users", {
          name: formData.name,
          email: formData.email,
          username: formData.email.split("@")[0],
          password: formData.password,
          role: selectedRole || undefined,
        });
        const createdUser = res.data.data ? res.data.data : res.data;
        userId = createdUser.id;
      } else {
        // Edit User
        const payload: any = {
          name: formData.name,
          email: formData.email,
          role: selectedRole || undefined,
        };
        if (formData.password) {
          payload.password = formData.password;
        }
        await apiClient.put(`/users/${userId}`, payload);
      }

      // Assign single role if selected
      if (userId && selectedRole) {
        await apiClient.post(`/users/${userId}/roles`, {
          role: selectedRole,
        });
      }

      handleCloseModal();
      fetchUsers();
      showToast({
        variant: "success",
        title: modalMode === "create" ? "User created" : "User updated",
        message:
          modalMode === "create"
            ? `"${formData.name}" has been added successfully.`
            : `"${formData.name}" has been updated successfully.`,
      });
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "An error occurred";
      setFormError(msg);
      showToast({
        variant: "error",
        title: modalMode === "create" ? "Create failed" : "Update failed",
        message: msg,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const columns: ColumnDef<User>[] = [
    {
      header: "Name",
      accessorKey: "name",
      cell: (user) => (
        <div className="flex items-center gap-3">
          <UserAvatar src={user.avatar} name={user.name} size={32} />
          <span className="font-medium text-gray-800 dark:text-white/90">
            {user.name}
          </span>
        </div>
      ),
    },
    {
      header: "Email",
      accessorKey: "email",
      cell: (user) => (
        <span className="text-gray-500 dark:text-gray-400">{user.email}</span>
      ),
    },
    {
      header: "Role",
      accessorKey: "roles",
      sortable: false,
      cell: (user) => {
        const roleName = user.roles && user.roles.length > 0
          ? (typeof user.roles[0] === "object" ? user.roles[0].name : user.roles[0])
          : "None";

        // Map role names to badge colors
        const roleColorMap: Record<string, "primary" | "success" | "error" | "warning" | "info" | "dark"> = {
          "system administrator": "error",
          "creative director":    "dark",
          "account executive":    "primary",
          "social media specialist": "info",
          "graphic designer":     "warning",
          "video editor / dav":   "warning",
          "video editor":         "warning",
          "kol":                  "success",
          "production assistant": "info",
        };

        const key = roleName.toLowerCase().trim();
        const badgeColor = roleColorMap[key] ?? "primary";

        return (
          <Badge size="sm" color={badgeColor}>
            {roleName}
          </Badge>
        );
      },
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (user) => (
        <Badge size="sm" color={user.status?.toUpperCase() === "ACTIVE" || !user.status ? "success" : "error"}>
          {user.status?.toUpperCase() === "ACTIVE" || !user.status ? "Active" : user.status.charAt(0).toUpperCase() + user.status.slice(1).toLowerCase()}
        </Badge>
      ),
    },
    {
      header: "Actions",
      accessorKey: "id",
      sortable: false,
      cell: (user) => {
        const isSystemAdmin = user.roles?.some(
          (r) => (typeof r === "string" ? r : r.name).toLowerCase() === "system administrator"
        );

        return (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={isSystemAdmin}
              onClick={() => handleOpenModal("edit", user)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 disabled:opacity-40 disabled:cursor-not-allowed dark:bg-amber-500/10 dark:text-amber-400 dark:hover:bg-amber-500/20 border border-amber-200 dark:border-amber-800/40 transition-colors cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>
            <button
              type="button"
              disabled={currentUser?.id === user.id || isSystemAdmin}
              onClick={() => handleOpenDeleteModal(user)}
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

  const handleOpenBulkDeleteModal = (
    selectedIds: (string | number)[],
    clearSelection: () => void
  ) => {
    // Exclude current logged in user from bulk delete
    const validIds = selectedIds.filter((id) => id !== currentUser?.id);
    setBulkDeleteIds(validIds);
    setClearSelectionFn(() => clearSelection);
    setBulkDeleteError(null);
    setIsBulkDeleteModalOpen(true);
  };

  const handleCloseBulkDeleteModal = () => {
    setIsBulkDeleteModalOpen(false);
    setBulkDeleteIds([]);
    setBulkDeleteError(null);
  };

  const handleConfirmBulkDelete = async () => {
    if (bulkDeleteIds.length === 0) return;
    setBulkDeleteError(null);
    setBulkDeleting(true);
    const count = bulkDeleteIds.length;
    try {
      await Promise.all(bulkDeleteIds.map((id) => apiClient.delete(`/users/${id}`)));
      if (clearSelectionFn) {
        clearSelectionFn();
      }
      handleCloseBulkDeleteModal();
      fetchUsers();
      showToast({
        variant: "success",
        title: `${count} user${count === 1 ? "" : "s"} deleted`,
        message: `${count} user account${count === 1 ? " has" : "s have"} been removed from the system.`,
      });
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to delete selected users";
      setBulkDeleteError(msg);
      showToast({
        variant: "error",
        title: "Bulk delete failed",
        message: msg,
      });
    } finally {
      setBulkDeleting(false);
    }
  };

  return (
    <ProtectedContent>
      <PageBreadcrumb pageTitle="User Accounts" />

      {/* Main Card Container */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              User Accounts
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Manage agency team members, account credentials, and system access
            </p>
          </div>
          <Button
            size="md"
            onClick={() => handleOpenModal("create")}
            startIcon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
            }
          >
            Add New User
          </Button>
        </div>

        {error && (
          <div className="mb-4 p-4 text-sm text-error-600 bg-error-50 rounded-xl border border-error-200 dark:bg-error-950/30 dark:border-error-800/40 dark:text-error-400">
            {error}
          </div>
        )}

        <DataTable
          columns={columns}
          data={users}
          loading={loading}
          enableSelection={true}
          bulkActions={(selectedIds, selectedRows, clearSelection) => (
            <Button
              size="sm"
              variant="outline"
              className="text-error-600 border-error-200 hover:bg-error-50 dark:border-error-800/40 dark:text-error-400 dark:hover:bg-error-950/30"
              onClick={() => handleOpenBulkDeleteModal(selectedIds, clearSelection)}
            >
              Delete Selected ({selectedIds.length})
            </Button>
          )}
          emptyStateMessage="No users found."
          searchPlaceholder="Search users..."
        />
      </div>

      {/* Create / Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} className="max-w-[500px] p-6">
        <h3 className="mb-5 text-lg font-bold text-gray-800 dark:text-white/90">
          {modalMode === "create" ? "Create User" : "Edit User"}
        </h3>
        {formError && <div className="mb-4 text-sm text-red-500">{formError}</div>}
        <div className="flex flex-col gap-4">
          <div>
            <Label>Name</Label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter name"
            />
          </div>
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Enter email"
            />
          </div>
          <div>
            <Label>Password {modalMode === "edit" && <span className="text-gray-400">(leave blank to keep current)</span>}</Label>
            <Input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Enter password"
            />
          </div>
          <div>
            <Label>Role</Label>
            <div className="mt-1">
              <Select
                value={selectedRole}
                onChange={(val) => setSelectedRole(val)}
                placeholder="Select a Role"
                options={roles
                  .filter((role) => role.name.toLowerCase() !== "system administrator")
                  .map((role) => ({
                    value: role.name,
                    label: role.name,
                  }))}
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-3">
            <Button variant="outline" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button onClick={(e: any) => handleSubmit(e)} disabled={submitting}>
              {submitting ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Single Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={handleCloseDeleteModal} className="max-w-[450px] p-6">
        <h3 className="mb-3 text-lg font-bold text-gray-800 dark:text-white/90">
          Delete User Account
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
          Are you sure you want to delete user{" "}
          <strong className="text-gray-800 dark:text-white">{userToDelete?.name}</strong> (
          {userToDelete?.email})? This action will remove the user from the system.
        </p>
        {deleteError && <div className="mb-4 text-sm text-red-500">{deleteError}</div>}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={handleCloseDeleteModal} disabled={deleting}>
            Cancel
          </Button>
          <button
            type="button"
            onClick={handleConfirmDelete}
            disabled={deleting}
            className="inline-flex items-center justify-center rounded-lg bg-error-500 px-4 py-2 text-sm font-medium text-white shadow-theme-xs hover:bg-error-600 focus:outline-hidden disabled:opacity-50 transition"
          >
            {deleting ? "Deleting..." : "Delete User"}
          </button>
        </div>
      </Modal>

      {/* Bulk Delete Confirmation Modal */}
      <Modal isOpen={isBulkDeleteModalOpen} onClose={handleCloseBulkDeleteModal} className="max-w-[450px] p-6">
        <h3 className="mb-3 text-lg font-bold text-gray-800 dark:text-white/90">
          Delete Selected Users
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
          Are you sure you want to delete <strong className="text-gray-800 dark:text-white">{bulkDeleteIds.length}</strong> selected user accounts? This action cannot be undone.
        </p>
        {bulkDeleteError && <div className="mb-4 text-sm text-red-500">{bulkDeleteError}</div>}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={handleCloseBulkDeleteModal} disabled={bulkDeleting}>
            Cancel
          </Button>
          <button
            type="button"
            onClick={handleConfirmBulkDelete}
            disabled={bulkDeleting}
            className="inline-flex items-center justify-center rounded-lg bg-error-500 px-4 py-2 text-sm font-medium text-white shadow-theme-xs hover:bg-error-600 focus:outline-hidden disabled:opacity-50 transition"
          >
            {bulkDeleting ? "Deleting..." : `Delete ${bulkDeleteIds.length} Users`}
          </button>
        </div>
      </Modal>
    </ProtectedContent>
  );
}
