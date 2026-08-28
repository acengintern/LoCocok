"use client";

import React, { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api/client";
import Button from "@/components/ui/button/Button";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import StatusBadge from "@/components/common/StatusBadge";
import Modal from "@/components/common/Modal";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import { useToast } from "@/context/ToastContext";

interface Task {
  id: number;
  project_id: number;
  task_no: string;
  title: string;
  description?: string;
  due_date?: string;
  priority: string;
  status: string;
  project?: { id: number; name: string };
  assignments?: { user?: { id: number; name: string } }[];
  task_type?: { name: string };
  output_type?: { name: string };
}

const KANBAN_COLUMNS = [
  { id: "REQUEST", label: "Request", color: "border-blue-500 bg-blue-50/20 dark:bg-blue-950/10" },
  { id: "ON_PROGRESS", label: "On Progress", color: "border-amber-500 bg-amber-50/20 dark:bg-amber-950/10" },
  { id: "PREVIEW_CD", label: "Preview CD (QC)", color: "border-purple-500 bg-purple-50/20 dark:bg-purple-950/10" },
  { id: "PREVIEW_CLIENT", label: "Preview Client", color: "border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/10" },
  { id: "REVISION", label: "Revision", color: "border-rose-500 bg-rose-50/20 dark:bg-rose-950/10" },
  { id: "DONE", label: "Done", color: "border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/10" },
];

export default function ProductionBoardPage() {
  const { showToast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectFilter, setProjectFilter] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [projectsList, setProjectsList] = useState<{ id: number; name: string }[]>([]);
  const [usersList, setUsersList] = useState<{ id: number; name: string }[]>([]);

  // Selected Task Detail Modal
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const fetchBoardData = useCallback(async () => {
    setLoading(true);
    try {
      const [tRes, pRes, uRes] = await Promise.all([
        apiClient.get("/tasks?per_page=100"),
        apiClient.get("/projects"),
        apiClient.get("/users"),
      ]);

      const taskData = tRes.data?.data?.data || tRes.data?.data || tRes.data || [];
      const projData = pRes.data?.data || pRes.data || [];
      const userData = uRes.data?.data || uRes.data || [];

      setTasks(Array.isArray(taskData) ? taskData : []);
      setProjectsList(Array.isArray(projData) ? projData : []);
      setUsersList(Array.isArray(userData) ? userData : []);
    } catch (error) {
      console.error("Failed to load kanban data", error);
      showToast({ variant: "error", title: "Error", message: "Gagal memuat papan produksi." });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchBoardData();
  }, [fetchBoardData]);

  // Update Task Status
  const handleStatusChange = async (taskId: number, newStatus: string, projectId?: number) => {
    try {
      const pId = projectId || tasks.find((t) => t.id === taskId)?.project_id;
      if (!pId) return;

      await apiClient.put(`/projects/${pId}/tasks/${taskId}`, { status: newStatus });
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );
      if (selectedTask?.id === taskId) {
        setSelectedTask((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
      showToast({ variant: "success", title: "Status Updated", message: `Task dipindahkan ke ${newStatus}.` });
    } catch (error) {
      console.error("Failed to update status", error);
      showToast({ variant: "error", title: "Error", message: "Gagal memindahkan task." });
    }
  };

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    if (projectFilter && String(t.project_id) !== projectFilter) return false;
    if (priorityFilter && t.priority !== priorityFilter) return false;
    if (assigneeFilter) {
      const hasAssignee = t.assignments?.some((a) => a.user?.id === Number(assigneeFilter));
      if (!hasAssignee) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Production Kanban Board" />

      {/* Header & Filter Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Production Board
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Alur kerja visual alokasi produksi: Request &rarr; On Progress &rarr; QC &rarr; Client Review &rarr; Done
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Project Filter */}
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="h-10 px-3 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none"
          >
            <option value="">-- All Projects --</option>
            {projectsList.map((p) => (
              <option key={p.id} value={String(p.id)}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Assignee Filter */}
          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="h-10 px-3 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none"
          >
            <option value="">-- All Assignees --</option>
            {usersList.map((u) => (
              <option key={u.id} value={String(u.id)}>
                {u.name}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="h-10 px-3 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none"
          >
            <option value="">-- All Priority --</option>
            <option value="LOW">Low</option>
            <option value="MID">Mid</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>

          <Button onClick={fetchBoardData} variant="outline" className="h-10 text-xs">
            Refresh
          </Button>
        </div>
      </div>

      {/* Kanban Board Grid */}
      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 overflow-x-auto pb-4">
          {KANBAN_COLUMNS.map((col) => {
            // Match column ID with actual status values
            const colTasks = filteredTasks.filter((t) => {
              if (col.id === "DONE") return ["DONE", "APPROVED", "PUBLISH", "READY_TO_UPLOAD"].includes(t.status);
              return t.status === col.id;
            });

            return (
              <div
                key={col.id}
                className={`flex flex-col rounded-2xl border-t-4 border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/40 min-h-[500px] p-3 ${col.color}`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 mb-2 border-b border-gray-200/60 dark:border-gray-700">
                  <span className="font-bold text-xs uppercase tracking-wider text-gray-800 dark:text-gray-200">
                    {col.label}
                  </span>
                  <span className="w-6 h-6 rounded-full bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center justify-center font-bold text-xs shadow-2xs">
                    {colTasks.length}
                  </span>
                </div>

                {/* Cards List */}
                <div className="flex-1 space-y-3 overflow-y-auto max-h-[70vh]">
                  {colTasks.length === 0 ? (
                    <div className="p-4 text-center text-xs text-gray-400">Tidak ada task</div>
                  ) : (
                    colTasks.map((task) => {
                      const assignees = task.assignments?.map((a) => a.user?.name).filter(Boolean).join(", ") || "Unassigned";

                      return (
                        <div
                          key={task.id}
                          onClick={() => setSelectedTask(task)}
                          className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200/80 dark:border-gray-700 shadow-2xs hover:shadow-md hover:border-brand-400 dark:hover:border-brand-500 transition-all cursor-pointer space-y-2.5 group"
                        >
                          {/* Project Code & Priority */}
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[10px] font-bold text-brand-600 dark:text-brand-400">
                              {task.project?.name || task.task_no}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                task.priority === "URGENT" || task.priority === "HIGH"
                                  ? "bg-rose-100 dark:bg-rose-950/50 text-rose-600"
                                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                              }`}
                            >
                              {task.priority}
                            </span>
                          </div>

                          {/* Task Title */}
                          <h4 className="text-xs font-bold text-gray-900 dark:text-white line-clamp-2 leading-relaxed">
                            {task.title}
                          </h4>

                          {/* Assignee & Deadline */}
                          <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-700/60">
                            <span className="truncate max-w-[100px] font-medium">{assignees}</span>
                            <span className="text-[10px]">{task.due_date ? task.due_date.split("T")[0] : "-"}</span>
                          </div>

                          {/* Quick Action Status Select */}
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="pt-1 flex items-center justify-between"
                          >
                            <select
                              value={task.status}
                              onChange={(e) => handleStatusChange(task.id, e.target.value, task.project_id)}
                              className="text-[10px] bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded px-1.5 py-1 text-gray-700 dark:text-gray-300 w-full focus:outline-none"
                            >
                              <option value="REQUEST">Move: Request</option>
                              <option value="ON_PROGRESS">Move: On Progress</option>
                              <option value="PREVIEW_INTERNAL">Move: Preview Internal</option>
                              <option value="PREVIEW_CD">Move: Preview CD</option>
                              <option value="PREVIEW_CLIENT">Move: Preview Client</option>
                              <option value="REVISION">Move: Revision</option>
                              <option value="DONE">Move: Done</option>
                            </select>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Task Detail Modal */}
      {selectedTask && (
        <Modal
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          title={`Detail Task - ${selectedTask.task_no || selectedTask.title}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-sm">
            <div>
              <Label>Project</Label>
              <div className="font-bold text-gray-900 dark:text-white">
                {selectedTask.project?.name || "-"}
              </div>
            </div>

            <div>
              <Label>Judul Pekerjaan</Label>
              <div className="font-semibold text-gray-800 dark:text-gray-200">
                {selectedTask.title}
              </div>
            </div>

            {selectedTask.description && (
              <div>
                <Label>Deskripsi / Brief</Label>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {selectedTask.description}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Priority</Label>
                <div className="font-bold text-brand-600">{selectedTask.priority}</div>
              </div>
              <div>
                <Label>Due Date</Label>
                <div>{selectedTask.due_date ? selectedTask.due_date.split("T")[0] : "-"}</div>
              </div>
            </div>

            <div>
              <Label>Status Saat Ini</Label>
              <div className="mt-1">
                <StatusBadge status={selectedTask.status} />
              </div>
            </div>

            <div>
              <Label>Pindahkan Status Alur Kerja</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                {KANBAN_COLUMNS.map((col) => (
                  <Button
                    key={col.id}
                    size="sm"
                    variant={selectedTask.status === col.id ? "primary" : "outline"}
                    onClick={() => handleStatusChange(selectedTask.id, col.id, selectedTask.project_id)}
                    className="text-xs"
                  >
                    {col.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
