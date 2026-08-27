"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import DataTable, { ColumnDef } from "@/components/common/DataTable";
import Badge from "@/components/ui/badge/Badge";
import { apiClient } from "@/lib/api/client";
import { useAuth } from "@/hooks/useAuth";
import Select from "@/components/form/Select";
import Link from "next/link";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ProtectedContent from "@/components/ProtectedContent";

interface Project {
  id: number;
  project_code: string;
  name: string;
  client?: { id: number; name: string };
  project_type?: { id: number; name: string };
  ae?: { id: number; name: string };
  sms?: { id: number; name: string };
  cd?: { id: number; name: string };
  priority: string;
  status: string;
  start_date?: string;
  end_date?: string;
}

export default function MyProjectsPage() {
  const { user } = useAuth();
  const [data, setData] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/projects?include=client,projectType,ae,sms,cd");
      const responseData = res.data?.data ?? res.data;
      if (Array.isArray(responseData)) {
        setData(responseData);
      } else {
        setData([]);
      }
    } catch (error) {
      console.error("Failed to fetch my projects", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Filter only projects where current user is assigned as AE, SMS, or CD
  const myProjects = useMemo(() => {
    if (!user) return [];
    return data.filter((p) => {
      const isAE = p.ae?.id === user.id;
      const isSMS = p.sms?.id === user.id;
      const isCD = p.cd?.id === user.id;
      // If admin, show all or assigned
      return isAE || isSMS || isCD || user.roles?.some((r: any) => (typeof r === "string" ? r : r.name) === "System Administrator");
    });
  }, [data, user]);

  const filteredData = useMemo(() => {
    return myProjects.filter((item) => {
      const matchStatus = statusFilter ? item.status === statusFilter : true;
      const matchPriority = priorityFilter ? item.priority?.toUpperCase() === priorityFilter.toUpperCase() : true;
      return matchStatus && matchPriority;
    });
  }, [myProjects, statusFilter, priorityFilter]);

  const getPriorityBadgeColor = (prio: string): "error" | "warning" | "primary" | "light" => {
    switch (prio?.toUpperCase()) {
      case "URGENT":
        return "error";
      case "HIGH":
        return "warning";
      case "MID":
        return "primary";
      default:
        return "light";
    }
  };

  const getStatusBadgeColor = (status: string): "success" | "primary" | "warning" | "error" | "light" => {
    switch (status?.toUpperCase()) {
      case "DONE":
      case "APPROVED":
      case "PUBLISHED":
        return "success";
      case "CONTENT_PLANNING":
      case "SCRIPT_READY":
        return "primary";
      case "DESIGN":
      case "EDITING":
      case "QC_INTERNAL":
        return "warning";
      case "REVISION":
      case "OVERTIME":
        return "error";
      default:
        return "light";
    }
  };

  const formatTitleCase = (str?: string): string => {
    if (!str) return "-";
    if (str.toUpperCase() === "QC_INTERNAL") return "QC Internal";
    return str
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const columns: ColumnDef<Project>[] = [
    {
      header: "Project Code & Name",
      accessorKey: "name",
      cell: (row) => (
        <div className="flex flex-col">
          <span className="font-mono text-xs font-bold text-brand-600 dark:text-brand-400">
            {row.project_code || `PRJ-${row.id}`}
          </span>
          <Link
            href={`/projects/${row.id}`}
            className="font-semibold text-sm text-gray-800 dark:text-white/90 hover:text-brand-500 transition-colors"
          >
            {row.name}
          </Link>
          <span className="text-[11px] text-gray-400 mt-0.5">
            {row.project_type?.name || "General Campaign"}
          </span>
        </div>
      ),
    },
    {
      header: "Client",
      accessorKey: "client.name",
      cell: (row) => (
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {row.client?.name || "-"}
        </span>
      ),
    },
    {
      header: "My Role / Lead",
      accessorKey: "ae.name",
      cell: (row) => (
        <div className="text-xs space-y-1">
          <div className="flex flex-wrap gap-1">
            {row.ae?.id === user?.id && (
              <span className="inline-block rounded bg-amber-50 px-1.5 py-0.5 font-mono text-[10px] font-bold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                AE
              </span>
            )}
            {row.sms?.id === user?.id && (
              <span className="inline-block rounded bg-emerald-50 px-1.5 py-0.5 font-mono text-[10px] font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                SMS
              </span>
            )}
            {row.cd?.id === user?.id && (
              <span className="inline-block rounded bg-purple-50 px-1.5 py-0.5 font-mono text-[10px] font-bold text-purple-700 dark:bg-purple-500/10 dark:text-purple-300">
                CD
              </span>
            )}
          </div>
          <div className="text-gray-500 dark:text-gray-400">
            AE: <span className="text-gray-700 dark:text-gray-300 font-medium">{row.ae?.name || "-"}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Priority",
      accessorKey: "priority",
      cell: (row) => (
        <Badge size="sm" color={getPriorityBadgeColor(row.priority)}>
          {row.priority}
        </Badge>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (row) => (
        <Badge size="sm" color={getStatusBadgeColor(row.status)}>
          {formatTitleCase(row.status)}
        </Badge>
      ),
    },
    {
      header: "Actions",
      accessorKey: "id",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Link
            href={`/projects/${row.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-brand-50 text-brand-600 hover:bg-brand-100 hover:text-brand-700 dark:bg-brand-500/10 dark:text-brand-400 dark:hover:bg-brand-500/20 border border-brand-200/80 dark:border-brand-500/20 shadow-theme-xs transition-all duration-150 group"
          >
            <svg className="w-3.5 h-3.5 text-brand-500 dark:text-brand-400 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>Detail</span>
          </Link>
        </div>
      ),
    },
  ];

  return (
    <ProtectedContent>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              My Projects
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Daftar seluruh project yang ditugaskan kepada Anda (AE, SMS, atau CD)
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/projects/calendar"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700/60 dark:hover:text-white shadow-theme-xs transition-all cursor-pointer"
            >
              <svg className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Project Calendar</span>
            </Link>
            <Link
              href="/projects"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-brand-500 px-3.5 text-xs font-semibold text-white hover:bg-brand-600 shadow-theme-xs shadow-brand-500/20 transition-all cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <span>All Projects</span>
            </Link>
          </div>
        </div>

        {/* Table Card Container */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
        <DataTable
          columns={columns}
          data={filteredData}
          loading={loading}
          enableSelection={false}
          headerActions={
            <div className="flex flex-wrap items-center gap-2">
              <div className="w-36 sm:w-40">
                <Select
                  size="sm"
                  options={[
                    { value: "", label: "All Statuses" },
                    { value: "CONTENT_PLANNING", label: "Content Planning" },
                    { value: "SCRIPT_READY", label: "Script Ready" },
                    { value: "DESIGN", label: "Design" },
                    { value: "EDITING", label: "Editing" },
                    { value: "QC_INTERNAL", label: "QC Internal" },
                    { value: "REVISION", label: "Revision" },
                    { value: "PUBLISHED", label: "Published" },
                    { value: "DONE", label: "Done / Completed" },
                  ]}
                  value={statusFilter}
                  onChange={(val) => setStatusFilter(val)}
                  placeholder="All Statuses"
                />
              </div>

              <div className="w-32 sm:w-36">
                <Select
                  size="sm"
                  options={[
                    { value: "", label: "All Priorities" },
                    { value: "LOW", label: "Low" },
                    { value: "MID", label: "Mid" },
                    { value: "HIGH", label: "High" },
                    { value: "URGENT", label: "Urgent" },
                  ]}
                  value={priorityFilter}
                  onChange={(val) => setPriorityFilter(val)}
                  placeholder="All Priorities"
                />
              </div>
            </div>
          }
          searchPlaceholder="Search assigned projects..."
          emptyStateMessage="Belum ada project yang ditugaskan kepada Anda saat ini."
        />
      </div>
    </div>
  </ProtectedContent>
  );
}
