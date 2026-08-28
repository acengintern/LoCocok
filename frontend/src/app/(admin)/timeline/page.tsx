"use client";

import React, { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api/client";
import Button from "@/components/ui/button/Button";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import StatusBadge from "@/components/common/StatusBadge";
import { useToast } from "@/context/ToastContext";

interface TimelineItem {
  id: number;
  project_code: string;
  name: string;
  client_name: string;
  ae_name: string;
  sms_name: string;
  status: string;
  priority: string;
  start_date: string;
  end_date: string;
  remaining_days: number | null;
  is_overtime: boolean;
  progress_percentage: number;
  target_output?: number;
  actual_output?: number;
  remaining_output?: number;
}

export default function TimelinePage() {
  const { showToast } = useToast();
  const [projects, setProjects] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"GANTT" | "TABLE">("GANTT");

  const fetchTimeline = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/reports/project-overview");
      const data = res.data?.data || res.data || [];
      setProjects(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load timeline data", error);
      showToast({ variant: "error", title: "Error", message: "Gagal memuat data timeline produksi." });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchTimeline();
  }, [fetchTimeline]);

  const filteredProjects = projects.filter((p) => {
    if (statusFilter === "OVERTIME" && !p.is_overtime) return false;
    if (statusFilter === "EXPIRY_WARNING" && !(p.remaining_days !== null && p.remaining_days > 0 && p.remaining_days <= 14)) return false;
    if (statusFilter === "ACTIVE" && !(p.remaining_days !== null && p.remaining_days > 14)) return false;
    if (statusFilter === "EXPIRED" && !(p.remaining_days !== null && p.remaining_days < 0)) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        p.name.toLowerCase().includes(q) ||
        p.client_name.toLowerCase().includes(q) ||
        p.ae_name.toLowerCase().includes(q) ||
        p.sms_name.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Production Timeline & Gantt View" />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Project Timeline &amp; Deadline Monitor
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Visualisasi rentang waktu pengerjaan project, deteksi otomatis overtime, expiry warning, dan SLA status
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none"
          >
            <option value="">-- All Deadline Status --</option>
            <option value="ACTIVE">Active (&gt; 14 hari)</option>
            <option value="EXPIRY_WARNING">Expiry Warning (1-14 hari)</option>
            <option value="OVERTIME">Overtime</option>
            <option value="EXPIRED">Expired (&lt; 0 hari)</option>
          </select>

          {/* View Mode Switcher */}
          <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-xl">
            <button
              onClick={() => setViewMode("GANTT")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                viewMode === "GANTT"
                  ? "bg-white dark:bg-gray-800 text-brand-600 dark:text-brand-400 shadow-sm"
                  : "text-gray-600 dark:text-gray-300"
              }`}
            >
              Gantt View
            </button>
            <button
              onClick={() => setViewMode("TABLE")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                viewMode === "TABLE"
                  ? "bg-white dark:bg-gray-800 text-brand-600 dark:text-brand-400 shadow-sm"
                  : "text-gray-600 dark:text-gray-300"
              }`}
            >
              Table View
            </button>
          </div>
        </div>
      </div>

      {/* Deadline Indicator KPI Legend */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40">
          <div className="text-xs text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">
            ● Active (&gt; 14 Hari)
          </div>
          <div className="text-xl font-extrabold text-emerald-900 dark:text-emerald-200 mt-1">
            {projects.filter((p) => p.remaining_days !== null && p.remaining_days > 14).length} Projects
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40">
          <div className="text-xs text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider">
            ● Expiry Warning (1-14 Hari)
          </div>
          <div className="text-xl font-extrabold text-amber-900 dark:text-amber-200 mt-1">
            {projects.filter((p) => p.remaining_days !== null && p.remaining_days > 0 && p.remaining_days <= 14).length} Projects
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-800/40">
          <div className="text-xs text-rose-600 dark:text-rose-400 font-bold uppercase tracking-wider">
            ● Overtime Alert
          </div>
          <div className="text-xl font-extrabold text-rose-900 dark:text-rose-200 mt-1">
            {projects.filter((p) => p.is_overtime).length} Projects
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-gray-100/70 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">
            ● Total Projects
          </div>
          <div className="text-xl font-extrabold text-gray-900 dark:text-white mt-1">
            {projects.length} Projects
          </div>
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 text-gray-500">
          Tidak ada project yang sesuai filter.
        </div>
      ) : viewMode === "GANTT" ? (
        /* Visual Gantt Chart List */
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm space-y-6">
          <div className="space-y-4">
            {filteredProjects.map((p) => {
              let deadlineBadge = { label: "ACTIVE", color: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" };
              if (p.is_overtime) {
                deadlineBadge = { label: "OVERTIME", color: "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 animate-pulse" };
              } else if (p.remaining_days !== null && p.remaining_days <= 14 && p.remaining_days > 0) {
                deadlineBadge = { label: `WARNING (${p.remaining_days}d)`, color: "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400" };
              } else if (p.remaining_days !== null && p.remaining_days <= 0) {
                deadlineBadge = { label: "EXPIRED", color: "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300" };
              }

              return (
                <div
                  key={p.id}
                  className="p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30 space-y-2.5 hover:border-brand-300 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs font-bold text-brand-600 dark:text-brand-400">
                        {p.project_code || `PRJ-${p.id}`}
                      </span>
                      <span className="font-extrabold text-sm text-gray-900 dark:text-white">
                        {p.name}
                      </span>
                      <span className="text-xs text-gray-400">({p.client_name})</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${deadlineBadge.color}`}>
                        {deadlineBadge.label}
                      </span>
                      <StatusBadge status={p.status} />
                    </div>
                  </div>

                  {/* Progress & Gantt Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-500 font-medium">
                      <span>Timeline: {p.start_date || "-"} &rarr; {p.end_date || "-"}</span>
                      <span className="font-bold text-gray-700 dark:text-gray-300">
                        Progress: {p.progress_percentage}% ({p.actual_output} / {p.target_output} Output)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-3 rounded-full transition-all duration-500 ${
                          p.is_overtime
                            ? "bg-rose-500"
                            : p.progress_percentage >= 100
                            ? "bg-emerald-500"
                            : "bg-brand-500"
                        }`}
                        style={{ width: `${Math.min(100, Math.max(5, p.progress_percentage))}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1">
                    <span>AE: {p.ae_name} | SMS: {p.sms_name}</span>
                    <span>Sisa Waktu: {p.remaining_days !== null ? `${p.remaining_days} Hari` : "-"}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Table View */
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-5 py-3.5">Code</th>
                  <th className="px-5 py-3.5">Project &amp; Client</th>
                  <th className="px-5 py-3.5">AE / SMS</th>
                  <th className="px-5 py-3.5">Start Date</th>
                  <th className="px-5 py-3.5">End Date</th>
                  <th className="px-5 py-3.5">Sisa Hari</th>
                  <th className="px-5 py-3.5">Deadline Status</th>
                  <th className="px-5 py-3.5">Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredProjects.map((p) => {
                  let deadlineBadge = { label: "ACTIVE", color: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" };
                  if (p.is_overtime) {
                    deadlineBadge = { label: "OVERTIME", color: "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400" };
                  } else if (p.remaining_days !== null && p.remaining_days <= 14 && p.remaining_days > 0) {
                    deadlineBadge = { label: "EXPIRY WARNING", color: "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400" };
                  } else if (p.remaining_days !== null && p.remaining_days <= 0) {
                    deadlineBadge = { label: "EXPIRED", color: "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300" };
                  }

                  return (
                    <tr key={p.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-700/30">
                      <td className="px-5 py-4 font-mono font-bold text-brand-600">{p.project_code || `PRJ-${p.id}`}</td>
                      <td className="px-5 py-4">
                        <div className="font-bold text-gray-900 dark:text-white">{p.name}</div>
                        <div className="text-[11px] text-gray-400">{p.client_name}</div>
                      </td>
                      <td className="px-5 py-4 font-medium text-gray-700 dark:text-gray-300">
                        {p.ae_name} / {p.sms_name}
                      </td>
                      <td className="px-5 py-4 text-gray-500">{p.start_date || "-"}</td>
                      <td className="px-5 py-4 text-gray-500">{p.end_date || "-"}</td>
                      <td className="px-5 py-4 font-bold text-gray-900 dark:text-white">{p.remaining_days !== null ? `${p.remaining_days} hari` : "-"}</td>
                      <td className="px-5 py-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${deadlineBadge.color}`}>
                          {deadlineBadge.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-bold text-brand-600">{p.progress_percentage}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
