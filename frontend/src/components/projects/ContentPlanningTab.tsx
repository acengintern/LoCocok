"use client";

import React, { useState, useEffect } from "react";
import { apiClient } from "@/lib/api/client";
import Button from "@/components/ui/button/Button";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { Modal } from "@/components/ui/modal";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";

interface ContentPlanningTabProps {
  projectId: string;
}

const statusOptions = [
  { value: "draft", label: "Draft" },
  { value: "in_review", label: "In Review" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

function BriefsList({ projectId }: { projectId: string }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  const [formData, setFormData] = useState({ title: "", workflow_status: "draft" });

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/projects/${projectId}/briefs`);
      const raw = res?.data?.data;
      const list = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : Array.isArray(res?.data) ? res.data : [];
      setItems(list);
    } catch (error) {
      console.error("Failed to fetch", error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, [projectId]);

  const handleOpenModal = (item?: any) => {
    if (item) {
      setSelectedItem(item);
      setFormData({ title: item.title || item.name || "", workflow_status: item.workflow_status || "draft" });
    } else {
      setSelectedItem(null);
      setFormData({ title: "", workflow_status: "draft" });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => { setIsModalOpen(false); setSelectedItem(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedItem) {
        await apiClient.put(`/projects/${projectId}/briefs/${selectedItem.id}`, formData);
      } else {
        await apiClient.post(`/projects/${projectId}/briefs`, formData);
      }
      fetchItems();
      handleCloseModal();
    } catch (error) { console.error("Failed to save", error); }
  };

  const handleDeleteClick = (item: any) => { setSelectedItem(item); setIsDeleteModalOpen(true); };

  const handleConfirmDelete = async () => {
    if (!selectedItem) return;
    try {
      await apiClient.delete(`/projects/${projectId}/briefs/${selectedItem.id}`);
      fetchItems();
      setIsDeleteModalOpen(false);
      setSelectedItem(null);
    } catch (error) { console.error("Failed to delete", error); }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Briefs</h3>
        <Button onClick={() => handleOpenModal()}>Add Brief</Button>
      </div>
      {loading ? (
        <div className="flex justify-center py-4"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-500"></div></div>
      ) : items.length === 0 ? (
        <div className="text-center text-gray-500 py-4">No briefs found.</div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50 dark:bg-white/[0.02]">
              <TableRow>
                <TableCell isHeader>Title</TableCell>
                <TableCell isHeader>Status</TableCell>
                <TableCell isHeader>Actions</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(Array.isArray(items) ? items : []).map((item) => (
                <TableRow key={item.id} className="border-b border-gray-200 dark:border-white/[0.05]">
                  <TableCell>{item.title || item.name || "-"}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {item.workflow_status || "-"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleOpenModal(item)}>Edit</Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteClick(item)} className="text-error-500 border-error-500 hover:bg-error-50">Delete</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} className="max-w-md p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{selectedItem ? "Edit Brief" : "Add Brief"}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
          </div>
          <div>
            <Label>Status</Label>
            <Select options={statusOptions} defaultValue={formData.workflow_status} onChange={(val) => setFormData({ ...formData, workflow_status: val })} />
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="outline" onClick={handleCloseModal}>Cancel</Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} className="max-w-md p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Confirm Delete</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Are you sure you want to delete this?</p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmDelete} className="bg-error-500 hover:bg-error-600 text-white">Delete</Button>
        </div>
      </Modal>
    </div>
  );
}

function ContentPlansList({ projectId }: { projectId: string }) {
  const [items, setItems] = useState<any[]>([]);
  const [outputTypes, setOutputTypes] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  const [formData, setFormData] = useState({ title: "", output_type_id: "", workflow_status: "draft" });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resItems, resTypes] = await Promise.all([
        apiClient.get(`/projects/${projectId}/content-plans?include=outputType`),
        apiClient.get('/master/output-types')
      ]);
      const rawItems = resItems?.data?.data;
      const itemsList = Array.isArray(rawItems?.data) ? rawItems.data : Array.isArray(rawItems) ? rawItems : Array.isArray(resItems?.data) ? resItems.data : [];
      setItems(itemsList);

      const rawTypes = resTypes?.data?.data;
      const typesList = Array.isArray(rawTypes?.data) ? rawTypes.data : Array.isArray(rawTypes) ? rawTypes : Array.isArray(resTypes?.data) ? resTypes.data : [];
      setOutputTypes(typesList);
    } catch (error) {
      console.error("Failed to fetch", error);
      setItems([]);
      setOutputTypes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [projectId]);

  const handleOpenModal = (item?: any) => {
    if (item) {
      setSelectedItem(item);
      setFormData({ 
        title: item.title || item.name || "", 
        output_type_id: item.output_type_id || "",
        workflow_status: item.workflow_status || "draft" 
      });
    } else {
      setSelectedItem(null);
      setFormData({ title: "", output_type_id: "", workflow_status: "draft" });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => { setIsModalOpen(false); setSelectedItem(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedItem) {
        await apiClient.put(`/projects/${projectId}/content-plans/${selectedItem.id}`, formData);
      } else {
        await apiClient.post(`/projects/${projectId}/content-plans`, formData);
      }
      fetchData();
      handleCloseModal();
    } catch (error) { console.error("Failed to save", error); }
  };

  const handleDeleteClick = (item: any) => { setSelectedItem(item); setIsDeleteModalOpen(true); };

  const handleConfirmDelete = async () => {
    if (!selectedItem) return;
    try {
      await apiClient.delete(`/projects/${projectId}/content-plans/${selectedItem.id}`);
      fetchData();
      setIsDeleteModalOpen(false);
      setSelectedItem(null);
    } catch (error) { console.error("Failed to delete", error); }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Content Plans</h3>
        <Button onClick={() => handleOpenModal()}>Add Plan</Button>
      </div>
      {loading ? (
        <div className="flex justify-center py-4"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-500"></div></div>
      ) : (!Array.isArray(items) || items.length === 0) ? (
        <div className="text-center text-gray-500 py-4">No content plans found.</div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50 dark:bg-white/[0.02]">
              <TableRow>
                <TableCell isHeader>Title</TableCell>
                <TableCell isHeader>Output Type</TableCell>
                <TableCell isHeader>Status</TableCell>
                <TableCell isHeader>Actions</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(Array.isArray(items) ? items : []).map((item) => (
                <TableRow key={item.id} className="border-b border-gray-200 dark:border-white/[0.05]">
                  <TableCell>{item.title || item.name || "-"}</TableCell>
                  <TableCell>{item.output_type?.name || "-"}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {item.workflow_status || "-"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleOpenModal(item)}>Edit</Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteClick(item)} className="text-error-500 border-error-500 hover:bg-error-50">Delete</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} className="max-w-md p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{selectedItem ? "Edit Content Plan" : "Add Content Plan"}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
          </div>
          <div>
            <Label>Output Type</Label>
            <Select options={(Array.isArray(outputTypes) ? outputTypes : []).map(t => ({ value: t.id, label: t.name }))} defaultValue={formData.output_type_id} onChange={(val) => setFormData({ ...formData, output_type_id: val })} />
          </div>
          <div>
            <Label>Status</Label>
            <Select options={statusOptions} defaultValue={formData.workflow_status} onChange={(val) => setFormData({ ...formData, workflow_status: val })} />
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="outline" onClick={handleCloseModal}>Cancel</Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} className="max-w-md p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Confirm Delete</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Are you sure you want to delete this?</p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmDelete} className="bg-error-500 hover:bg-error-600 text-white">Delete</Button>
        </div>
      </Modal>
    </div>
  );
}

function ScriptsList({ projectId }: { projectId: string }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  const [formData, setFormData] = useState({ title: "", workflow_status: "draft" });

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/projects/${projectId}/scripts`);
      const raw = res?.data?.data;
      const list = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : Array.isArray(res?.data) ? res.data : [];
      setItems(list);
    } catch (error) {
      console.error("Failed to fetch", error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, [projectId]);

  const handleOpenModal = (item?: any) => {
    if (item) {
      setSelectedItem(item);
      setFormData({ title: item.title || item.name || "", workflow_status: item.workflow_status || "draft" });
    } else {
      setSelectedItem(null);
      setFormData({ title: "", workflow_status: "draft" });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => { setIsModalOpen(false); setSelectedItem(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedItem) {
        await apiClient.put(`/projects/${projectId}/scripts/${selectedItem.id}`, formData);
      } else {
        await apiClient.post(`/projects/${projectId}/scripts`, formData);
      }
      fetchItems();
      handleCloseModal();
    } catch (error) { console.error("Failed to save", error); }
  };

  const handleDeleteClick = (item: any) => { setSelectedItem(item); setIsDeleteModalOpen(true); };

  const handleConfirmDelete = async () => {
    if (!selectedItem) return;
    try {
      await apiClient.delete(`/projects/${projectId}/scripts/${selectedItem.id}`);
      fetchItems();
      setIsDeleteModalOpen(false);
      setSelectedItem(null);
    } catch (error) { console.error("Failed to delete", error); }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Scripts</h3>
        <Button onClick={() => handleOpenModal()}>Add Script</Button>
      </div>
      {loading ? (
        <div className="flex justify-center py-4"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-500"></div></div>
      ) : (!Array.isArray(items) || items.length === 0) ? (
        <div className="text-center text-gray-500 py-4">No scripts found.</div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50 dark:bg-white/[0.02]">
              <TableRow>
                <TableCell isHeader>Title</TableCell>
                <TableCell isHeader>Status</TableCell>
                <TableCell isHeader>Actions</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(Array.isArray(items) ? items : []).map((item) => (
                <TableRow key={item.id} className="border-b border-gray-200 dark:border-white/[0.05]">
                  <TableCell>{item.title || item.name || "-"}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {item.workflow_status || "-"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleOpenModal(item)}>Edit</Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteClick(item)} className="text-error-500 border-error-500 hover:bg-error-50">Delete</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} className="max-w-md p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{selectedItem ? "Edit Script" : "Add Script"}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
          </div>
          <div>
            <Label>Status</Label>
            <Select options={statusOptions} defaultValue={formData.workflow_status} onChange={(val) => setFormData({ ...formData, workflow_status: val })} />
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="outline" onClick={handleCloseModal}>Cancel</Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} className="max-w-md p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Confirm Delete</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Are you sure you want to delete this?</p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmDelete} className="bg-error-500 hover:bg-error-600 text-white">Delete</Button>
        </div>
      </Modal>
    </div>
  );
}

export default function ContentPlanningTab({ projectId }: ContentPlanningTabProps) {
  const [activeTab, setActiveTab] = useState("briefs");
  const tabs = [
    { id: "briefs", label: "Briefs" },
    { id: "content-plans", label: "Content Plans" },
    { id: "scripts", label: "Scripts" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="border-b border-gray-200 dark:border-white/[0.05]">
        <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${
                activeTab === tab.id
                  ? "border-brand-500 text-brand-600 dark:text-brand-400"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="pt-4">
        {activeTab === "briefs" && <BriefsList projectId={projectId} />}
        {activeTab === "content-plans" && <ContentPlansList projectId={projectId} />}
        {activeTab === "scripts" && <ScriptsList projectId={projectId} />}
      </div>
    </div>
  );
}
