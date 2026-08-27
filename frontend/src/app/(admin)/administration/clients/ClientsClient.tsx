"use client";

import React, { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/client";
import DataTable, { ColumnDef } from "@/components/common/DataTable";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import Modal from "@/components/common/Modal";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import Link from "next/link";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ProtectedContent from "@/components/ProtectedContent";

interface ClientData {
  id: number;
  name: string;
  brand_name: string;
  address: string;
  phone: string;
  email: string;
  pic_name: string;
  pic_phone: string;
  pic_email: string;
  status: string;
  ae?: { name: string };
  sms?: { name: string };
}

export default function ClientsClient() {
  const [clients, setClients] = useState<ClientData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [submitting, setSubmitting] = useState(false);

  // Delete single client modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<ClientData | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Bulk delete states
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [bulkDeleteIds, setBulkDeleteIds] = useState<(string | number)[]>([]);
  const [clearSelectionFn, setClearSelectionFn] = useState<(() => void) | null>(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [bulkDeleteError, setBulkDeleteError] = useState<string | null>(null);

  // Form states
  const [currentClientId, setCurrentClientId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    brand_name: "",
    address: "",
    phone: "",
    email: "",
    pic_name: "",
    pic_phone: "",
    pic_email: "",
    status: "ACTIVE",
  });
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/clients");
      const data = res.data.data ? res.data.data : res.data;
      setClients(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch clients");
      // Fallback to empty array on error
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (mode: "create" | "edit", client?: ClientData) => {
    setFormError(null);
    setModalMode(mode);
    if (mode === "edit" && client) {
      setCurrentClientId(client.id);
      setFormData({
        name: client.name || "",
        brand_name: client.brand_name || "",
        address: client.address || "",
        phone: client.phone || "",
        email: client.email || "",
        pic_name: client.pic_name || "",
        pic_phone: client.pic_phone || "",
        pic_email: client.pic_email || "",
        status: client.status || "ACTIVE",
      });
    } else {
      setCurrentClientId(null);
      setFormData({
        name: "",
        brand_name: "",
        address: "",
        phone: "",
        email: "",
        pic_name: "",
        pic_phone: "",
        pic_email: "",
        status: "ACTIVE",
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      if (modalMode === "create") {
        await apiClient.post("/clients", formData);
      } else {
        await apiClient.put(`/clients/${currentClientId}`, formData);
      }
      handleCloseModal();
      fetchClients();
    } catch (err: any) {
      if (err.response && err.response.data) {
        setFormError(err.response.data.message || "An error occurred");
      } else {
        setFormError(err.message || "An error occurred");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const columns: ColumnDef<ClientData>[] = [
    {
      header: "Brand / Client",
      accessorKey: "brand_name",
      cell: (client) => (
        <Link href={`/administration/clients/${client.id}`} className="hover:text-brand-500 font-medium transition-colors">
          {client.brand_name || client.name}
          {client.brand_name && client.name && client.brand_name !== client.name && (
            <span className="block text-xs text-gray-400 font-normal">{client.name}</span>
          )}
        </Link>
      ),
    },
    {
      header: "Contact (PIC)",
      accessorKey: "pic_name",
      cell: (client) => <span className="text-gray-700 dark:text-gray-300">{client.pic_name || "-"}</span>,
    },
    {
      header: "Email / Phone",
      accessorKey: "email",
      cell: (client) => (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          <div>{client.email || "-"}</div>
          <div>{client.phone || "-"}</div>
        </div>
      ),
    },
    {
      header: "AE / SMS",
      accessorKey: "ae",
      sortable: false,
      cell: (client) => (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          <div><span className="font-medium text-gray-700 dark:text-gray-300">AE:</span> {client.ae?.name || "-"}</div>
          <div><span className="font-medium text-gray-700 dark:text-gray-300">SMS:</span> {client.sms?.name || "-"}</div>
        </div>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (client) => (
        <Badge size="sm" color={client.status?.toUpperCase() === "ACTIVE" || !client.status ? "success" : "error"}>
          {client.status?.toUpperCase() === "ACTIVE" || !client.status ? "Active" : client.status.charAt(0).toUpperCase() + client.status.slice(1).toLowerCase()}
        </Badge>
      ),
    },
    {
      header: "Actions",
      accessorKey: "id",
      sortable: false,
      cell: (client) => (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleOpenModal("edit", client)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:hover:bg-amber-500/20 border border-amber-200 dark:border-amber-800/40 transition-colors cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </button>
          <Link
            href={`/administration/clients/${client.id}`}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20 border border-blue-200 dark:border-blue-800/40 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            View
          </Link>
          <button
            type="button"
            onClick={() => handleOpenDeleteModal(client)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 border border-red-200 dark:border-red-800/40 transition-colors cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </div>
      ),
    },
  ];

  const handleOpenDeleteModal = (client: ClientData) => {
    setClientToDelete(client);
    setDeleteError(null);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setClientToDelete(null);
    setDeleteError(null);
  };

  const handleConfirmDelete = async () => {
    if (!clientToDelete) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await apiClient.delete(`/clients/${clientToDelete.id}`);
      handleCloseDeleteModal();
      fetchClients();
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.message) {
        setDeleteError(err.response.data.message);
      } else {
        setDeleteError(err.message || "Failed to delete client");
      }
    } finally {
      setDeleting(false);
    }
  };

  const handleOpenBulkDeleteModal = (
    selectedIds: (string | number)[],
    clearSelection: () => void
  ) => {
    setBulkDeleteIds(selectedIds);
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
    setBulkDeleting(true);
    setBulkDeleteError(null);
    try {
      await Promise.all(bulkDeleteIds.map((id) => apiClient.delete(`/clients/${id}`)));
      if (clearSelectionFn) {
        clearSelectionFn();
      }
      handleCloseBulkDeleteModal();
      fetchClients();
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.message) {
        setBulkDeleteError(err.response.data.message);
      } else {
        setBulkDeleteError(err.message || "Failed to delete selected clients");
      }
    } finally {
      setBulkDeleting(false);
    }
  };

  return (
    <ProtectedContent>
      <PageBreadcrumb pageTitle="Clients Management" />

      {/* Main Card Container */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Clients Management
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Directory of corporate brand partners, contracts, and assigned PICs
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
            Add New Client
          </Button>
        </div>

        {error && (
          <div className="mb-4 p-4 text-sm text-error-600 bg-error-50 rounded-xl border border-error-200 dark:bg-error-950/30 dark:border-error-800/40 dark:text-error-400">
            {error}
          </div>
        )}

        <DataTable
          columns={columns}
          data={clients}
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
          emptyStateMessage="No clients found."
          searchPlaceholder="Search clients..."
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={modalMode === "create" ? "Create Client" : "Edit Client"}
        maxWidth="lg"
      >
        {formError && <div className="mb-4 text-sm text-red-500">{formError}</div>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Company Name *</Label>
              <Input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter company name"
              />
            </div>
            <div>
              <Label>Brand Name</Label>
              <Input
                type="text"
                value={formData.brand_name}
                onChange={(e) => setFormData({ ...formData, brand_name: e.target.value })}
                placeholder="Enter brand name"
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Address</Label>
              <Input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Enter address"
              />
            </div>
            <div>
              <Label>Company Phone</Label>
              <Input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Enter company phone"
              />
            </div>
            <div>
              <Label>Company Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter company email"
              />
            </div>
            <div className="sm:col-span-2 mt-2 pt-2 border-t border-gray-200 dark:border-gray-800">
              <h4 className="text-sm font-semibold mb-2">PIC (Person in Charge) Details</h4>
            </div>
            <div>
              <Label>PIC Name</Label>
              <Input
                type="text"
                value={formData.pic_name}
                onChange={(e) => setFormData({ ...formData, pic_name: e.target.value })}
                placeholder="Enter PIC name"
              />
            </div>
            <div>
              <Label>PIC Phone</Label>
              <Input
                type="text"
                value={formData.pic_phone}
                onChange={(e) => setFormData({ ...formData, pic_phone: e.target.value })}
                placeholder="Enter PIC phone"
              />
            </div>
            <div>
              <Label>PIC Email</Label>
              <Input
                type="email"
                value={formData.pic_email}
                onChange={(e) => setFormData({ ...formData, pic_email: e.target.value })}
                placeholder="Enter PIC email"
              />
            </div>
            <div>
              <Label>Status</Label>
              <Select
                options={[
                  { value: "ACTIVE", label: "Active" },
                  { value: "INACTIVE", label: "Inactive" }
                ]}
                defaultValue={formData.status}
                onChange={(val) => setFormData({ ...formData, status: val })}
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Single Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        title="Delete Client"
        maxWidth="sm"
      >
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
          Are you sure you want to delete client{" "}
          <strong className="text-gray-800 dark:text-white">{clientToDelete?.name || clientToDelete?.brand_name}</strong>? This action will remove the client record.
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
            {deleting ? "Deleting..." : "Delete Client"}
          </button>
        </div>
      </Modal>

      {/* Bulk Delete Confirmation Modal */}
      <Modal
        isOpen={isBulkDeleteModalOpen}
        onClose={handleCloseBulkDeleteModal}
        title="Delete Selected Clients"
        maxWidth="sm"
      >
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
          Are you sure you want to delete <strong className="text-gray-800 dark:text-white">{bulkDeleteIds.length}</strong> selected clients? This action cannot be undone.
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
            {bulkDeleting ? "Deleting..." : `Delete ${bulkDeleteIds.length} Clients`}
          </button>
        </div>
      </Modal>
    </ProtectedContent>
  );
}
