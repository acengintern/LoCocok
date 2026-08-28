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

interface Script {
  id: number;
  project_id: number;
  project?: { id: number; name: string; client?: { name: string } };
  title: string;
  content_type?: string;
  hook?: string;
  concept?: string;
  script_text?: string;
  talent?: string;
  location?: string;
  cta?: string;
  notes?: string;
  reference?: string;
  status: string;
  created_by?: { name: string };
}

export default function ScriptPage() {
  const { showToast } = useToast();
  const [scripts, setScripts] = useState<Script[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectsList, setProjectsList] = useState<{ id: number; name: string }[]>([]);
  const [selectedScript, setSelectedScript] = useState<Script | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Create Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    project_id: "",
    title: "",
    content_type: "Reels / TikTok",
    hook: "",
    concept: "",
    script_text: "",
    talent: "",
    location: "Studio Loco Track",
    cta: "",
    status: "IDEATION",
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [sRes, pRes] = await Promise.all([
        apiClient.get("/scripts"),
        apiClient.get("/projects"),
      ]);

      const scriptData = sRes.data?.data?.data || sRes.data?.data || sRes.data || [];
      setScripts(Array.isArray(scriptData) ? scriptData : []);
      setProjectsList(pRes.data?.data || pRes.data || []);
    } catch (error) {
      console.error("Failed to load scripts", error);
      showToast({ variant: "error", title: "Error", message: "Gagal memuat daftar naskah / ideation." });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async () => {
    if (!formData.project_id || !formData.title.trim()) {
      showToast({ variant: "error", title: "Validation Error", message: "Project dan judul script wajib diisi." });
      return;
    }

    setSaving(true);
    try {
      await apiClient.post(`/projects/${formData.project_id}/scripts`, {
        title: formData.title.trim(),
        content_type: formData.content_type,
        hook: formData.hook || null,
        concept: formData.concept || null,
        script_text: formData.script_text || null,
        talent: formData.talent || null,
        location: formData.location || null,
        cta: formData.cta || null,
        status: formData.status || "IDEATION",
      });

      showToast({ variant: "success", title: "Script Created", message: "Naskah video / ideation berhasil disimpan." });
      setIsModalOpen(false);
      setFormData({
        project_id: "",
        title: "",
        content_type: "Reels / TikTok",
        hook: "",
        concept: "",
        script_text: "",
        talent: "",
        location: "Studio Loco Track",
        cta: "",
        status: "IDEATION",
      });
      fetchData();
    } catch (error: any) {
      console.error("Failed to save script", error);
      showToast({ variant: "error", title: "Error", message: error.response?.data?.message || "Gagal menyimpan naskah." });
    } finally {
      setSaving(false);
    }
  };

  const filteredScripts = scripts.filter((s) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        s.title?.toLowerCase().includes(q) ||
        s.hook?.toLowerCase().includes(q) ||
        s.script_text?.toLowerCase().includes(q) ||
        s.project?.name?.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Script & Creative Ideation" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Scriptwriting &amp; Creative Ideation
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Penyusunan naskah video TVC/Reels, hook 3 detik pertama, talent, storyboard direction, dan call-to-action
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Cari naskah / hook..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 px-3.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none"
          />
          <Button onClick={() => setIsModalOpen(true)} className="bg-brand-500 hover:bg-brand-600 text-white text-xs h-10">
            + New Video Script
          </Button>
        </div>
      </div>

      {/* Grid of Scripts */}
      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
        </div>
      ) : filteredScripts.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 text-gray-500">
          Belum ada script video yang tersimpan.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredScripts.map((script) => (
            <div
              key={script.id}
              onClick={() => setSelectedScript(script)}
              className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-brand-400 dark:hover:border-brand-500 transition-all cursor-pointer flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-brand-600 dark:text-brand-400">
                    {script.project?.name || "Project"}
                  </span>
                  <span className="text-[11px] bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 font-semibold px-2 py-0.5 rounded-md">
                    {script.content_type || "Video"}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-gray-900 dark:text-white leading-snug">
                  {script.title}
                </h3>

                {script.hook && (
                  <div className="text-xs bg-rose-50 dark:bg-rose-950/30 p-2.5 rounded-xl border border-rose-100 dark:border-rose-900/40">
                    <span className="font-bold text-rose-600 dark:text-rose-400 block mb-0.5">🎣 3-Sec Hook:</span>
                    <span className="text-gray-700 dark:text-gray-200 line-clamp-2">{script.hook}</span>
                  </div>
                )}

                {script.script_text && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-3 whitespace-pre-wrap">
                    {script.script_text}
                  </p>
                )}

                <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1">
                  <span>Talent: {script.talent || "N/A"}</span>
                  <span>Loc: {script.location || "Studio"}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-gray-400 pt-3 border-t border-gray-100 dark:border-gray-700">
                <span>By {script.created_by?.name || "Copywriter"}</span>
                <span className="font-bold text-brand-600">{script.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Script Detail Modal */}
      {selectedScript && (
        <Modal
          isOpen={!!selectedScript}
          onClose={() => setSelectedScript(null)}
          title={`Script Detail - ${selectedScript.title}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Project</Label>
                <div className="font-bold text-gray-900 dark:text-white">{selectedScript.project?.name}</div>
              </div>
              <div>
                <Label>Format</Label>
                <div className="font-semibold text-brand-600">{selectedScript.content_type}</div>
              </div>
            </div>

            {selectedScript.hook && (
              <div>
                <Label>Opening Hook (0-3 Sec)</Label>
                <div className="p-3 bg-rose-50 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200 rounded-xl font-medium">
                  {selectedScript.hook}
                </div>
              </div>
            )}

            {selectedScript.concept && (
              <div>
                <Label>Creative Concept &amp; Storyboard Note</Label>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-gray-700 dark:text-gray-300">
                  {selectedScript.concept}
                </div>
              </div>
            )}

            <div>
              <Label>Full Script Breakdown</Label>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed font-mono text-xs">
                {selectedScript.script_text || "Belum ada naskah."}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Talent</Label>
                <div>{selectedScript.talent || "N/A"}</div>
              </div>
              <div>
                <Label>Location</Label>
                <div>{selectedScript.location || "N/A"}</div>
              </div>
            </div>

            {selectedScript.cta && (
              <div>
                <Label>Call to Action (CTA)</Label>
                <div className="font-bold text-emerald-600 dark:text-emerald-400">{selectedScript.cta}</div>
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
          title="Tulis Naskah / Video Script Baru"
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
                <Label>Judul Script *</Label>
                <Input
                  type="text"
                  placeholder="e.g. TVC 30s - Kenikmatan Kopi Asli"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label>3-Second Visual Hook *</Label>
              <Input
                type="text"
                placeholder="e.g. Jangan buang ampas kopi kamu! Ini rahasianya..."
                value={formData.hook}
                onChange={(e) => setFormData((prev) => ({ ...prev, hook: e.target.value }))}
              />
            </div>

            <div>
              <Label>Konsep Visual / Storyboard</Label>
              <Input
                type="text"
                placeholder="e.g. Fast-paced camera transitions, mood vintage modern"
                value={formData.concept}
                onChange={(e) => setFormData((prev) => ({ ...prev, concept: e.target.value }))}
              />
            </div>

            <div>
              <Label>Isi Naskah / Audio &amp; Visual Breakdown *</Label>
              <textarea
                rows={5}
                placeholder={"Detik 0-3: Hook visual...\nDetik 3-15: Penjelasan produk...\nDetik 15-30: Call To Action..."}
                value={formData.script_text}
                onChange={(e) => setFormData((prev) => ({ ...prev, script_text: e.target.value }))}
                className="w-full text-xs p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Talent</Label>
                <Input
                  type="text"
                  placeholder="e.g. Jessica / Talent Pria 25th"
                  value={formData.talent}
                  onChange={(e) => setFormData((prev) => ({ ...prev, talent: e.target.value }))}
                />
              </div>

              <div>
                <Label>Lokasi Shooting</Label>
                <Input
                  type="text"
                  placeholder="e.g. Studio Loco Track 1"
                  value={formData.location}
                  onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label>Call to Action (CTA)</Label>
              <Input
                type="text"
                placeholder="e.g. Klik link di bio untuk klaim voucher!"
                value={formData.cta}
                onChange={(e) => setFormData((prev) => ({ ...prev, cta: e.target.value }))}
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
              <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                Batal
              </Button>
              <Button size="sm" onClick={handleSave} disabled={saving} className="bg-brand-500 hover:bg-brand-600 text-white">
                {saving ? "Menyimpan..." : "Simpan Script"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
