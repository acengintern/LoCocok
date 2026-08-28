"use client";

import React, { useState, useEffect } from "react";
import { apiClient } from "@/lib/api/client";
import Button from "@/components/ui/button/Button";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { Modal } from "@/components/ui/modal";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";

interface OutputsTabProps {
  projectId: string;
}

interface Output {
  id: string;
  output_type_id: string;
  output_type: {
    id: string;
    name: string;
    format: string;
  };
  target_quantity: number;
  actual_quantity: number;
}

export default function OutputsTab({ projectId }: OutputsTabProps) {
  const [outputs, setOutputs] = useState<Output[]>([]);
  const [outputTypes, setOutputTypes] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedOutput, setSelectedOutput] = useState<Output | null>(null);
  
  const [formData, setFormData] = useState({
    output_type_id: "",
    target_quantity: 0,
    actual_quantity: 0
  });

  const fetchOutputs = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/projects/${projectId}/outputs?include=outputType`);
      const raw = res?.data?.data;
      const list = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : Array.isArray(res?.data) ? res.data : [];
      setOutputs(list);
    } catch (error) {
      console.error("Failed to fetch outputs", error);
      setOutputs([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchOutputTypes = async () => {
    try {
      const res = await apiClient.get('/master/output-types');
      const raw = res?.data?.data;
      const list = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : Array.isArray(res?.data) ? res.data : [];
      setOutputTypes(list);
    } catch (error) {
      console.error("Failed to fetch output types", error);
      setOutputTypes([]);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchOutputs();
      fetchOutputTypes();
    }
  }, [projectId]);

  const handleOpenModal = (output?: Output) => {
    if (output) {
      setSelectedOutput(output);
      setFormData({
        output_type_id: output.output_type_id,
        target_quantity: output.target_quantity,
        actual_quantity: output.actual_quantity
      });
    } else {
      setSelectedOutput(null);
      setFormData({
        output_type_id: "",
        target_quantity: 0,
        actual_quantity: 0
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOutput(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedOutput) {
        await apiClient.put(`/projects/${projectId}/outputs/${selectedOutput.id}`, formData);
      } else {
        await apiClient.post(`/projects/${projectId}/outputs`, formData);
      }
      fetchOutputs();
      handleCloseModal();
    } catch (error) {
      console.error("Failed to save output", error);
    }
  };

  const handleDeleteClick = (output: Output) => {
    setSelectedOutput(output);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedOutput) return;
    try {
      await apiClient.delete(`/projects/${projectId}/outputs/${selectedOutput.id}`);
      fetchOutputs();
      setIsDeleteModalOpen(false);
      setSelectedOutput(null);
    } catch (error) {
      console.error("Failed to delete output", error);
    }
  };

  const calculateProgress = (actual: number, target: number) => {
    if (!target) return 0;
    return Math.min(Math.round((actual / target) * 100), 100);
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Outputs</h3>
        <Button onClick={() => handleOpenModal()}>Add Output</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-500"></div>
        </div>
      ) : (!Array.isArray(outputs) || outputs.length === 0) ? (
        <div className="text-center text-gray-500 py-4">No outputs found.</div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50 dark:bg-white/[0.02]">
              <TableRow>
                <TableCell isHeader>Output Type</TableCell>
                <TableCell isHeader>Target Quantity</TableCell>
                <TableCell isHeader>Actual Quantity</TableCell>
                <TableCell isHeader>Progress</TableCell>
                <TableCell isHeader>Actions</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(Array.isArray(outputs) ? outputs : []).map((output) => {
                const progress = calculateProgress(output.actual_quantity, output.target_quantity);
                return (
                  <TableRow key={output.id} className="border-b border-gray-200 dark:border-white/[0.05]">
                    <TableCell>{output.output_type?.name || "-"}</TableCell>
                    <TableCell>{output.target_quantity}</TableCell>
                    <TableCell>{output.actual_quantity}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 max-w-[100px]">
                          <div className="bg-brand-500 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                        </div>
                        <span className="text-xs text-gray-500">{progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleOpenModal(output)}>Edit</Button>
                        <Button variant="outline" size="sm" onClick={() => handleDeleteClick(output)} className="text-error-500 border-error-500 hover:bg-error-50">Delete</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} className="max-w-md p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          {selectedOutput ? "Edit Output" : "Add Output"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Output Type</Label>
            <Select
              options={outputTypes.map(t => ({ value: t.id, label: t.name }))}
              defaultValue={formData.output_type_id}
              onChange={(val) => setFormData({ ...formData, output_type_id: val })}
            />
          </div>
          <div>
            <Label>Target Quantity</Label>
            <Input
              type="number"
              value={formData.target_quantity}
              onChange={(e) => setFormData({ ...formData, target_quantity: Number(e.target.value) })}
              required
            />
          </div>
          <div>
            <Label>Actual Quantity</Label>
            <Input
              type="number"
              value={formData.actual_quantity}
              onChange={(e) => setFormData({ ...formData, actual_quantity: Number(e.target.value) })}
              required
            />
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="outline" onClick={handleCloseModal}>Cancel</Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} className="max-w-md p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Confirm Delete</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Are you sure you want to delete this output? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmDelete} className="bg-error-500 hover:bg-error-600 text-white">Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
