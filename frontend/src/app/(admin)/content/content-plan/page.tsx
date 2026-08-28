"use client";

import React, { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api/client";
import Button from "@/components/ui/button/Button";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Modal from "@/components/common/Modal";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import StatusBadge from "@/components/common/StatusBadge";
import { useToast } from "@/context/ToastContext";

interface ContentPlan {
  id: number;
  project_id: number;
  project?: { id: number; name: string; client?: { name: string } };
  title: string;
  content_pillar?: string;
  content_type?: string;
  ideation?: string;
  caption?: string;
  platform?: string;
  posting_date?: string;
  reference?: string;
  notes?: string;
  status: string;
  output_type?: { name: string };
  created_by?: { name: string };
}

export default function ContentPlanPage() {
  const { showToast } = useToast();
  const [plans, setPlans] = useState<ContentPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectsList, setProjectsList] = useState<{ id: number; name: string }[]>([]);
  const [outputTypesList, setOutputTypesList] = useState<{ id: number; name: string }[]>([]);
  const [projectFilter, setProjectFilter] = useState("");
  const [platformFilter, setPlatformFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<ContentPlan | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    project_id: "",
    title: "",
    content_pillar: "Educational",
    content_type: "Carousel",
    output_type_id: "",
    ideation: "",
    caption: "",
    platform: "Instagram",
    posting_date: new Date().toISOString().split("T")[0],
    reference: "",
    notes: "",
    status: "DRAFT",
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [cpRes, pRes, otRes] = await Promise.all([
        apiClient.get("/content-plans"),
        apiClient.get("/projects"),
        apiClient.get("/master/output-types"),
      ]);

      const planData = cpRes.data?.data?.data || cpRes.data?.data || cpRes.data || [];
      setPlans(Array.isArray(planData) ? planData : []);
      setProjectsList(pRes.data?.data || pRes.data || []);
      setOutputTypesList(otRes.data?.data || otRes.data || []);
    } catch (error) {
      console.error("Failed to load content plans", error);
      showToast({ variant: "error", title: "Error", message: "Gagal memuat editorial calendar." });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async () => {
    if (!formData.project_id || !formData.title.trim()) {
      showToast({ variant: "error", title: "Validation Error", message: "Project dan judul konten wajib diisi." });
      return;
    }

    setSaving(true);
    try {
      await apiClient.post(`/projects/${formData.project_id}/content-plans`, {
        title: formData.title.trim(),
        content_pillar: formData.content_pillar,
        content_type: formData.content_type,
        output_type_id: formData.output_type_id ? Number(formData.output_type_id) : null,
        ideation: formData.ideation || null,
        caption: formData.caption || null,
        platform: formData.platform || "Instagram",
        posting_date: formData.posting_date || null,
        reference: formData.reference || null,
        notes: formData.notes || null,
        status: formData.status || "DRAFT",
      });

      showToast({ variant: "success", title: "Plan Created", message: "Content plan berhasil ditambahkan ke kalender." });
      setIsModalOpen(false);
      setFormData({
        project_id: "",
        title: "",
        content_pillar: "Educational",
        content_type: "Carousel",
        output_type_id: "",
        ideation: "",
        caption: "",
        platform: "Instagram",
        posting_date: new Date().toISOString().split("T")[0],
        reference: "",
        notes: "",
        status: "DRAFT",
      });
      fetchData();
    } catch (error: any) {
      console.error("Failed to save content plan", error);
      showToast({ variant: "error", title: "Error", message: error.response?.data?.message || "Gagal menyimpan content plan." });
    } finally {
      setSaving(false);
    }
  };

  const filteredPlans = plans.filter((p) => {
    if (projectFilter && String(p.project_id) !== projectFilter) return false;
    if (platformFilter && p.platform?.toLowerCase() !== platformFilter.toLowerCase()) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        p.title?.toLowerCase().includes(q) ||
        p.ideation?.toLowerCase().includes(q) ||
        p.caption?.toLowerCase().includes(q) ||
        p.content_pillar?.toLowerCase().includes(q) ||
        p.project?.name?.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Content Plans & Editorial Matrix" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Content Plans &amp; Editorial Matrix
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Matriks pilar konten, perumusan copy feed &amp; reels, jadwal tayang, serta status kurasi materi
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
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

          {/* Platform Filter */}
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="h-10 px-3 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none"
          >
            <option value="">-- All Platforms --</option>
            <option value="Instagram">Instagram</option>
            <option value="TikTok">TikTok</option>
            <option value="YouTube">YouTube</option>
          </select>

          <Button onClick={() => setIsModalOpen(true)} className="bg-brand-500 hover:bg-brand-600 text-white text-xs h-10">
            + New Content Plan
          </Button>
        </div>
      </div>

      {/* Grid of Content Plans */}
      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
        </div>
      ) : filteredPlans.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 text-gray-500">
          Belum ada content plan yang terdaftar.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlans.map((plan) => (
            <div
              key={plan.id}
              onClick={() => setSelectedPlan(plan)}
              className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-brand-400 dark:hover:border-brand-500 transition-all cursor-pointer flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-brand-600 dark:text-brand-400">
                    {plan.project?.name || "Project"}
                  </span>
                  <span className="text-[11px] bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 font-semibold px-2 py-0.5 rounded-md">
                    {plan.content_pillar || "Pillar"}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-gray-900 dark:text-white leading-snug">
                  {plan.title}
                </h3>

                {plan.ideation && (
                  <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 bg-gray-50 dark:bg-gray-900/40 p-2.5 rounded-xl font-medium">
                    💡 {plan.ideation}
                  </p>
                )}

                {plan.caption && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 italic">
                    &ldquo;{plan.caption}&rdquo;
                  </p>
                )}

                <div className="flex items-center gap-2 text-[11px]">
                  <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded font-medium text-gray-700 dark:text-gray-300">
                    {plan.content_type || "Post"}
                  </span>
                  <span className="bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded font-semibold text-blue-600 dark:text-blue-400">
                    {plan.platform || "Instagram"}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-gray-400 pt-3 border-t border-gray-100 dark:border-gray-700">
                <span>Post: {plan.posting_date ? plan.posting_date.split("T")[0] : "TBD"}</span>
                <span className="font-bold text-emerald-600">{plan.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedPlan && (
        <Modal
          isOpen={!!selectedPlan}
          onClose={() => setSelectedPlan(null)}
          title={`Content Plan - ${selectedPlan.title}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Project</Label>
                <div className="font-bold text-gray-900 dark:text-white">{selectedPlan.project?.name}</div>
              </div>
              <div>
                <Label>Posting Date</Label>
                <div className="font-bold text-brand-600">{selectedPlan.posting_date ? selectedPlan.posting_date.split("T")[0] : "-"}</div>
              </div>
            </div>

            <div>
              <Label>Ideation &amp; Concept</Label>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-gray-800 dark:text-gray-200">
                {selectedPlan.ideation || "-"}
              </div>
            </div>

            <div>
              <Label>Copywriting / Caption</Label>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                {selectedPlan.caption || "Belum ada copywriting."}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Pillar</Label>
                <div>{selectedPlan.content_pillar || "-"}</div>
              </div>
              <div>
                <Label>Type</Label>
                <div>{selectedPlan.content_type || "-"}</div>
              </div>
              <div>
                <Label>Platform</Label>
                <div>{selectedPlan.platform || "-"}</div>
              </div>
            </div>

            {selectedPlan.reference && (
              <div>
                <Label>Reference</Label>
                <a href={selectedPlan.reference} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline break-all">
                  {selectedPlan.reference}
                </a>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Create Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Tambah Content Plan Baru"
          maxWidth="lg"
        >
          <div className="space-y-4 max-h-[75vh] overflow-y-auto px-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Project *</Label>
                <Select
                  searchable={true}
                  options={projectsList.map((p) => ({ value: String(p.id), label: p.name }))}
                  value={formData.project_id}
                  onChange={(val) => setFormData((prev) => ({ ...prev, project_id: val }))}
                  placeholder="Select Project"
                />
              </div>

              <div>
                <Label>Judul Konten *</Label>
                <Input
                  type="text"
                  placeholder="e.g. 5 Tips Lari Pagi untuk Pemula"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label>Content Pillar</Label>
                <Select
                  options={[
                    { value: "Educational", label: "Educational" },
                    { value: "Promotional", label: "Promotional" },
                    { value: "Entertainment", label: "Entertainment" },
                    { value: "Behind The Scenes", label: "Behind The Scenes" },
                    { value: "Community / UGC", label: "Community / UGC" },
                  ]}
                  value={formData.content_pillar}
                  onChange={(val) => setFormData((prev) => ({ ...prev, content_pillar: val }))}
                />
              </div>

              <div>
                <Label>Content Type</Label>
                <Select
                  options={[
                    { value: "Single Post", label: "Single Post" },
                    { value: "Carousel", label: "Carousel" },
                    { value: "Reels", label: "Reels" },
                    { value: "Story IG", label: "Story IG" },
                    { value: "Video Iklan", label: "Video Iklan" },
                  ]}
                  value={formData.content_type}
                  onChange={(val) => setFormData((prev) => ({ ...prev, content_type: val }))}
                />
              </div>

              <div>
                <Label>Posting Date</Label>
                <Input
                  type="date"
                  value={formData.posting_date}
                  onChange={(e) => setFormData((prev) => ({ ...prev, posting_date: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label>Ideation &amp; Concept</Label>
              <Input
                type="text"
                placeholder="Garis besar ide visual dan alur pesan..."
                value={formData.ideation}
                onChange={(e) => setFormData((prev) => ({ ...prev, ideation: e.target.value }))}
              />
            </div>

            <div>
              <Label>Draft Copywriting / Caption</Label>
              <textarea
                rows={3}
                placeholder="Tulis draf caption, hook, CTA, dan hashtag..."
                value={formData.caption}
                onChange={(e) => setFormData((prev) => ({ ...prev, caption: e.target.value }))}
                className="w-full text-xs p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <Label>Reference Link</Label>
              <Input
                type="text"
                placeholder="https://pinterest.com/..."
                value={formData.reference}
                onChange={(e) => setFormData((prev) => ({ ...prev, reference: e.target.value }))}
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
              <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                Batal
              </Button>
              <Button size="sm" onClick={handleSave} disabled={saving} className="bg-brand-500 hover:bg-brand-600 text-white">
                {saving ? "Menyimpan..." : "Simpan Content Plan"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
