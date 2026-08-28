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

interface AdditionalLoad {
  id: number;
  date: string;
  project_id: number;
  project?: { id: number; name: string };
  ae?: { id: number; name: string };
  assigned_user?: { id: number; name: string };
  task_type?: { id: number; name: string };
  output_type?: { id: number; name: string };
  description: string;
  due_date: string;
  priority: string;
  status: string;
  notes?: string;
}

export default function AdditionalLoadPage() {
  const { showToast } = useToast();
  const [loads, setLoads] = useState<AdditionalLoad[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectsList, setProjectsList] = useState<{ id: number; name: string }[]>([]);
  const [usersList, setUsersList] = useState<{ id: number; name: string }[]>([]);
  const [taskTypesList, setTaskTypesList] = useState<{ id: number; name: string }[]>([]);
  const [outputTypesList, setOutputTypesList] = useState<{ id: number; name: string }[]>([]);

  // Create Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [clashWarning, setClashWarning] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    project_id: "",
    assigned_user_id: "",
    task_type_id: "",
    output_type_id: "",
    description: "",
    due_date: "",
    priority: "HIGH",
    status: "REQUEST",
    notes: "",
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [lRes, pRes, uRes, ttRes, otRes] = await Promise.all([
        apiClient.get("/additional-loads"),
        apiClient.get("/projects"),
        apiClient.get("/users"),
        apiClient.get("/master/task-types"),
        apiClient.get("/master/output-types"),
      ]);

      const loadData = lRes.data?.data?.data || lRes.data?.data || lRes.data || [];
      setLoads(Array.isArray(loadData) ? loadData : []);
      setProjectsList(pRes.data?.data || pRes.data || []);
      setUsersList(uRes.data?.data || uRes.data || []);
      setTaskTypesList(ttRes.data?.data || ttRes.data || []);
      setOutputTypesList(otRes.data?.data || otRes.data || []);
    } catch (error) {
      console.error("Failed to load additional loads", error);
      showToast({ variant: "error", title: "Error", message: "Gagal memuat data additional load." });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Check collision when assigned_user_id or date changes
  const checkClash = async (userId: string, date: string) => {
    if (!userId || !date) {
      setClashWarning(null);
      return;
    }

    try {
      const res = await apiClient.get(`/workload-check?user_id=${userId}&date=${date}`);
      const data = res.data?.data || res.data;
      if (data?.has_clash) {
        setClashWarning(data.message);
      } else {
        setClashWarning(null);
      }
    } catch (err) {
      console.error("Failed to check clash", err);
    }
  };

  const handleUserChange = (userId: string) => {
    setFormData((prev) => ({ ...prev, assigned_user_id: userId }));
    checkClash(userId, formData.date);
  };

  const handleDateChange = (date: string) => {
    setFormData((prev) => ({ ...prev, date }));
    checkClash(formData.assigned_user_id, date);
  };

  const handleSave = async () => {
    if (!formData.description.trim() || !formData.assigned_user_id) {
      showToast({ variant: "error", title: "Validation Error", message: "PIC dan deskripsi pekerjaan wajib diisi." });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        date: formData.date || null,
        project_id: formData.project_id ? Number(formData.project_id) : null,
        assigned_user_id: Number(formData.assigned_user_id),
        task_type_id: formData.task_type_id ? Number(formData.task_type_id) : null,
        output_type_id: formData.output_type_id ? Number(formData.output_type_id) : null,
        description: formData.description.trim(),
        due_date: formData.due_date || null,
        priority: formData.priority,
        status: formData.status,
        notes: formData.notes || null,
      };

      const res = await apiClient.post("/additional-loads", payload);
      const resData = res.data?.data || res.data;

      if (resData?.collision_warning) {
        showToast({
          variant: "warning",
          title: "Additional Load Saved with Warning",
          message: resData.collision_warning,
        });
      } else {
        showToast({
          variant: "success",
          title: "Additional Load Created",
          message: "Tugas tambahan berhasil dicatat.",
        });
      }

      setIsCreateModalOpen(false);
      setFormData({
        date: new Date().toISOString().split("T")[0],
        project_id: "",
        assigned_user_id: "",
        task_type_id: "",
        output_type_id: "",
        description: "",
        due_date: "",
        priority: "HIGH",
        status: "REQUEST",
        notes: "",
      });
      setClashWarning(null);
      fetchData();
    } catch (error: any) {
      console.error("Failed to save additional load", error);
      showToast({ variant: "error", title: "Error", message: error.response?.data?.message || "Gagal menyimpan data." });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus item additional load ini?")) return;
    try {
      await apiClient.delete(`/additional-loads/${id}`);
      showToast({ variant: "info", title: "Deleted", message: "Additional load berhasil dihapus." });
      fetchData();
    } catch (error) {
      showToast({ variant: "error", title: "Error", message: "Gagal menghapus item." });
    }
  };

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Additional Load & Out-of-Scope Tasks" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Additional Load Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Pencatatan tugas tambahan di luar kapasitas normal dengan deteksi bentrok beban kerja tim
          </p>
        </div>

        <Button onClick={() => setIsCreateModalOpen(true)} className="bg-brand-500 hover:bg-brand-600 text-white text-xs">
          + Add Additional Load
        </Button>
      </div>

      {/* Table / List */}
      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
        </div>
      ) : loads.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 text-gray-500">
          Belum ada additional load yang tercatat.
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-5 py-3.5">Tanggal</th>
                  <th className="px-5 py-3.5">Project</th>
                  <th className="px-5 py-3.5">Assigned PIC</th>
                  <th className="px-5 py-3.5">Deskripsi</th>
                  <th className="px-5 py-3.5">Priority</th>
                  <th className="px-5 py-3.5">Due Date</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {loads.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-700/30">
                    <td className="px-5 py-4 font-mono text-gray-500">{item.date ? item.date.split("T")[0] : "-"}</td>
                    <td className="px-5 py-4 font-bold text-gray-900 dark:text-white">{item.project?.name || "-"}</td>
                    <td className="px-5 py-4 font-semibold text-brand-600 dark:text-brand-400">
                      {item.assigned_user?.name || "-"}
                    </td>
                    <td className="px-5 py-4 max-w-xs">
                      <div className="font-medium text-gray-800 dark:text-gray-200 line-clamp-1">{item.description}</div>
                      {item.notes && <div className="text-[11px] text-gray-400 line-clamp-1 mt-0.5">{item.notes}</div>}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          item.priority === "URGENT" || item.priority === "HIGH"
                            ? "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400"
                            : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {item.priority}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-500">{item.due_date ? item.due_date.split("T")[0] : "-"}</td>
                    <td className="px-5 py-4">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-rose-500 hover:text-rose-700 font-semibold text-xs"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Modal with Clash Warning */}
      {isCreateModalOpen && (
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Tambah Additional Load (Tugas Ekstra)"
          maxWidth="lg"
        >
          <div className="space-y-4 max-h-[75vh] overflow-y-auto px-1">
            {/* Clash Alert if Triggered */}
            {clashWarning && (
              <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700/60 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
                <span className="text-base">⚠️</span>
                <div>
                  <span className="font-bold">Peringatan Bentrok Kapasitas:</span>
                  <p className="mt-0.5">{clashWarning}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Tanggal Penugasan *</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleDateChange(e.target.value)}
                />
              </div>

              <div>
                <Label>Assigned PIC (Pelaksana) *</Label>
                <Select
                  searchable={true}
                  options={usersList.map((u) => ({ value: String(u.id), label: u.name }))}
                  value={formData.assigned_user_id}
                  onChange={handleUserChange}
                  placeholder="Pilih Anggota Tim"
                />
              </div>
            </div>

            <div>
              <Label>Project Terkait</Label>
              <Select
                searchable={true}
                options={projectsList.map((p) => ({ value: String(p.id), label: p.name }))}
                value={formData.project_id}
                onChange={(val) => setFormData((prev) => ({ ...prev, project_id: val }))}
                placeholder="Pilih Project (Opsional)"
              />
            </div>

            <div>
              <Label>Deskripsi Pekerjaan Tambahan *</Label>
              <textarea
                rows={3}
                placeholder="Detail request dadakan / pekerjaan tambahan di luar scope..."
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                className="w-full text-xs p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label>Priority</Label>
                <Select
                  options={[
                    { value: "LOW", label: "Low" },
                    { value: "MID", label: "Mid" },
                    { value: "HIGH", label: "High" },
                    { value: "URGENT", label: "Urgent" },
                  ]}
                  value={formData.priority}
                  onChange={(val) => setFormData((prev) => ({ ...prev, priority: val }))}
                />
              </div>

              <div>
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData((prev) => ({ ...prev, due_date: e.target.value }))}
                />
              </div>

              <div>
                <Label>Status</Label>
                <Select
                  options={[
                    { value: "REQUEST", label: "Request" },
                    { value: "ON_PROGRESS", label: "On Progress" },
                    { value: "DONE", label: "Done" },
                  ]}
                  value={formData.status}
                  onChange={(val) => setFormData((prev) => ({ ...prev, status: val }))}
                />
              </div>
            </div>

            <div>
              <Label>Catatan Tambahan</Label>
              <Input
                type="text"
                placeholder="e.g. Request dari klien via WA pameran besok"
                value={formData.notes}
                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
              <Button variant="outline" size="sm" onClick={() => setIsCreateModalOpen(false)}>
                Batal
              </Button>
              <Button size="sm" onClick={handleSave} disabled={saving} className="bg-brand-500 hover:bg-brand-600 text-white">
                {saving ? "Menyimpan..." : "Simpan Additional Load"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
