"use client";

import React, { useState } from "react";
import { apiClient } from "@/lib/api/client";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import Label from "@/components/form/Label";

interface ApprovalActionsProps {
  targetType: string;
  targetId: number;
  onActionComplete?: () => void;
}

export default function ApprovalActions({ targetType, targetId, onActionComplete }: ApprovalActionsProps) {
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [revisionNotes, setRevisionNotes] = useState("");
  const [approveNotes, setApproveNotes] = useState("");
  const [isApproving, setIsApproving] = useState(false);
  const [isRequestingRevision, setIsRequestingRevision] = useState(false);

  const handleApprove = async () => {
    try {
      setIsApproving(true);
      await apiClient.post(`/${targetType}/${targetId}/approvals`, { notes: approveNotes || undefined });
      if (onActionComplete) onActionComplete();
      setApproveNotes("");
    } catch (error) {
      console.error("Failed to approve", error);
    } finally {
      setIsApproving(false);
    }
  };

  const handleRequestRevisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revisionNotes.trim()) return;
    try {
      setIsRequestingRevision(true);
      await apiClient.post(`/${targetType}/${targetId}/revisions`, { notes: revisionNotes });
      setIsRevisionModalOpen(false);
      setRevisionNotes("");
      if (onActionComplete) onActionComplete();
    } catch (error) {
      console.error("Failed to request revision", error);
    } finally {
      setIsRequestingRevision(false);
    }
  };

  return (
    <div className="mt-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center p-4 border border-gray-200 dark:border-white/[0.05] rounded-lg bg-gray-50 dark:bg-white/[0.02]">
      <div className="flex-1 flex gap-2 w-full">
        <input
          type="text"
          placeholder="Optional approval notes..."
          className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-white/[0.1] bg-white dark:bg-white/[0.03] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          value={approveNotes}
          onChange={(e) => setApproveNotes(e.target.value)}
          disabled={isApproving}
        />
        <Button onClick={handleApprove} disabled={isApproving} className="bg-success-500 hover:bg-success-600 text-white border-success-500">
          {isApproving ? "Approving..." : "Approve"}
        </Button>
      </div>
      <div className="hidden sm:block text-gray-400">|</div>
      <Button variant="outline" onClick={() => setIsRevisionModalOpen(true)} className="w-full sm:w-auto text-warning-500 border-warning-500 hover:bg-warning-50">
        Request Revision
      </Button>

      <Modal isOpen={isRevisionModalOpen} onClose={() => setIsRevisionModalOpen(false)} className="max-w-md p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Request Revision</h3>
        <form onSubmit={handleRequestRevisionSubmit} className="space-y-4">
          <div>
            <Label>Revision Notes (Required)</Label>
            <textarea
              className="w-full mt-2 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-white/[0.1] bg-white dark:bg-white/[0.03] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[100px]"
              placeholder="Please explain what needs to be revised..."
              value={revisionNotes}
              onChange={(e) => setRevisionNotes(e.target.value)}
              required
              disabled={isRequestingRevision}
            />
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="outline" onClick={() => setIsRevisionModalOpen(false)} disabled={isRequestingRevision}>Cancel</Button>
            <Button type="submit" className="bg-warning-500 hover:bg-warning-600 text-white border-warning-500" disabled={isRequestingRevision || !revisionNotes.trim()}>
              {isRequestingRevision ? "Submitting..." : "Submit Revision"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
