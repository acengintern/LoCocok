"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import DataTable, { ColumnDef } from "@/components/common/DataTable";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Modal from "@/components/common/Modal";
import ConfirmationDialog from "@/components/common/ConfirmationDialog";
import { apiClient } from "@/lib/api/client";
import { useToast } from "@/context/ToastContext";
import Select from "@/components/form/Select";
import DatePicker from "@/components/form/date-picker";
import Link from "next/link";
import ProtectedContent from "@/components/ProtectedContent";

interface Project {
  id: number;
  project_code: string;
  name: string;
  client?: { id: number; name: string };
  client_id?: number;
  project_type?: { id: number; name: string };
  project_type_id?: number;
  ae?: { id: number; name: string; first_name?: string; last_name?: string };
  ae_id?: number;
  sms?: { id: number; name: string; first_name?: string; last_name?: string };
  sms_id?: number;
  creative_director?: { id: number; name: string };
  cd_id?: number;
  priority: string;
  status: string;
  start_date?: string;
  end_date?: string;
  notes?: string;
}

interface UserOption {
  id: number;
  name: string;
  roles?: { id: number; name: string }[];
}

export default function ProjectsPage() {
  const { showToast } = useToast();
  const [data, setData] = useState<Project[]>([]);
  const [clientsList, setClientsList] = useState<{ id: number; name: string }[]>([]);
  const [typesList, setTypesList] = useState<{ id: number; name: string }[]>([]);
  const [usersList, setUsersList] = useState<UserOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState<boolean>(false);
  const [bulkDeleting, setBulkDeleting] = useState<boolean>(false);
  const [clearSelectionFn, setClearSelectionFn] = useState<(() => void) | null>(null);

  // Modal form states (Create & Edit)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingProjectId, setEditingProjectId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    client_id: "",
    project_type_id: "",
    ae_id: "",
    sms_id: "",
    cd_id: "",
    priority: "MID",
    status: "CONTENT_PLANNING",
    start_date: "",
    end_date: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/projects?include=client,projectType,ae,sms,cd");
      const responseData = res.data?.data ?? res.data;
      if (Array.isArray(responseData)) {
        setData(responseData);
      } else {
        setData([]);
      }
    } catch (error) {
      console.error("Failed to fetch projects", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchOptions = useCallback(async () => {
    try {
      const [cRes, tRes, uRes] = await Promise.all([
        apiClient.get("/clients"),
        apiClient.get("/master/project-types"),
        apiClient.get("/users"),
      ]);
      const cData = cRes.data?.data ?? cRes.data;
      const tData = tRes.data?.data ?? tRes.data;
      const uData = uRes.data?.data ?? uRes.data;
      if (Array.isArray(cData)) setClientsList(cData);
      if (Array.isArray(tData)) setTypesList(tData);
      if (Array.isArray(uData)) setUsersList(uData);
    } catch (err) {
      console.error("Failed to fetch options", err);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
    fetchOptions();
  }, [fetchProjects, fetchOptions]);

  const handleOpenCreate = () => {
    setFormMode("create");
    setEditingProjectId(null);
    setFormData({
      name: "",
      client_id: clientsList[0]?.id ? String(clientsList[0].id) : "",
      project_type_id: typesList[0]?.id ? String(typesList[0].id) : "",
      ae_id: "",
      sms_id: "",
      cd_id: "",
      priority: "MID",
      status: "CONTENT_PLANNING",
      start_date: "",
      end_date: "",
      notes: "",
    });
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (project: Project) => {
    setFormMode("edit");
    setEditingProjectId(project.id);
    setFormData({
      name: project.name || "",
      client_id: project.client?.id ? String(project.client.id) : project.client_id ? String(project.client_id) : "",
      project_type_id: project.project_type?.id ? String(project.project_type.id) : project.project_type_id ? String(project.project_type_id) : "",
      ae_id: project.ae?.id ? String(project.ae.id) : project.ae_id ? String(project.ae_id) : "",
      sms_id: project.sms?.id ? String(project.sms.id) : project.sms_id ? String(project.sms_id) : "",
      cd_id: project.creative_director?.id ? String(project.creative_director.id) : project.cd_id ? String(project.cd_id) : "",
      priority: project.priority || "MID",
      status: project.status || "CONTENT_PLANNING",
      start_date: project.start_date ? project.start_date.split("T")[0] : "",
      end_date: project.end_date ? project.end_date.split("T")[0] : "",
      notes: project.notes || "",
    });
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = async () => {
    if (!formData.name.trim()) {
      showToast({ variant: "error", title: "Validation Error", message: "Project name is required." });
      return;
    }
    if (!formData.client_id) {
      showToast({ variant: "error", title: "Validation Error", message: "Please select a client." });
      return;
    }
    if (!formData.project_type_id) {
      showToast({ variant: "error", title: "Validation Error", message: "Please select a project type." });
      return;
    }

    setSaving(true);
    try {
      const payload: Record<string, any> = {
        name: formData.name.trim(),
        client_id: Number(formData.client_id),
        project_type_id: Number(formData.project_type_id),
        priority: formData.priority,
        status: formData.status,
      };

      if (formData.ae_id) payload.ae_id = Number(formData.ae_id);
      else payload.ae_id = null;

      if (formData.sms_id) payload.sms_id = Number(formData.sms_id);
      else payload.sms_id = null;

      if (formData.cd_id) payload.cd_id = Number(formData.cd_id);
      else payload.cd_id = null;

      if (formData.start_date) payload.start_date = formData.start_date;
      if (formData.end_date) payload.end_date = formData.end_date;
      if (formData.notes) payload.notes = formData.notes;

      if (formMode === "create") {
        await apiClient.post("/projects", payload);
        showToast({
          variant: "success",
          title: "Project Created",
          message: `Project "${formData.name}" has been created successfully with assigned PICs.`,
        });
      } else if (editingProjectId) {
        await apiClient.put(`/projects/${editingProjectId}`, payload);
        showToast({
          variant: "success",
          title: "Project Updated",
          message: `Project "${formData.name}" has been updated successfully.`,
        });
      }

      setIsFormModalOpen(false);
      fetchProjects();
    } catch (error: any) {
      const errMsg = error.response?.data?.message || `Failed to ${formMode} project.`;
      showToast({ variant: "error", title: "Action Failed", message: errMsg });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return;
    try {
      await apiClient.delete(`/projects/${projectToDelete.id}`);
      fetchProjects();
      showToast({
        variant: "success",
        title: "Project Deleted",
        message: `Project "${projectToDelete.name}" has been removed.`,
      });
    } catch (error: any) {
      const errMsg = error.response?.data?.message || "Failed to delete project.";
      showToast({
        variant: "error",
        title: "Delete Failed",
        message: errMsg,
      });
    } finally {
      setIsDeleteModalOpen(false);
      setProjectToDelete(null);
    }
  };

  const handleOpenBulkDelete = (ids: (string | number)[], clearFn: () => void) => {
    setSelectedIds(ids);
    setClearSelectionFn(() => clearFn);
    setIsBulkDeleteModalOpen(true);
  };

  const handleConfirmBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setBulkDeleting(true);
    try {
      await Promise.all(selectedIds.map((id) => apiClient.delete(`/projects/${id}`)));
      showToast({
        variant: "success",
        title: "Projects Deleted",
        message: `Successfully deleted ${selectedIds.length} project(s).`,
      });
      fetchProjects();
      if (clearSelectionFn) clearSelectionFn();
      setSelectedIds([]);
    } catch (error: any) {
      showToast({
        variant: "error",
        title: "Bulk Delete Failed",
        message: error.response?.data?.message || "Failed to delete selected projects.",
      });
    } finally {
      setBulkDeleting(false);
      setIsBulkDeleteModalOpen(false);
    }
  };

  const formatTitleCase = (str?: string): string => {
    if (!str) return "-";
    if (str.toUpperCase() === "QC_INTERNAL") return "QC Internal";
    return str
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const getPriorityBadgeColor = (prio: string): "error" | "warning" | "primary" | "light" => {
    switch (prio?.toUpperCase()) {
      case "URGENT":
        return "error";
      case "HIGH":
        return "warning";
      case "MID":
        return "primary";
      default:
        return "light";
    }
  };

  const getStatusBadgeColor = (status: string): "success" | "primary" | "warning" | "error" | "light" => {
    switch (status?.toUpperCase()) {
      case "DONE":
      case "APPROVED":
      case "PUBLISHED":
        return "success";
      case "CONTENT_PLANNING":
      case "SCRIPT_READY":
        return "primary";
      case "DESIGN":
      case "EDITING":
      case "QC_INTERNAL":
        return "warning";
      case "REVISION":
      case "OVERTIME":
        return "error";
      default:
        return "light";
    }
  };

  const filteredData = data.filter((item) => {
    let match = true;
    if (statusFilter && item.status !== statusFilter) match = false;
    if (priorityFilter && item.priority !== priorityFilter) match = false;
    return match;
  });

  // Filter users strictly by specific role keywords (excluding administrator)
  const checkUserHasRole = useCallback((user: UserOption, targetKeywords: string[]) => {
    if (!user.roles || user.roles.length === 0) return false;
    return user.roles.some((r) => {
      const roleName = (typeof r === "string" ? r : r.name)?.toLowerCase() || "";
      return targetKeywords.some((keyword) => roleName.includes(keyword.toLowerCase()));
    });
  }, []);

  const aeOptions = useMemo(() => {
    const filtered = usersList.filter((u) => checkUserHasRole(u, ["account executive", "ae"]));
    return [
      { value: "", label: "-- Unassigned PIC AE --" },
      ...filtered.map((u) => ({
        value: String(u.id),
        label: `${u.name}${u.roles?.length ? ` (${u.roles.map((r) => r.name).join(", ")})` : ""}`,
      })),
    ];
  }, [usersList, checkUserHasRole]);

  const smsOptions = useMemo(() => {
    const filtered = usersList.filter((u) => checkUserHasRole(u, ["social media", "sms"]));
    return [
      { value: "", label: "-- Unassigned PIC SMS --" },
      ...filtered.map((u) => ({
        value: String(u.id),
        label: `${u.name}${u.roles?.length ? ` (${u.roles.map((r) => r.name).join(", ")})` : ""}`,
      })),
    ];
  }, [usersList, checkUserHasRole]);

  const cdOptions = useMemo(() => {
    const filtered = usersList.filter((u) => checkUserHasRole(u, ["creative director", "cd"]));
    return [
      { value: "", label: "-- Unassigned PIC CD --" },
      ...filtered.map((u) => ({
        value: String(u.id),
        label: `${u.name}${u.roles?.length ? ` (${u.roles.map((r) => r.name).join(", ")})` : ""}`,
      })),
    ];
  }, [usersList, checkUserHasRole]);

  const columns: ColumnDef<Project>[] = [
    {
      header: "Project Code & Name",
      accessorKey: "name",
      cell: (item) => (
        <div className="flex flex-col">
          <span className="font-mono text-xs font-bold text-brand-600 dark:text-brand-400">
            {item.project_code || `PRJ-${item.id}`}
          </span>
          <Link
            href={`/projects/${item.id}`}
            className="font-semibold text-sm text-gray-800 dark:text-white/90 hover:text-brand-500 transition-colors"
          >
            {item.name}
          </Link>
        </div>
      ),
    },
    {
      header: "Client",
      accessorKey: "client" as any,
      cell: (item) => (
        <span className="text-theme-sm font-medium text-gray-700 dark:text-gray-300">
          {item.client?.name || "-"}
        </span>
      ),
    },
    {
      header: "Type",
      accessorKey: "project_type" as any,
      cell: (item) => (
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {item.project_type?.name || "SMM"}
        </span>
      ),
    },
    {
      header: "PIC (AE & SMS)",
      accessorKey: "ae" as any,
      cell: (item) => (
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {item.ae?.name && (
            <span className="rounded-md bg-amber-50 px-2 py-0.5 font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
              AE: {item.ae.name}
            </span>
          )}
          {item.sms?.name && (
            <span className="rounded-md bg-emerald-50 px-2 py-0.5 font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
              SMS: {item.sms.name}
            </span>
          )}
          {!item.ae?.name && !item.sms?.name && (
            <span className="text-gray-400 text-xs italic">Belum ada PIC</span>
          )}
        </div>
      ),
    },
    {
      header: "Priority",
      accessorKey: "priority",
      cell: (item) => (
        <Badge color={getPriorityBadgeColor(item.priority)} size="sm">
          {item.priority?.toLowerCase() === "mid" ? "Mid" : formatTitleCase(item.priority || "Mid")}
        </Badge>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (item) => (
        <Badge color={getStatusBadgeColor(item.status)} size="sm">
          {formatTitleCase(item.status || "Published")}
        </Badge>
      ),
    },
    {
      header: "Actions",
      accessorKey: "id",
      cell: (item) => (
        <div className="flex items-center gap-1.5">
          <Link
            href={`/projects/${item.id}`}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20 border border-blue-200 dark:border-blue-800/40 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Detail
          </Link>
          <button
            type="button"
            onClick={() => handleOpenEdit(item)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 dark:bg-white/[0.05] dark:text-gray-300 dark:hover:bg-white/[0.1] border border-gray-200 dark:border-gray-700 transition-colors cursor-pointer"
          >
            <svg className="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </button>
          <button
            type="button"
            onClick={() => {
              setProjectToDelete(item);
              setIsDeleteModalOpen(true);
            }}
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
    <ProtectedContent>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Projects Management
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Daftar seluruh campaign brand, jadwal pengerjaan, dan alokasi PIC tim
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
            Create Project
          </Button>
        </div>

        {/* Filters & Table Card Container */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
          <DataTable
            columns={columns}
            data={filteredData}
            loading={loading}
            enableSelection={true}
            headerActions={
              <div className="flex flex-wrap items-center gap-2">
                <div className="w-36 sm:w-40">
                  <Select
                    size="sm"
                    options={[
                      { value: "", label: "All Statuses" },
                      { value: "CONTENT_PLANNING", label: "Content Planning" },
                      { value: "SCRIPT_READY", label: "Script Ready" },
                      { value: "DESIGN", label: "Design" },
                      { value: "EDITING", label: "Editing" },
                      { value: "QC_INTERNAL", label: "QC Internal" },
                      { value: "CLIENT_REVIEW", label: "Client Review" },
                      { value: "REVISION", label: "Revision" },
                      { value: "APPROVED", label: "Approved" },
                      { value: "PUBLISHED", label: "Published" },
                      { value: "DONE", label: "Done / Completed" },
                    ]}
                    value={statusFilter}
                    onChange={(val) => setStatusFilter(val)}
                    placeholder="All Statuses"
                  />
                </div>

                <div className="w-32 sm:w-36">
                  <Select
                    size="sm"
                    options={[
                      { value: "", label: "All Priorities" },
                      { value: "LOW", label: "Low" },
                      { value: "MID", label: "Mid" },
                      { value: "HIGH", label: "High" },
                      { value: "URGENT", label: "Urgent" },
                    ]}
                    value={priorityFilter}
                    onChange={(val) => setPriorityFilter(val)}
                    placeholder="All Priorities"
                  />
                </div>
              </div>
            }
            bulkActions={(selectedIds, selectedRows, clearSelection) => (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-error-600 border-error-200 hover:bg-error-50 dark:border-error-800/40 dark:text-error-400 dark:hover:bg-error-950/30"
                  onClick={() => handleOpenBulkDelete(selectedIds, clearSelection)}
                >
                  Hapus Terpilih ({selectedIds.length})
                </Button>
              </div>
            )}
            searchPlaceholder="Search by name or project code..."
            emptyStateMessage="No projects found matching the criteria."
          />
        </div>

        {/* Create / Edit Project Modal with Full PIC Support */}
        <Modal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          title={formMode === "create" ? "Create New Project" : "Edit Project & PIC Assignments"}
          description={
            formMode === "create"
              ? "Set up campaign details, client information, and team assignments."
              : "Update project scope, schedules, and team assignments."
          }
          maxWidth="4xl"
        >
          <div className="space-y-3.5">
            {/* Row 1: Project Name, Client, Type & Priority */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-4">
                <Label className="mb-1 text-xs font-semibold text-gray-700 dark:text-gray-300">Project Name *</Label>
                <Input
                  type="text"
                  placeholder="e.g. Social Media Q3"
                  value={formData.name}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData((prev) => ({ ...prev, name: val }));
                  }}
                />
              </div>

              <div className="sm:col-span-3">
                <Label className="mb-1 text-xs font-semibold text-gray-700 dark:text-gray-300">Client *</Label>
                <Select
                  searchable={true}
                  searchPlaceholder="Cari client..."
                  options={clientsList.map((c) => ({ value: String(c.id), label: c.name }))}
                  value={formData.client_id}
                  onChange={(val) => setFormData((prev) => ({ ...prev, client_id: val }))}
                  placeholder="Select Client"
                />
              </div>

              <div className="sm:col-span-3">
                <Label className="mb-1 text-xs font-semibold text-gray-700 dark:text-gray-300">Project Type *</Label>
                <Select
                  options={typesList.map((t) => ({ value: String(t.id), label: t.name }))}
                  value={formData.project_type_id}
                  onChange={(val) => setFormData((prev) => ({ ...prev, project_type_id: val }))}
                  placeholder="Select Type"
                />
              </div>

              <div className="sm:col-span-2">
                <Label className="mb-1 text-xs font-semibold text-gray-700 dark:text-gray-300">Priority</Label>
                <Select
                  options={[
                    { value: "LOW", label: "Low" },
                    { value: "MID", label: "Mid" },
                    { value: "HIGH", label: "High" },
                    { value: "URGENT", label: "Urgent" },
                  ]}
                  value={formData.priority}
                  onChange={(val) => setFormData((prev) => ({ ...prev, priority: val }))}
                  placeholder="Priority"
                />
              </div>
            </div>

            {/* Row 2: PIC Team Assignments */}
            <div className="rounded-xl border border-gray-200/80 bg-gray-50/70 p-3 dark:border-gray-800 dark:bg-white/[0.02]">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 mb-2">
                <span className="flex items-center justify-center w-4 h-4 rounded-md bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </span>
                <span>PIC &amp; Team Assignments</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <Label className="mb-1 text-xs font-medium text-gray-600 dark:text-gray-400">Account Executive (AE)</Label>
                  <Select
                    options={aeOptions}
                    value={formData.ae_id}
                    onChange={(val) => setFormData((prev) => ({ ...prev, ae_id: val }))}
                    placeholder="Pilih PIC AE"
                  />
                </div>

                <div>
                  <Label className="mb-1 text-xs font-medium text-gray-600 dark:text-gray-400">Social Media (SMS)</Label>
                  <Select
                    options={smsOptions}
                    value={formData.sms_id}
                    onChange={(val) => setFormData((prev) => ({ ...prev, sms_id: val }))}
                    placeholder="Pilih PIC SMS"
                  />
                </div>

                <div>
                  <Label className="mb-1 text-xs font-medium text-gray-600 dark:text-gray-400">Creative Director (CD)</Label>
                  <Select
                    options={cdOptions}
                    value={formData.cd_id}
                    onChange={(val) => setFormData((prev) => ({ ...prev, cd_id: val }))}
                    placeholder="Pilih PIC CD"
                  />
                </div>
              </div>
            </div>

            {/* Row 3: Status, Start Date & End Date */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-4">
                <Label className="mb-1 text-xs font-semibold text-gray-700 dark:text-gray-300">Production Status</Label>
                <Select
                  options={[
                    { value: "CONTENT_PLANNING", label: "Content Planning" },
                    { value: "SCRIPT_READY", label: "Script Ready" },
                    { value: "DESIGN", label: "Design" },
                    { value: "EDITING", label: "Editing" },
                    { value: "QC_INTERNAL", label: "QC Internal" },
                    { value: "CLIENT_REVIEW", label: "Client Review" },
                    { value: "REVISION", label: "Revision" },
                    { value: "APPROVED", label: "Approved" },
                    { value: "PUBLISHED", label: "Published" },
                    { value: "DONE", label: "Done / Completed" },
                    { value: "HOLD", label: "On Hold" },
                  ]}
                  value={formData.status}
                  onChange={(val) => setFormData((prev) => ({ ...prev, status: val }))}
                  placeholder="Select Status"
                />
              </div>

              <div className="sm:col-span-4">
                <DatePicker
                  id="create_start_date"
                  label="Start Date"
                  placeholder="Pilih tanggal mulai"
                  value={formData.start_date}
                  onChange={(dateStr) => setFormData((prev) => ({ ...prev, start_date: dateStr }))}
                />
              </div>

              <div className="sm:col-span-4">
                <DatePicker
                  id="create_end_date"
                  label="Deadline (End Date)"
                  placeholder="Pilih tanggal deadline"
                  value={formData.end_date}
                  onChange={(dateStr) => setFormData((prev) => ({ ...prev, end_date: dateStr }))}
                />
              </div>
            </div>

            {/* Row 4: Notes / Scope Brief */}
            <div>
              <Label className="mb-1 text-xs font-semibold text-gray-700 dark:text-gray-300">Project Notes / Scope Brief</Label>
              <textarea
                rows={2}
                placeholder="Catatan ruang lingkup project, deliverables, atau instruksi khusus..."
                value={formData.notes}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData((prev) => ({ ...prev, notes: val }));
                }}
                className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-800 dark:bg-gray-900/60 dark:text-white transition-all shadow-theme-xs resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100 dark:border-gray-800">
              <Button variant="outline" onClick={() => setIsFormModalOpen(false)} disabled={saving} className="px-4 py-2 text-sm">
                Cancel
              </Button>
              <Button onClick={handleFormSubmit} disabled={saving} className="bg-brand-500 hover:bg-brand-600 text-white px-5 py-2 text-sm font-semibold shadow-sm">
                {saving ? (
                  <span className="flex items-center gap-1.5">
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Saving...
                  </span>
                ) : formMode === "create" ? (
                  "Create Project"
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Delete Single Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteConfirm}
          title="Delete Project"
          message={`Are you sure you want to delete "${projectToDelete?.name}"? This will archive the project and related data.`}
          confirmText="Delete"
          isDestructive={true}
        />

        {/* Bulk Delete Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={isBulkDeleteModalOpen}
          onClose={() => setIsBulkDeleteModalOpen(false)}
          onConfirm={handleConfirmBulkDelete}
          title="Hapus Multiple Project"
          message={`Apakah Anda yakin ingin menghapus ${selectedIds.length} project terpilih secara permanen?`}
          confirmText={bulkDeleting ? "Menghapus..." : "Hapus Semua"}
          cancelText="Batal"
          isDestructive={true}
        />
      </div>
    </ProtectedContent>
  );
}
