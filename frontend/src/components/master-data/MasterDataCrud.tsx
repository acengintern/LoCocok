"use client";
import React, { useState, useEffect, useCallback } from "react";
import DataTable, { ColumnDef } from "../common/DataTable";
import Modal from "../common/Modal";
import ConfirmationDialog from "../common/ConfirmationDialog";
import Button from "../ui/button/Button";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import { useToast } from "@/context/ToastContext";
import { apiClient } from "@/lib/api/client";

export interface MasterDataItem {
  id: string | number;
  name: string;
  code?: string;
  category?: string;
  description?: string;
  [key: string]: any;
}

interface MasterDataCrudProps {
  title: string;
  endpoint: string;
}

export default function MasterDataCrud({ title, endpoint }: MasterDataCrudProps) {
  const { showToast } = useToast();
  const [data, setData] = useState<MasterDataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MasterDataItem | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    category: "",
    description: "",
  });
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/master/${endpoint}`);
      const responseData = res.data?.data ?? res.data;
      if (Array.isArray(responseData)) {
        setData(responseData);
      } else {
        setData([]);
      }
    } catch (error) {
      console.error("Failed to fetch master data", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenModal = (item?: MasterDataItem) => {
    if (item) {
      setSelectedItem(item);
      setFormData({
        name: item.name || "",
        code: item.code || "",
        category: item.category || "",
        description: item.description || "",
      });
    } else {
      setSelectedItem(null);
      setFormData({
        name: "",
        code: "",
        category: "",
        description: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      showToast({
        variant: "error",
        title: "Validation Error",
        message: "Name field is required.",
      });
      return;
    }

    setSaving(true);
    const isEdit = !!selectedItem;
    const url = isEdit
      ? `/master/${endpoint}/${selectedItem.id}`
      : `/master/${endpoint}`;

    try {
      if (isEdit) {
        await apiClient.put(url, formData);
      } else {
        await apiClient.post(url, formData);
      }

      handleCloseModal();
      fetchData();
      showToast({
        variant: "success",
        title: isEdit ? `${title} Updated` : `${title} Created`,
        message: isEdit
          ? `"${formData.name}" has been updated successfully.`
          : `"${formData.name}" has been created successfully.`,
      });
    } catch (error: any) {
      console.error("Error saving data", error);
      const errMsg = error.response?.data?.message || "Failed to save record.";
      showToast({
        variant: "error",
        title: "Save Failed",
        message: errMsg,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleOpenDelete = (item: MasterDataItem) => {
    setSelectedItem(item);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedItem) return;
    const itemName = selectedItem.name;
    try {
      await apiClient.delete(`/master/${endpoint}/${selectedItem.id}`);
      fetchData();
      showToast({
        variant: "success",
        title: `${title} Deleted`,
        message: `"${itemName}" has been removed.`,
      });
    } catch (error: any) {
      const errMsg = error.response?.data?.message || "Failed to delete record.";
      showToast({
        variant: "error",
        title: "Delete Failed",
        message: errMsg,
      });
    } finally {
      setIsDeleteOpen(false);
      setSelectedItem(null);
    }
  };

  const columns: ColumnDef<MasterDataItem>[] = [
    {
      header: "Name",
      accessorKey: "name",
      cell: (row) => (
        <div className="font-semibold text-gray-900 dark:text-white">
          {row.name}
        </div>
      ),
    },
    ...(endpoint === "project-types" || endpoint === "task-types" || endpoint === "file-types"
      ? [
          {
            header: "Code",
            accessorKey: "code" as any,
            cell: (row: MasterDataItem) => (
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                {row.code || "-"}
              </span>
            ),
          },
        ]
      : []),
    ...(endpoint === "output-types"
      ? [
          {
            header: "Category",
            accessorKey: "category" as any,
            cell: (row: MasterDataItem) => (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400 font-medium">
                {row.category || "General"}
              </span>
            ),
          },
        ]
      : []),
    {
      header: "Description",
      accessorKey: "description",
      cell: (row) => (
        <div className="text-sm text-gray-500 dark:text-gray-400 max-w-md truncate">
          {row.description || "-"}
        </div>
      ),
    },
    {
      header: "Actions",
      accessorKey: "id",
      cell: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleOpenModal(row)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:hover:bg-amber-500/20 border border-amber-200 dark:border-amber-800/40 transition-colors cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </button>
          <button
            type="button"
            onClick={() => handleOpenDelete(row)}
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

  return (
    <div className="space-y-6">
      {/* Main Card Container */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              {title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Manage agency {title.toLowerCase()} configurations and standards
            </p>
          </div>
          <Button
            size="md"
            onClick={() => handleOpenModal()}
            startIcon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
            }
          >
            Add {title.replace(/s$/, "")}
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={data}
          loading={loading}
          enableSelection={true}
          searchPlaceholder={`Search ${title.toLowerCase()}...`}
        />
      </div>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedItem ? `Edit ${title.replace(/s$/, "")}` : `Add New ${title.replace(/s$/, "")}`}
      >
        <div className="space-y-4">
          <div>
            <Label>Name *</Label>
            <Input
              type="text"
              placeholder={`e.g. Social Media Management`}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          {(endpoint === "project-types" || endpoint === "task-types" || endpoint === "file-types") && (
            <div>
              <Label>Code (Optional)</Label>
              <Input
                type="text"
                placeholder="e.g. SMM, OTP, DVC"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              />
            </div>
          )}

          {endpoint === "output-types" && (
            <div>
              <Label>Category (Optional)</Label>
              <Input
                type="text"
                placeholder="e.g. Social Media, Video & Reels, Commercial"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
            </div>
          )}

          <div>
            <Label>Description (Optional)</Label>
            <textarea
              className="w-full rounded-xl border border-gray-200 bg-transparent p-3 text-sm text-gray-800 dark:border-gray-800 dark:text-white/90 focus:border-brand-500 focus:outline-none"
              rows={3}
              placeholder="Brief description of this master data entry..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={handleCloseModal} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving} className="bg-brand-500 hover:bg-brand-600 text-white">
              {saving ? "Saving..." : selectedItem ? "Update Changes" : "Save Record"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title={`Delete ${title.replace(/s$/, "")}`}
        message={`Are you sure you want to delete "${selectedItem?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        isDestructive={true}
      />
    </div>
  );
}
