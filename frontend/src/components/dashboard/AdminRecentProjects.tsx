"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api/client";
import Badge from "@/components/ui/badge/Badge";

interface ProjectItem {
  id: number;
  project_code: string;
  name: string;
  client?: { id: number; name: string };
  project_type?: { id: number; name: string };
  ae?: { id: number; name: string };
  sms?: { id: number; name: string };
  priority: string;
  status: string;
  start_date?: string;
  end_date?: string;
}

export default function AdminRecentProjects() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const response = await apiClient.get("/dashboard/summary");
        const summary = response.data?.data ?? response.data;
        setProjects(summary?.recent_projects || []);
      } catch {
        // Silently handle error
      } finally {
        setLoading(false);
      }
    };
    fetchRecent();
  }, []);

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

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03] animate-pulse">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white">
            Recent Projects
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Active campaigns currently in production
          </p>
        </div>
        <Link
          href="/projects"
          className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
        >
          View All Projects &rarr;
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full min-w-max text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/60 dark:border-gray-800 dark:bg-white/[0.02] text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              <th className="px-5 py-3.5">Code / Project</th>
              <th className="px-4 py-3.5">Client</th>
              <th className="px-4 py-3.5">Type</th>
              <th className="px-4 py-3.5">Assigned Leads</th>
              <th className="px-4 py-3.5">Priority</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-5 py-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-xs">
            {projects.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-sm text-gray-400">
                  Belum ada project aktif saat ini.
                </td>
              </tr>
            ) : (
              projects.map((p) => (
                <tr
                  key={p.id}
                  className="hover:bg-gray-50/60 dark:hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex flex-col">
                      <span className="font-mono text-xs font-semibold text-brand-600 dark:text-brand-400">
                        {p.project_code || `PRJ-${p.id}`}
                      </span>
                      <span className="font-medium text-sm text-gray-900 dark:text-white">
                        {p.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 font-medium text-gray-700 dark:text-gray-300">
                    {p.client?.name || "-"}
                  </td>
                  <td className="px-4 py-3.5 text-gray-500 dark:text-gray-400">
                    {p.project_type?.name || "General"}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5">
                      {p.ae?.name && (
                        <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[11px] font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                          AE: {p.ae.name}
                        </span>
                      )}
                      {p.sms?.name && (
                        <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[11px] font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                          SMS: {p.sms.name}
                        </span>
                      )}
                      {!p.ae?.name && !p.sms?.name && <span className="text-gray-400">-</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge color={getPriorityBadgeColor(p.priority)} size="sm">
                      {p.priority || "MID"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge color={getStatusBadgeColor(p.status)} size="sm">
                      {formatTitleCase(p.status || "In Progress")}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Link
                      href={`/projects/${p.id}`}
                      className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 transition-colors"
                    >
                      View &rarr;
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
