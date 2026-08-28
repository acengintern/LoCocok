"use client";

import React, { useState, useEffect } from "react";
import { apiClient } from "@/lib/api/client";
import Button from "@/components/ui/button/Button";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { Modal } from "@/components/ui/modal";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";

interface FilesTabProps {
  projectId: string;
}

interface FileType {
  id: number;
  name: string;
}

interface User {
  id: number;
  first_name: string;
  last_name: string;
}

interface FileVersion {
  id: number;
  file_id: number;
  version_number: number;
  file_path: string;
  uploaded_by?: User;
  created_at: string;
}

interface ProjectFile {
  id: number;
  project_id: number;
  name: string;
  file_type_id: number;
  file_type?: FileType;
  file_path?: string;
  uploaded_by?: User;
  current_version_id?: number;
  created_at: string;
  versions?: FileVersion[];
}

export default function FilesTab({ projectId }: FilesTabProps) {
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [fileTypes, setFileTypes] = useState<FileType[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  
  const [selectedFileObj, setSelectedFileObj] = useState<ProjectFile | null>(null);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [uploadData, setUploadData] = useState<{
    file: File | null;
    file_type_id: string;
  }>({
    file: null,
    file_type_id: "",
  });

  const [versionData, setVersionData] = useState<{
    file: File | null;
  }>({
    file: null,
  });

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/projects/${projectId}/files?include=fileType,uploadedBy,versions`);
      const raw = res?.data?.data;
      const list = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : Array.isArray(res?.data) ? res.data : [];
      setFiles(list);
    } catch (error) {
      console.error("Failed to fetch files", error);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFileTypes = async () => {
    try {
      const res = await apiClient.get('/master/file-types');
      const raw = res?.data?.data;
      const list = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : Array.isArray(res?.data) ? res.data : [];
      setFileTypes(list);
    } catch (error) {
      console.error("Failed to fetch file types", error);
      setFileTypes([]);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchFiles();
      fetchFileTypes();
    }
  }, [projectId]);

  const handleOpenUploadModal = () => {
    setUploadData({ file: null, file_type_id: fileTypes.length > 0 ? fileTypes[0].id.toString() : "" });
    setErrorMsg(null);
    setIsUploadModalOpen(true);
  };

  const handleOpenVersionModal = (file: ProjectFile) => {
    setSelectedFileObj(file);
    setVersionData({ file: null });
    setErrorMsg(null);
    setIsVersionModalOpen(true);
  };

  const handleOpenHistoryModal = (file: ProjectFile) => {
    setSelectedFileObj(file);
    setIsHistoryModalOpen(true);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadData.file) {
      setErrorMsg("Please select a file.");
      return;
    }
    
    setUploading(true);
    setErrorMsg(null);
    
    const formData = new FormData();
    formData.append("file", uploadData.file);
    if (uploadData.file_type_id) {
      formData.append("file_type_id", uploadData.file_type_id);
    }

    try {
      await apiClient.post(`/projects/${projectId}/files`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      fetchFiles();
      setIsUploadModalOpen(false);
    } catch (error: any) {
      console.error("Failed to upload file", error);
      setErrorMsg(error.response?.data?.message || "Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const handleVersionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!versionData.file || !selectedFileObj) {
      setErrorMsg("Please select a file.");
      return;
    }
    
    setUploading(true);
    setErrorMsg(null);
    
    const formData = new FormData();
    formData.append("file", versionData.file);

    try {
      await apiClient.post(`/files/${selectedFileObj.id}/versions`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      fetchFiles();
      setIsVersionModalOpen(false);
    } catch (error: any) {
      console.error("Failed to upload new version", error);
      setErrorMsg(error.response?.data?.message || "Failed to upload new version");
    } finally {
      setUploading(false);
    }
  };

  const getDownloadUrl = (filePath: string) => {
    if (filePath.startsWith('http')) return filePath;
    const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    return `${baseURL}/storage/${filePath}`;
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Files</h3>
        <Button onClick={handleOpenUploadModal}>Upload File</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-500"></div>
        </div>
      ) : (!Array.isArray(files) || files.length === 0) ? (
        <div className="text-center text-gray-500 py-4">No files uploaded yet.</div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50 dark:bg-white/[0.02]">
              <TableRow>
                <TableCell isHeader>Name</TableCell>
                <TableCell isHeader>Type</TableCell>
                <TableCell isHeader>Current Version</TableCell>
                <TableCell isHeader>Uploaded By</TableCell>
                <TableCell isHeader>Created At</TableCell>
                <TableCell isHeader>Actions</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(Array.isArray(files) ? files : []).map((file) => {
                const uploaderName = file.uploaded_by ? `${file.uploaded_by.first_name} ${file.uploaded_by.last_name || ''}` : "Unknown";
                const currentVersionNum = file.versions && file.versions.length > 0 
                  ? Math.max(...file.versions.map(v => v.version_number)) 
                  : 1;

                return (
                  <TableRow key={file.id} className="border-b border-gray-200 dark:border-white/[0.05]">
                    <TableCell>{file.name}</TableCell>
                    <TableCell>{file.file_type?.name || "-"}</TableCell>
                    <TableCell>v{currentVersionNum}</TableCell>
                    <TableCell>{uploaderName}</TableCell>
                    <TableCell>{new Date(file.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {file.file_path && (
                          <a href={getDownloadUrl(file.file_path)} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="sm">Download</Button>
                          </a>
                        )}
                        <Button variant="outline" size="sm" onClick={() => handleOpenVersionModal(file)}>New Version</Button>
                        <Button variant="outline" size="sm" onClick={() => handleOpenHistoryModal(file)}>History</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Upload File Modal */}
      <Modal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} className="max-w-md p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Upload File</h3>
        {errorMsg && (
          <div className="mb-4 p-3 text-sm text-error-700 bg-error-50 rounded-lg dark:bg-error-500/10 dark:text-error-400">
            {errorMsg}
          </div>
        )}
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <div>
            <Label>File Type</Label>
            <Select
              options={fileTypes.map(t => ({ value: t.id.toString(), label: t.name }))}
              value={uploadData.file_type_id}
              onChange={(val) => setUploadData({ ...uploadData, file_type_id: val })}
            />
          </div>
          <div>
            <Label>File</Label>
            <input
              type="file"
              className="mt-1 block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-medium
                file:bg-brand-50 file:text-brand-700
                hover:file:bg-brand-100
                dark:file:bg-white/[0.05] dark:file:text-white"
              onChange={(e) => setUploadData({ ...uploadData, file: e.target.files ? e.target.files[0] : null })}
              required
            />
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="outline" onClick={() => setIsUploadModalOpen(false)} disabled={uploading}>Cancel</Button>
            <Button type="submit" disabled={uploading}>{uploading ? "Uploading..." : "Upload"}</Button>
          </div>
        </form>
      </Modal>

      {/* Upload New Version Modal */}
      <Modal isOpen={isVersionModalOpen} onClose={() => setIsVersionModalOpen(false)} className="max-w-md p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Upload New Version</h3>
        {errorMsg && (
          <div className="mb-4 p-3 text-sm text-error-700 bg-error-50 rounded-lg dark:bg-error-500/10 dark:text-error-400">
            {errorMsg}
          </div>
        )}
        <p className="text-sm text-gray-500 mb-4">Uploading a new version for: <span className="font-medium text-gray-900 dark:text-white">{selectedFileObj?.name}</span></p>
        <form onSubmit={handleVersionSubmit} className="space-y-4">
          <div>
            <Label>File</Label>
            <input
              type="file"
              className="mt-1 block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-medium
                file:bg-brand-50 file:text-brand-700
                hover:file:bg-brand-100
                dark:file:bg-white/[0.05] dark:file:text-white"
              onChange={(e) => setVersionData({ file: e.target.files ? e.target.files[0] : null })}
              required
            />
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="outline" onClick={() => setIsVersionModalOpen(false)} disabled={uploading}>Cancel</Button>
            <Button type="submit" disabled={uploading}>{uploading ? "Uploading..." : "Upload Version"}</Button>
          </div>
        </form>
      </Modal>

      {/* Version History Modal */}
      <Modal isOpen={isHistoryModalOpen} onClose={() => setIsHistoryModalOpen(false)} className="max-w-2xl p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Version History</h3>
        <p className="text-sm text-gray-500 mb-4">History for: <span className="font-medium text-gray-900 dark:text-white">{selectedFileObj?.name}</span></p>
        
        {selectedFileObj?.versions && selectedFileObj.versions.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50 dark:bg-white/[0.02]">
                <TableRow>
                  <TableCell isHeader>Version</TableCell>
                  <TableCell isHeader>Uploaded By</TableCell>
                  <TableCell isHeader>Date</TableCell>
                  <TableCell isHeader>Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...selectedFileObj.versions].sort((a, b) => b.version_number - a.version_number).map((version) => {
                  const vUploaderName = version.uploaded_by ? `${version.uploaded_by.first_name} ${version.uploaded_by.last_name || ''}` : "Unknown";
                  return (
                    <TableRow key={version.id} className="border-b border-gray-200 dark:border-white/[0.05]">
                      <TableCell>v{version.version_number}</TableCell>
                      <TableCell>{vUploaderName}</TableCell>
                      <TableCell>{new Date(version.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {version.file_path && (
                          <a href={getDownloadUrl(version.file_path)} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="sm">Download</Button>
                          </a>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-4">No version history available.</div>
        )}
        
        <div className="flex justify-end gap-2 mt-6">
          <Button type="button" variant="outline" onClick={() => setIsHistoryModalOpen(false)}>Close</Button>
        </div>
      </Modal>
    </div>
  );
}
