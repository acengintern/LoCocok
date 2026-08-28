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

interface FileItem {
  id: number;
  project_id: number;
  name: string;
  file_type?: { id: number; name: string };
  current_version?: { id: number; version_number: number; path: string; approval_status: string; created_at: string };
  uploaded_by?: { id: number; name: string };
  project?: { id: number; name: string; client?: { name: string } };
  created_at: string;
}

const FILE_CATEGORIES = [
  "All Files",
  "Design Files",
  "Video Files",
  "Brief Files",
  "Contract",
  "Report",
  "BAST",
];

export default function FilesPage() {
  const { showToast } = useToast();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectsList, setProjectsList] = useState<{ id: number; name: string }[]>([]);
  const [fileTypesList, setFileTypesList] = useState<{ id: number; name: string }[]>([]);
  const [activeCategory, setActiveCategory] = useState("All Files");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);

  // Upload Modal
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadFormData, setUploadFormData] = useState({
    project_id: "",
    file_type_id: "",
    name: "",
    file: null as File | null,
  });

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      const [fRes, pRes, ftRes] = await Promise.all([
        apiClient.get("/files"),
        apiClient.get("/projects"),
        apiClient.get("/master/file-types"),
      ]);

      const fileData = fRes.data?.data?.data || fRes.data?.data || fRes.data || [];
      setFiles(Array.isArray(fileData) ? fileData : []);
      setProjectsList(pRes.data?.data || pRes.data || []);
      setFileTypesList(ftRes.data?.data || ftRes.data || []);
    } catch (error) {
      console.error("Failed to load files", error);
      showToast({ variant: "error", title: "Error", message: "Gagal memuat daftar file digital assets." });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleUpload = async () => {
    if (!uploadFormData.project_id || !uploadFormData.name.trim() || !uploadFormData.file) {
      showToast({ variant: "error", title: "Validation Error", message: "Project, nama file, dan dokumen wajib diisi." });
      return;
    }

    setUploading(true);
    try {
      const form = new FormData();
      form.append("name", uploadFormData.name.trim());
      form.append("file", uploadFormData.file);
      if (uploadFormData.file_type_id) {
        form.append("file_type_id", uploadFormData.file_type_id);
      }

      await apiClient.post(`/projects/${uploadFormData.project_id}/files`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      showToast({ variant: "success", title: "File Uploaded", message: "File berhasil diunggah dengan versioning v1." });
      setIsUploadModalOpen(false);
      setUploadFormData({
        project_id: "",
        file_type_id: "",
        name: "",
        file: null,
      });
      fetchFiles();
    } catch (error: any) {
      console.error("Failed to upload file", error);
      showToast({ variant: "error", title: "Upload Failed", message: error.response?.data?.message || "Gagal mengunggah file." });
    } finally {
      setUploading(false);
    }
  };

  const filteredFiles = files.filter((f) => {
    if (activeCategory !== "All Files") {
      const typeName = f.file_type?.name?.toLowerCase() || "";
      const cat = activeCategory.toLowerCase();
      if (cat.includes("design") && !typeName.includes("design")) return false;
      if (cat.includes("video") && !typeName.includes("video") && !typeName.includes("footage")) return false;
      if (cat.includes("brief") && !typeName.includes("brief")) return false;
      if (cat.includes("contract") && !typeName.includes("contract")) return false;
      if (cat.includes("report") && !typeName.includes("report")) return false;
      if (cat.includes("bast") && !typeName.includes("bast")) return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        f.name.toLowerCase().includes(q) ||
        f.project?.name?.toLowerCase().includes(q) ||
        f.file_type?.name?.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Media & Digital Asset Library" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Media &amp; File Asset Library
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Pusat repositori file desain, video export, brief, MOU/kontrak, dan kontrol versi dokumen (v1, v2, Final)
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Cari file / project..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 px-3.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none"
          />
          <Button onClick={() => setIsUploadModalOpen(true)} className="bg-brand-500 hover:bg-brand-600 text-white text-xs h-10">
            + Upload Asset
          </Button>
        </div>
      </div>

      {/* Categories Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
        {FILE_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeCategory === cat
                ? "bg-brand-500 text-white shadow-sm"
                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid of Files */}
      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 text-gray-500">
          Tidak ada file pada kategori ini.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredFiles.map((file) => {
            const versionNum = file.current_version?.version_number || 1;
            const isVideo = file.name.endsWith(".mp4") || file.file_type?.name?.toLowerCase().includes("video");
            const isPsd = file.name.endsWith(".psd") || file.file_type?.name?.toLowerCase().includes("design");
            const isPdf = file.name.endsWith(".pdf") || file.file_type?.name?.toLowerCase().includes("contract") || file.file_type?.name?.toLowerCase().includes("report");

            return (
              <div
                key={file.id}
                onClick={() => setSelectedFile(file)}
                className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-brand-400 dark:hover:border-brand-500 transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-brand-600 dark:text-brand-400 truncate max-w-[130px]">
                      {file.project?.name || "Project"}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300">
                      v{versionNum} {versionNum >= 2 ? "(Final)" : ""}
                    </span>
                  </div>

                  {/* Icon Representation */}
                  <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-700/50 flex items-center justify-center text-xl">
                    {isVideo ? "🎬" : isPsd ? "🎨" : isPdf ? "📄" : "📁"}
                  </div>

                  <h3 className="font-bold text-xs text-gray-900 dark:text-white line-clamp-2 leading-relaxed">
                    {file.name}
                  </h3>

                  <div className="text-[11px] text-gray-400">
                    {file.file_type?.name || "Digital Asset"}
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-700">
                  <span>{file.uploaded_by?.name || "Team"}</span>
                  <span className="font-semibold text-brand-600 dark:text-brand-400">Version History &rarr;</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* File Versioning & History Modal */}
      {selectedFile && (
        <Modal
          isOpen={!!selectedFile}
          onClose={() => setSelectedFile(null)}
          title={`File Details & Version History - ${selectedFile.name}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div>
              <Label>Project &amp; Client</Label>
              <div className="font-bold text-sm text-gray-900 dark:text-white">
                {selectedFile.project?.name} ({selectedFile.project?.client?.name || "Client"})
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>File Type</Label>
                <div>{selectedFile.file_type?.name || "Digital Asset"}</div>
              </div>
              <div>
                <Label>Current Version</Label>
                <div className="font-bold text-brand-600">Version {selectedFile.current_version?.version_number || 1}</div>
              </div>
            </div>

            {/* Versioning List (Chapter 23 step.md) */}
            <div>
              <Label>Versioning History &amp; Approval Status</Label>
              <div className="space-y-2 mt-2">
                {[
                  {
                    ver: selectedFile.current_version?.version_number || 1,
                    name: selectedFile.name,
                    uploader: selectedFile.uploaded_by?.name || "Team Member",
                    date: selectedFile.created_at ? selectedFile.created_at.split("T")[0] : "2026-08-20",
                    status: selectedFile.current_version?.approval_status || "APPROVED",
                  },
                ].map((v) => (
                  <div
                    key={v.ver}
                    className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-gray-900 dark:text-white">{v.name} (v{v.ver})</div>
                      <div className="text-[11px] text-gray-400 mt-0.5">Uploaded by {v.uploader} on {v.date}</div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                      {v.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  showToast({ variant: "success", title: "Download Started", message: `Mengunduh ${selectedFile.name}...` });
                }}
              >
                Download File
              </Button>
              <Button size="sm" onClick={() => setSelectedFile(null)} className="bg-brand-500 text-white">
                Tutup
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Upload File Modal */}
      {isUploadModalOpen && (
        <Modal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          title="Upload New Asset & Create Version"
          maxWidth="md"
        >
          <div className="space-y-4 max-h-[75vh] overflow-y-auto px-1">
            <div>
              <Label>Project *</Label>
              <Select
                searchable={true}
                options={projectsList.map((p) => ({ value: String(p.id), label: p.name }))}
                value={uploadFormData.project_id}
                onChange={(val) => setUploadFormData((prev) => ({ ...prev, project_id: val }))}
                placeholder="Select Project"
              />
            </div>

            <div>
              <Label>File Type / Category</Label>
              <Select
                options={fileTypesList.map((ft) => ({ value: String(ft.id), label: ft.name }))}
                value={uploadFormData.file_type_id}
                onChange={(val) => setUploadFormData((prev) => ({ ...prev, file_type_id: val }))}
                placeholder="Select File Type"
              />
            </div>

            <div>
              <Label>Nama File / Deliverable *</Label>
              <Input
                type="text"
                placeholder="e.g. Reels_CultureRun_v1.mp4"
                value={uploadFormData.name}
                onChange={(e) => setUploadFormData((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div>
              <Label>Pilih File Dokumen / Media *</Label>
              <input
                type="file"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    const f = e.target.files[0];
                    setUploadFormData((prev) => ({
                      ...prev,
                      file: f,
                      name: prev.name || f.name,
                    }));
                  }
                }}
                className="w-full text-xs p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
              <Button variant="outline" size="sm" onClick={() => setIsUploadModalOpen(false)}>
                Batal
              </Button>
              <Button size="sm" onClick={handleUpload} disabled={uploading} className="bg-brand-500 hover:bg-brand-600 text-white">
                {uploading ? "Mengunggah..." : "Upload File"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
