"use client";

import React, { useState, useEffect } from "react";
import { apiClient } from "@/lib/api/client";
import Badge from "@/components/ui/badge/Badge";

interface ApprovalHistoryProps {
  targetType: string;
  targetId: number;
}

export default function ApprovalHistory({ targetType, targetId }: ApprovalHistoryProps) {
  const [approvals, setApprovals] = useState<any[]>([]);
  const [revisions, setRevisions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [approvalsRes, revisionsRes] = await Promise.all([
        apiClient.get(`/${targetType}/${targetId}/approvals`),
        apiClient.get(`/${targetType}/${targetId}/revisions`)
      ]);
      setApprovals(approvalsRes.data?.data || approvalsRes.data || []);
      setRevisions(revisionsRes.data?.data || revisionsRes.data || []);
    } catch (error) {
      console.error("Failed to fetch approval history", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (targetType && targetId) {
      fetchData();
    }
  }, [targetType, targetId]);

  if (loading) {
    return <div className="py-4 text-sm text-gray-500 text-center">Loading history...</div>;
  }

  const history = [
    ...approvals.map(a => ({ ...a, type: 'approval' })),
    ...revisions.map(r => ({ ...r, type: 'revision' }))
  ].sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());

  if (history.length === 0) {
    return <div className="py-4 text-sm text-gray-500 text-center">No approval history found.</div>;
  }

  return (
    <div className="mt-6 space-y-4">
      <h4 className="text-md font-semibold text-gray-900 dark:text-white">Approval History</h4>
      <div className="space-y-3">
        {history.map((item, index) => (
          <div key={`${item.type}-${item.id || index}`} className="flex flex-col p-4 border border-gray-200 dark:border-white/[0.05] rounded-lg bg-gray-50 dark:bg-white/[0.02]">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <Badge size="sm" color={item.type === 'approval' ? 'success' : 'warning'}>
                  {item.type === 'approval' ? 'Approved' : 'Revision Requested'}
                </Badge>
                {item.user && (
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    by {item.user.name || `User ${item.user.id}`}
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-500">
                {item.created_at ? new Date(item.created_at).toLocaleString() : 'Unknown date'}
              </span>
            </div>
            {item.notes && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.notes}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
