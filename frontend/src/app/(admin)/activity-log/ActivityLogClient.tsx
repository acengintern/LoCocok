"use client";

import React, { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api/client";
import DataTable, { ColumnDef } from "@/components/common/DataTable";
import Badge from "@/components/ui/badge/Badge";
import Select from "@/components/form/Select";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ProtectedContent from "@/components/ProtectedContent";

interface ActivityLog {
  id: number;
  log_name: string;
  description: string;
  subject_type?: string;
  event?: string;
  causer?: { id: number; name: string };
  created_at: string;
  properties?: any;
}

export default function ActivityLogClient() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventFilter, setEventFilter] = useState("");

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (eventFilter) params.append("event", eventFilter);

      const res = await apiClient.get(`/activity-logs?${params.toString()}`);
      const data = res.data?.data ?? res.data;
      if (Array.isArray(data)) {
        setLogs(data);
      } else {
        setLogs([]);
      }
    } catch (error) {
      console.error("Failed to fetch activity logs", error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [eventFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const getEventBadgeColor = (event?: string): "success" | "primary" | "warning" | "error" | "light" => {
    switch (event?.toLowerCase()) {
      case "created":
        return "success";
      case "updated":
        return "primary";
      case "deleted":
        return "error";
      default:
        return "light";
    }
  };

  const columns: ColumnDef<ActivityLog>[] = [
    {
      header: "Timestamp",
      accessorKey: "created_at",
      cell: (row) => (
        <span className="font-mono text-xs text-gray-500 dark:text-gray-400">
          {new Date(row.created_at).toLocaleString("id-ID", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </span>
      ),
    },
    {
      header: "Actor (User)",
      accessorKey: "causer" as any,
      cell: (row) => (
        <span className="font-semibold text-xs text-gray-900 dark:text-white">
          {row.causer?.name || "System Automated"}
        </span>
      ),
    },
    {
      header: "Event",
      accessorKey: "event",
      cell: (row) => (
        <Badge size="sm" color={getEventBadgeColor(row.event)}>
          {row.event ? row.event.charAt(0).toUpperCase() + row.event.slice(1).toLowerCase() : "Action"}
        </Badge>
      ),
    },
    {
      header: "Activity Description",
      accessorKey: "description",
      cell: (row) => (
        <span className="text-xs text-gray-700 dark:text-gray-300 max-w-lg truncate">
          {row.description || `Performed action on ${row.log_name || "resource"}`}
        </span>
      ),
    },
    {
      header: "Target Entity",
      accessorKey: "subject_type",
      cell: (row) => (
        <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
          {row.subject_type ? row.subject_type.split("\\").pop() : row.log_name || "system"}
        </span>
      ),
    },
  ];

  return (
    <ProtectedContent>
      <PageBreadcrumb pageTitle="Activity Audit Log" />

      {/* Main Card Container */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Activity Audit Log
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Immutable audit trail of all security, master data, and operational events
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-brand-50 px-3.5 py-2 text-xs font-semibold text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
            Audit Security Baseline Active
          </span>
        </div>

        {/* Quick Filter */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-48">
            <Select
              value={eventFilter}
              onChange={(val) => setEventFilter(val)}
              options={[
                { value: "", label: "All Events" },
                { value: "created", label: "Created" },
                { value: "updated", label: "Updated" },
                { value: "deleted", label: "Deleted" },
              ]}
              className="h-10 text-xs"
            />
          </div>
        </div>

        <DataTable
          columns={columns}
          data={logs}
          loading={loading}
          enableSelection={true}
          searchPlaceholder="Search audit events..."
          emptyStateMessage="No audit logs recorded yet."
        />
      </div>
    </ProtectedContent>
  );
}
