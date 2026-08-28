"use client";

import React, { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api/client";
import Button from "@/components/ui/button/Button";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Modal from "@/components/common/Modal";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import { useToast } from "@/context/ToastContext";

interface Brief {
  id: number;
  project_id: number;
  project?: { id: number; name: string; client?: { name: string } };
  brief_text: string;
  objective?: string;
  platform?: string;
  content_requirement?: string;
  reference?: string;
  deadline?: string;
  created_by?: { name: string };
  created_at: string;
}

export default function BriefsPage() {
  const { showToast } = useToast();
  const [briefs, setBriefs] = useState<Brief[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectsList, setProjectsList] = useState<{ id: number; name: string }[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrief, setSelectedBrief] = useState<Brief | null>(null);

  // Create / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    project_id: "",
    objective: "",
    platform: "Instagram & TikTok",
    content_requirement: "",
    brief_text: "",
    reference: "",
    deadline: "",
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [bRes, pRes] = await Promise.all([
        apiClient.get("/briefs"),
        apiClient.get("/projects"),
      ]);

      const briefData = bRes.data?.data?.data || bRes.data?.data || bRes.data || [];
      setBriefs(Array.isArray(briefData) ? briefData : []);
      setProjectsList(pRes.data?.data || pRes.data || []);
    } catch (error) {
      console.error("Failed to fetch briefs", error);
      showToast({ variant: "error", title: "Error", message: "Gagal memuat daftar creative brief." });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async () => {
    if (!formData.project_id || !formData.brief_text.trim()) {
      showToast({ variant: "error", title: "Validation Error", message: "Project dan brief text wajib diisi." });
      return;
    }

    setSaving(true);
    try {
      await apiClient.post(`/projects/${formData.project_id}/briefs`, {
        brief_text: formData.brief_text.trim(),
        objective: formData.objective || null,
        platform: formData.platform || null,
        content_requirement: formData.content_requirement || null,
        reference: formData.reference || null,
        deadline: formData.deadline || null,
      });

      showToast({ variant: "success", title: "Brief Created", message: "Creative brief berhasil dibuat." });
      setIsModalOpen(false);
      setFormData({
        project_id: "",
        objective: "",
        platform: "Instagram & TikTok",
        content_requirement: "",
        brief_text: "",
        reference: "",
        deadline: "",
      });
      fetchData();
    } catch (error: any) {
      console.error("Failed to save brief", error);
      showToast({ variant: "error", title: "Error", message: error.response?.data?.message || "Gagal menyimpan brief." });
    } finally {
      setSaving(false);
    }
  };

  const filteredBriefs = briefs.filter((b) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        b.brief_text?.toLowerCase().includes(q) ||
        b.objective?.toLowerCase().includes(q) ||
        b.project?.name?.toLowerCase().includes(q) ||
        b.project?.client?.name?.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Briefs & Creative Direction" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Client Briefs &amp; Direction Repository
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Kumpulan dokumen brief kreatif, objective kampanye, dan guideline produksi klien
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Cari brief / project..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 px-3.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none"
          />
          <Button onClick={() => setIsModalOpen(true)} className="bg-brand-500 hover:bg-brand-600 text-white text-xs h-10">
            + New Creative Brief
          </Button>
        </div>
      </div>

      {/* Grid of Briefs */}
      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
        </div>
      ) : filteredBriefs.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 text-gray-500">
          Belum ada brief yang tersimpan.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBriefs.map((b) => (
            <div
              key={b.id}
              onClick={() => setSelectedBrief(b)}
              className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-brand-400 dark:hover:border-brand-500 transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-brand-600 dark:text-brand-400">
                    {b.project?.name || "Project"}
                  </span>
                  <span className="text-[11px] bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300 font-semibold px-2 py-0.5 rounded-md">
                    {b.platform || "Multi-platform"}
                  </span>
                </div>

                {b.objective && (
                  <h3 className="font-bold text-sm text-gray-900 dark:text-white leading-snug">
                    {b.objective}
                  </h3>
                )}

                <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-3 bg-gray-50 dark:bg-gray-900/40 p-3 rounded-xl">
                  {b.brief_text}
                </p>

                {b.content_requirement && (
                  <div className="text-[11px] text-gray-500 dark:text-gray-400">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">Deliverables:</span>{" "}
                    {b.content_requirement}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-[11px] text-gray-400 pt-3 border-t border-gray-100 dark:border-gray-700">
                <span>By {b.created_by?.name || "Team"}</span>
                <span>Deadline: {b.deadline ? b.deadline.split("T")[0] : "-"}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Brief Detail Modal */}
      {selectedBrief && (
        <Modal
          isOpen={!!selectedBrief}
          onClose={() => setSelectedBrief(null)}
          title={`Creative Brief - ${selectedBrief.project?.name || "Detail"}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <div>
              <Label>Project / Client</Label>
              <div className="font-bold text-sm text-gray-900 dark:text-white">
                {selectedBrief.project?.name} ({selectedBrief.project?.client?.name || "Client"})
              </div>
            </div>

            {selectedBrief.objective && (
              <div>
                <Label>Campaign Objective</Label>
                <div className="font-semibold text-gray-800 dark:text-gray-200">
                  {selectedBrief.objective}
                </div>
              </div>
            )}

            <div>
              <Label>Brief &amp; Brand Guidelines</Label>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                {selectedBrief.brief_text}
              </div>
            </div>

            {selectedBrief.content_requirement && (
              <div>
                <Label>Content Requirements / Deliverables</Label>
                <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 text-blue-900 dark:text-blue-200 rounded-xl">
                  {selectedBrief.content_requirement}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Platform Target</Label>
                <div>{selectedBrief.platform || "-"}</div>
              </div>
              <div>
                <Label>Production Deadline</Label>
                <div className="font-bold text-rose-500">{selectedBrief.deadline ? selectedBrief.deadline.split("T")[0] : "-"}</div>
              </div>
            </div>

            {selectedBrief.reference && (
              <div>
                <Label>Creative Reference</Label>
                <a
                  href={selectedBrief.reference}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-600 hover:underline break-all"
                >
                  {selectedBrief.reference}
                </a>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Create Brief Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Create New Creative Brief"
          maxWidth="lg"
        >
          <div className="space-y-4 max-h-[75vh] overflow-y-auto px-1">
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
              <Label>Campaign Objective</Label>
              <Input
                type="text"
                placeholder="e.g. Meningkatkan interaksi & reach audiens Gen Z sebesar 30%"
                value={formData.objective}
                onChange={(e) => setFormData((prev) => ({ ...prev, objective: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Platform</Label>
                <Input
                  type="text"
                  placeholder="e.g. Instagram & TikTok"
                  value={formData.platform}
                  onChange={(e) => setFormData((prev) => ({ ...prev, platform: e.target.value }))}
                />
              </div>

              <div>
                <Label>Production Deadline</Label>
                <Input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData((prev) => ({ ...prev, deadline: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label>Content Deliverables / Requirements</Label>
              <Input
                type="text"
                placeholder="e.g. 12 Feeds (Single & Carousel), 6 Reels 1080x1920, 20 Stories"
                value={formData.content_requirement}
                onChange={(e) => setFormData((prev) => ({ ...prev, content_requirement: e.target.value }))}
              />
            </div>

            <div>
              <Label>Brief Content &amp; Creative Direction *</Label>
              <textarea
                rows={4}
                placeholder="Detail arahan visual, key visual message, moodboard, tone & voice..."
                value={formData.brief_text}
                onChange={(e) => setFormData((prev) => ({ ...prev, brief_text: e.target.value }))}
                className="w-full text-xs p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <Label>Reference Link / Moodboard</Label>
              <Input
                type="text"
                placeholder="https://pinterest.com/... atau link Google Drive"
                value={formData.reference}
                onChange={(e) => setFormData((prev) => ({ ...prev, reference: e.target.value }))}
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
              <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                Batal
              </Button>
              <Button size="sm" onClick={handleSave} disabled={saving} className="bg-brand-500 hover:bg-brand-600 text-white">
                {saving ? "Menyimpan..." : "Simpan Brief"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
