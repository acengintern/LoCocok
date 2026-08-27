"use client";

import React, { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api/client";
import DataTable, { ColumnDef } from "@/components/common/DataTable";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Modal from "@/components/common/Modal";
import { useToast } from "@/context/ToastContext";
import Link from "next/link";
import Select from "@/components/form/Select";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ProtectedContent from "@/components/ProtectedContent";

interface User {
  id: number;
  name: string;
}

interface TaskAssignment {
  user_id: number;
  user?: User;
}

interface Project {
  id: number;
  name: string;
  project_code?: string;
}

interface Task {
  id: number;
  project_id: number;
  project?: Project;
  title: string;
  task_type?: string;
  status: string;
  due_date?: string;
  priority: string;
  assignments?: TaskAssignment[];
}

export default function GlobalTasksPage() {
  const { showToast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [projectsList, setProjectsList] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState("");

  // Create Task Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    project_id: "",
    task_type: "Graphic Design",
    priority: "MID",
    status: "TODO",
  });
  const [saving, setSaving] = useState(false);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("include", "project,assignments.user");
      if (statusFilter) params.append("status", statusFilter);
      if (priorityFilter) params.append("priority", priorityFilter);
      if (assigneeFilter) params.append("user_id", assigneeFilter);

      const res = await apiClient.get(`/tasks?${params.toString()}`);
      setTasks(res.data?.data || res.data || []);
    } catch (error) {
      console.error("Failed to fetch tasks", error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, priorityFilter, assigneeFilter]);

  const fetchUsersAndProjects = async () => {
    try {
      const [uRes, pRes] = await Promise.all([
        apiClient.get('/users'),
        apiClient.get('/projects'),
      ]);
      setUsers(uRes.data?.data || uRes.data || []);
      setProjectsList(pRes.data?.data || pRes.data || []);
    } catch (error) {
      console.error("Failed to fetch users or projects", error);
    }
  };

  useEffect(() => {
    fetchUsersAndProjects();
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleOpenCreate = () => {
    setFormData({
      title: "",
      project_id: projectsList[0]?.id ? String(projectsList[0].id) : "",
      task_type: "Graphic Design",
      priority: "MID",
      status: "TODO",
    });
    setIsCreateModalOpen(true);
  };

  const handleCreateSubmit = async () => {
    if (!formData.title.trim() || !formData.project_id) {
      showToast({
        variant: "error",
        title: "Validation Error",
        message: "Title and Project are required.",
      });
      return;
    }

    setSaving(true);
    try {
      await apiClient.post(`/projects/${formData.project_id}/tasks`, {
        title: formData.title,
        task_type: formData.task_type,
        priority: formData.priority,
        status: formData.status,
      });
      setIsCreateModalOpen(false);
      fetchTasks();
      showToast({
        variant: "success",
        title: "Task Created",
        message: `Task "${formData.title}" has been created successfully.`,
      });
    } catch (error: any) {
      const errMsg = error.response?.data?.message || "Failed to create task.";
      showToast({ variant: "error", title: "Creation Failed", message: errMsg });
    } finally {
      setSaving(false);
    }
  };

  const getPriorityColor = (priority: string): "error" | "warning" | "primary" | "light" => {
    switch (priority?.toUpperCase()) {
      case 'URGENT': return 'error';
      case 'HIGH': return 'warning';
      case 'MID':
      case 'MEDIUM': return 'primary';
      default: return 'light';
    }
  };

  const getStatusColor = (status: string): "success" | "warning" | "primary" | "error" | "light" => {
    switch (status?.toUpperCase()) {
      case 'DONE':
      case 'COMPLETED':
      case 'PUBLISHED': return 'success';
      case 'IN_PROGRESS':
      case 'EDITING':
      case 'DESIGN': return 'warning';
      case 'REVIEW':
      case 'QC_INTERNAL': return 'primary';
      case 'REVISION': return 'error';
      default: return 'light';
    }
  };

  const formatTitleCase = (str?: string): string => {
    if (!str) return "-";
    if (str.toUpperCase() === "QC_INTERNAL") return "QC Internal";
    if (str.toUpperCase() === "TODO") return "To Do";
    return str
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const columns: ColumnDef<Task>[] = [
    {
      header: "Task / Title",
      accessorKey: "title",
      cell: (task) => (
        <div className="flex flex-col">
          <span className="font-semibold text-sm text-gray-900 dark:text-white">
            {task.title}
          </span>
          <span className="text-xs text-gray-400">
            {task.project?.name ? `Project: ${task.project.name}` : `Project #${task.project_id}`}
          </span>
        </div>
      ),
    },
    {
      header: "Job Type",
      accessorKey: "task_type",
      cell: (task) => (
        <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
          {task.task_type || "General"}
        </span>
      ),
    },
    {
      header: "Assignees",
      accessorKey: "assignments" as any,
      cell: (task) => (
        <div className="flex flex-wrap gap-1">
          {task.assignments && task.assignments.length > 0 ? (
            task.assignments.map((a) => (
              <span
                key={a.user_id}
                className="rounded-md bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700 dark:bg-brand-500/10 dark:text-brand-400"
              >
                {a.user?.name || `User #${a.user_id}`}
              </span>
            ))
          ) : (
            <span className="text-gray-400 text-xs italic">Unassigned</span>
          )}
        </div>
      ),
    },
    {
      header: "Priority",
      accessorKey: "priority",
      cell: (task) => (
        <Badge size="sm" color={getPriorityColor(task.priority)}>
          {task.priority?.toLowerCase() === "mid" ? "Mid" : formatTitleCase(task.priority || "Mid")}
        </Badge>
      ),
    },
    {
      header: "Due Date",
      accessorKey: "due_date",
      cell: (task) => (
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {task.due_date ? new Date(task.due_date).toLocaleDateString("id-ID") : "-"}
        </span>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (task) => (
        <Badge size="sm" color={getStatusColor(task.status)}>
          {formatTitleCase(task.status || "To Do")}
        </Badge>
      ),
    },
    {
      header: "Actions",
      accessorKey: "id",
      cell: (task) => (
        <div className="flex items-center gap-1.5">
          <Link
            href={`/projects/${task.project_id}`}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20 border border-blue-200 dark:border-blue-800/40 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            View Project
          </Link>
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
              Production Tasks
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Global production task pipeline across all active client accounts
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
            Create Task
          </Button>
        </div>

        {/* Table Card Container */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
          <DataTable
            columns={columns}
            data={tasks}
            loading={loading}
            enableSelection={true}
            headerActions={
              <div className="flex flex-wrap items-center gap-2">
                <div className="w-36 sm:w-40">
                  <Select
                    size="sm"
                    options={[
                      { value: "", label: "All Statuses" },
                      { value: "TODO", label: "To Do" },
                      { value: "IN_PROGRESS", label: "In Progress" },
                      { value: "QC_INTERNAL", label: "QC Internal" },
                      { value: "REVISION", label: "Revision" },
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

                <div className="w-36 sm:w-40">
                  <Select
                    size="sm"
                    options={[
                      { value: "", label: "All Assignees" },
                      ...users.map((u) => ({ value: String(u.id), label: u.name })),
                    ]}
                    value={assigneeFilter}
                    onChange={(val) => setAssigneeFilter(val)}
                    placeholder="All Assignees"
                  />
                </div>
              </div>
            }
            searchPlaceholder="Search task title or project..."
            emptyStateMessage="No tasks found matching your filters."
          />
        </div>

      {/* Create Task Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Production Task"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div>
            <Label>Task Title *</Label>
            <Input
              type="text"
              placeholder="e.g. Design 3 Carousel Slides for Product Launch"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div>
            <Label>Project *</Label>
            <div className="relative">
              <select
                className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2.5 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                value={formData.project_id}
                onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
              >
                <option value="">Select Project</option>
                {projectsList.map((p) => (
                  <option key={p.id} value={p.id} className="dark:bg-gray-900">
                    {p.name} ({p.project_code || `PRJ-${p.id}`})
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                <svg className="stroke-current" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4.79175 7.39587L10.0001 12.6042L15.2084 7.39587" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            </div>
          </div>

          <div>
            <Label>Job / Task Type</Label>
            <div className="relative">
              <select
                className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2.5 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                value={formData.task_type}
                onChange={(e) => setFormData({ ...formData, task_type: e.target.value })}
              >
                <option value="Graphic Design" className="dark:bg-gray-900">Graphic Design</option>
                <option value="Video Editing / Motion" className="dark:bg-gray-900">Video Editing / Motion</option>
                <option value="Copywriting & Script" className="dark:bg-gray-900">Copywriting & Script</option>
                <option value="Shooting & Production" className="dark:bg-gray-900">Shooting & Production</option>
                <option value="QC & Review" className="dark:bg-gray-900">QC & Review</option>
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                <svg className="stroke-current" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4.79175 7.39587L10.0001 12.6042L15.2084 7.39587" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            </div>
          </div>

          <div>
            <Label>Priority</Label>
            <div className="relative">
              <select
                className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2.5 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="LOW" className="dark:bg-gray-900">Low</option>
                <option value="MID" className="dark:bg-gray-900">Mid</option>
                <option value="HIGH" className="dark:bg-gray-900">High</option>
                <option value="URGENT" className="dark:bg-gray-900">Urgent</option>
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                <svg className="stroke-current" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4.79175 7.39587L10.0001 12.6042L15.2084 7.39587" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleCreateSubmit} disabled={saving} className="bg-brand-500 hover:bg-brand-600 text-white">
              {saving ? "Saving..." : "Create Task"}
            </Button>
          </div>
          </div>
        </Modal>
      </div>
    </ProtectedContent>
  );
}
