"use client";

import React, { useState, useEffect } from "react";
import { apiClient } from "@/lib/api/client";
import Button from "@/components/ui/button/Button";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { Contract } from "@/types/api";

interface ContractsTabProps {
  projectId: string;
}

export default function ContractsTab({ projectId }: ContractsTabProps) {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get(`/projects/${projectId}/contracts`);
        const raw = res?.data?.data;
        const list = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : Array.isArray(res?.data) ? res.data : [];
        setContracts(list);
      } catch (error) {
        console.error("Failed to fetch contracts", error);
        setContracts([]);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchContracts();
    }
  }, [projectId]);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Contracts</h3>
        <Button>Add Contract</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-500"></div>
        </div>
      ) : (!Array.isArray(contracts) || contracts.length === 0) ? (
        <div className="text-center text-gray-500 py-4">No contracts found.</div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50 dark:bg-white/[0.02]">
              <TableRow>
                <TableCell isHeader>Contract Number</TableCell>
                <TableCell isHeader>Start Date</TableCell>
                <TableCell isHeader>End Date</TableCell>
                <TableCell isHeader>Value</TableCell>
                <TableCell isHeader>Actions</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(Array.isArray(contracts) ? contracts : []).map((contract) => (
                <TableRow key={contract.id} className="border-b border-gray-200 dark:border-white/[0.05]">
                  <TableCell>{contract.contract_number}</TableCell>
                  <TableCell>{contract.start_date || "-"}</TableCell>
                  <TableCell>{contract.end_date || "-"}</TableCell>
                  <TableCell>
                    {contract.value !== undefined ? `$${Number(contract.value).toLocaleString()}` : "-"}
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">Edit</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
