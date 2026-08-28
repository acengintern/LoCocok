"use client";

import React, { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api/client";
import Button from "@/components/ui/button/Button";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import StatusBadge from "@/components/common/StatusBadge";
import Modal from "@/components/common/Modal";
import Label from "@/components/form/Label";
import { useToast } from "@/context/ToastContext";

interface ApprovalTask {
  id: number;
  project_id: number;
  task_no: string;
  title: string;
  description?: string;
  due_date?: string;
  priority: string;
  status: string;
  project?: { id: number; name: string; client?: { name: string } };
  assignments?: { user?: { id: number; name: string } }[];
  output_type?: { name: string };
}

export default function ApprovalQueuePage() {
  const { showToast } = useToast();
  const [tasks, setTasks] = useState<ApprovalTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<ApprovalTask | null>(null);
  const [revisionModalOpen, setRevisionModalOpen] = useState(false);
  const [revisionNotes, setRevisionNotes] = useState("");
  const [activeTab, setActiveTab] = useState<"CD_QC" | "CLIENT_REVIEW" | "REVISIONS">("CD_QC");

  const fetchQueue = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/tasks?per_page=100");
      const allTasks: ApprovalTask[] = res.data?.data?.data || res.data?.data || res.data || [];
      setTasks(allTasks);
    } catch (error) {
      console.error("Failed to load approval queue", error);
      showToast({ variant: "error", title: "Error", message: "Gagal memuat antrean approval." });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  // Actions
  const handleApprove = async (task: ApprovalTask, nextStatus: string) => {
    try {
      await apiClient.put(`/projects/${task.project_id}/tasks/${task.id}`, {
        status: nextStatus,
      });
      showToast({
        variant: "success",
        title: "Approval Success",
        message: `Task ${task.task_no} berhasil disetujui & dialihkan ke status ${nextStatus}.`,
      });
      fetchQueue();
    } catch (error) {
      console.error("Failed to approve", error);
      showToast({ variant: "error", title: "Error", message: "Gagal memproses approval." });
    }
  };

  const handleSendRevision = async () => {
    if (!selectedTask) return;
    if (!revisionNotes.trim()) {
      showToast({ variant: "error", title: "Validation Error", message: "Catatan revisi wajib diisi." });
      return;
    }

    try {
      await apiClient.put(`/projects/${selectedTask.project_id}/tasks/${selectedTask.id}`, {
        status: "REVISION",
        notes: revisionNotes,
      });

      showToast({
        variant: "info",
        title: "Revision Requested",
        message: `Task ${selectedTask.task_no} dikembalikan ke tim produksi untuk revisi.`,
      });
      setRevisionModalOpen(false);
      setRevisionNotes("");
      setSelectedTask(null);
      fetchQueue();
    } catch (error) {
      console.error("Failed to submit revision", error);
      showToast({ variant: "error", title: "Error", message: "Gagal mengirim catatan revisi." });
    }
  };

  // Filter lists based on tab
  const cdQcTasks = tasks.filter((t) => ["PREVIEW_INTERNAL", "PREVIEW_CD"].includes(t.status));
  const clientReviewTasks = tasks.filter((t) => ["PREVIEW_CLIENT", "ACC_CD"].includes(t.status));
  const revisionTasks = tasks.filter((t) => t.status === "REVISION");

  const currentList =
    activeTab === "CD_QC" ? cdQcTasks : activeTab === "CLIENT_REVIEW" ? clientReviewTasks : revisionTasks;

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Approval Queue & QC Internal" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Approval Queue &amp; QC Pipeline
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Verifikasi kualitas internal Creative Director &amp; persetujuan klien sebelum konten dipublikasikan
          </p>
        </div>

        <Button onClick={fetchQueue} variant="outline" className="h-10 text-xs">
          Refresh Queue
        </Button>
      </div>

      {/* Tab Selector */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
        <button
          onClick={() => setActiveTab("CD_QC")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeTab === "CD_QC"
              ? "bg-brand-500 text-white shadow-sm"
              : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50"
          }`}
        >
          <span>Creative Director QC</span>
          <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[11px]">{cdQcTasks.length}</span>
        </button>

        <button
          onClick={() => setActiveTab("CLIENT_REVIEW")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeTab === "CLIENT_REVIEW"
              ? "bg-brand-500 text-white shadow-sm"
              : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50"
          }`}
        >
          <span>Client Review Queue</span>
          <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[11px]">{clientReviewTasks.length}</span>
        </button>

        <button
          onClick={() => setActiveTab("REVISIONS")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeTab === "REVISIONS"
              ? "bg-brand-500 text-white shadow-sm"
              : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50"
          }`}
        >
          <span>Active Revisions</span>
          <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[11px]">{revisionTasks.length}</span>
        </button>
      </div>

      {/* List / Cards */}
      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
        </div>
      ) : currentList.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 text-gray-500 space-y-2">
          <div className="text-3xl">🎉</div>
          <h3 className="font-bold text-gray-900 dark:text-white">Tidak ada antrean approval pada tab ini</h3>
          <p className="text-xs">Semua deliverable telah diverifikasi atau belum siap untuk review.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentList.map((task) => {
            const assignees = task.assignments?.map((a) => a.user?.name).filter(Boolean).join(", ") || "Unassigned";

            return (
              <div
                key={task.id}
                className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-between space-y-4 hover:border-brand-400 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-brand-600 dark:text-brand-400">
                      {task.project?.name || task.task_no}
                    </span>
                    <StatusBadge status={task.status} />
                  </div>

                  <h3 className="font-bold text-base text-gray-900 dark:text-white leading-snug">
                    {task.title}
                  </h3>

                  {task.description && (
                    <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 bg-gray-50 dark:bg-gray-900/40 p-2.5 rounded-xl">
                      {task.description}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-gray-100 dark:border-gray-700 text-gray-500">
                    <div>
                      <span className="block text-[10px] text-gray-400">Assignee:</span>
                      <span className="font-semibold text-gray-800 dark:text-gray-200">{assignees}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-gray-400">Deadline:</span>
                      <span className="font-semibold text-gray-800 dark:text-gray-200">
                        {task.due_date ? task.due_date.split("T")[0] : "-"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                  {activeTab === "CD_QC" && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleApprove(task, "PREVIEW_CLIENT")}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                      >
                        ✓ ACC CD
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedTask(task);
                          setRevisionModalOpen(true);
                        }}
                        className="flex-1 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-xs font-bold border-rose-200"
                      >
                        Revisi ↺
                      </Button>
                    </>
                  )}

                  {activeTab === "CLIENT_REVIEW" && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleApprove(task, "READY_TO_UPLOAD")}
                        className="flex-1 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold"
                      >
                        ✓ Client Approved
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedTask(task);
                          setRevisionModalOpen(true);
                        }}
                        className="flex-1 text-rose-600 text-xs font-bold border-rose-200"
                      >
                        Revisi Klien
                      </Button>
                    </>
                  )}

                  {activeTab === "REVISIONS" && (
                    <Button
                      size="sm"
                      onClick={() => handleApprove(task, "ON_PROGRESS")}
                      className="w-full bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold"
                    >
                      Kembalikan ke Pengerjaan (On Progress)
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Revision Request Modal */}
      {revisionModalOpen && selectedTask && (
        <Modal
          isOpen={revisionModalOpen}
          onClose={() => setRevisionModalOpen(false)}
          title={`Catatan Revisi - ${selectedTask.title}`}
          maxWidth="md"
        >
          <div className="space-y-4">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Berikan catatan poin-poin yang perlu diperbaiki oleh tim produksi.
            </p>

            <div>
              <Label>Catatan Revisi *</Label>
              <textarea
                rows={4}
                value={revisionNotes}
                onChange={(e) => setRevisionNotes(e.target.value)}
                placeholder="Contoh: Ganti hook audio pada detik 0-3, warna text CTA kurang kontras..."
                className="w-full text-xs p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setRevisionModalOpen(false)}>
                Batal
              </Button>
              <Button size="sm" onClick={handleSendRevision} className="bg-rose-600 hover:bg-rose-700 text-white">
                Kirim Revisi ke Tim
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
