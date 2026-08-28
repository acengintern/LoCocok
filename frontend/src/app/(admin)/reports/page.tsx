"use client";

import React, { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api/client";
import Button from "@/components/ui/button/Button";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import StatusBadge from "@/components/common/StatusBadge";
import { useAuth } from "@/hooks/useAuth";
import { hasRole } from "@/lib/rbac";
import { useToast } from "@/context/ToastContext";

type ReportTab = "PROJECTS" | "WORKLOAD" | "OUTPUTS" | "TIMELINE" | "CLIENTS" | "FINANCIAL";

export default function ReportsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const canViewFinancial = hasRole(user, ["System Administrator", "Finance", "Account Executive"]);

  const [activeTab, setActiveTab] = useState<ReportTab>("PROJECTS");
  const [loading, setLoading] = useState(true);

  // Report Data States
  const [projectOverviewData, setProjectOverviewData] = useState<any[]>([]);
  const [workloadData, setWorkloadData] = useState<any>(null);
  const [outputData, setOutputData] = useState<any>(null);
  const [timelineData, setTimelineData] = useState<any>(null);
  const [clientData, setClientData] = useState<any>(null);
  const [financialData, setFinancialData] = useState<any>(null);

  const [searchQuery, setSearchQuery] = useState("");

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, wRes, oRes, tRes, cRes, fRes] = await Promise.all([
        apiClient.get("/reports/project-overview"),
        apiClient.get("/reports/workload-summary"),
        apiClient.get("/reports/output-summary"),
        apiClient.get("/reports/timeline-deadlines"),
        apiClient.get("/reports/client-summary"),
        canViewFinancial ? apiClient.get("/reports/financial-summary") : Promise.resolve({ data: null }),
      ]);

      setProjectOverviewData(pRes.data?.data || pRes.data || []);
      setWorkloadData(wRes.data?.data || wRes.data || null);
      setOutputData(oRes.data?.data || oRes.data || null);
      setTimelineData(tRes.data?.data || tRes.data || null);
      setClientData(cRes.data?.data || cRes.data || null);
      if (fRes?.data) {
        setFinancialData(fRes.data?.data || fRes.data || null);
      }
    } catch (error) {
      console.error("Failed to load reports", error);
      showToast({ variant: "error", title: "Error", message: "Gagal memuat data laporan & analitik." });
    } finally {
      setLoading(false);
    }
  }, [canViewFinancial, showToast]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Export to CSV helper
  const exportToCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) {
      showToast({ variant: "warning", title: "No Data", message: "Tidak ada data untuk diekspor." });
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [
        headers.join(","),
        ...data.map((row) =>
          headers
            .map((fieldName) => {
              const val = row[fieldName];
              if (val === null || val === undefined) return '""';
              if (typeof val === "string") return `"${val.replace(/"/g, '""')}"`;
              return `"${val}"`;
            })
            .join(",")
        ),
      ].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast({ variant: "success", title: "Export Success", message: `Laporan ${filename} berhasil diunduh sebagai CSV.` });
  };

  const tabs: { id: ReportTab; label: string; count?: number }[] = [
    { id: "PROJECTS", label: "Project Overview", count: projectOverviewData.length },
    { id: "WORKLOAD", label: "Workload & Team Performance" },
    { id: "OUTPUTS", label: "Output Deliverables (SMM / OTP)" },
    { id: "TIMELINE", label: "Timeline & Deadlines" },
    { id: "CLIENTS", label: "Client Reports" },
    ...(canViewFinancial ? [{ id: "FINANCIAL" as ReportTab, label: "Financial & Budget" }] : []),
  ];

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Reports & Analytics Suite" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Reports &amp; Analytics Hub
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Laporan operasional project, throughput tim, SLA pengerjaan, realisasi output deliverable, dan metrik finansial
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Filter data laporan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 px-3.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none"
          />

          <Button
            onClick={() => {
              if (activeTab === "PROJECTS") exportToCSV(projectOverviewData, "project_overview_report");
              else if (activeTab === "WORKLOAD") exportToCSV(workloadData?.team_performance || [], "team_workload_report");
              else if (activeTab === "OUTPUTS") exportToCSV(outputData?.overall_outputs || [], "output_deliverables_report");
              else if (activeTab === "TIMELINE") exportToCSV(timelineData?.overdue_tasks || [], "overdue_tasks_report");
              else if (activeTab === "CLIENTS") exportToCSV(clientData?.active_clients || [], "active_clients_report");
              else if (activeTab === "FINANCIAL") exportToCSV(financialData?.payments || [], "client_payments_report");
            }}
            variant="outline"
            className="h-10 text-xs font-bold"
          >
            📥 Export CSV
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
              activeTab === tab.id
                ? "bg-brand-500 text-white shadow-sm"
                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50"
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[11px]">{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Content Rendering based on Tab */}
      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* TAB 1: Project Overview Report */}
          {activeTab === "PROJECTS" && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="px-5 py-3.5">Code</th>
                      <th className="px-5 py-3.5">Project Name</th>
                      <th className="px-5 py-3.5">Client</th>
                      <th className="px-5 py-3.5">AE / SMS</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5">Target Output</th>
                      <th className="px-5 py-3.5">Realisasi</th>
                      <th className="px-5 py-3.5">Sisa</th>
                      <th className="px-5 py-3.5">Progress</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {projectOverviewData
                      .filter((p) => {
                        if (!searchQuery) return true;
                        const q = searchQuery.toLowerCase();
                        return (
                          p.name?.toLowerCase().includes(q) ||
                          p.client_name?.toLowerCase().includes(q) ||
                          p.ae_name?.toLowerCase().includes(q) ||
                          p.sms_name?.toLowerCase().includes(q)
                        );
                      })
                      .map((p) => (
                        <tr key={p.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-700/30">
                          <td className="px-5 py-4 font-mono font-bold text-brand-600">{p.project_code || `PRJ-${p.id}`}</td>
                          <td className="px-5 py-4 font-bold text-gray-900 dark:text-white">{p.name}</td>
                          <td className="px-5 py-4 text-gray-600 dark:text-gray-300">{p.client_name}</td>
                          <td className="px-5 py-4 font-medium text-gray-700 dark:text-gray-300">
                            {p.ae_name} / {p.sms_name}
                          </td>
                          <td className="px-5 py-4">
                            <StatusBadge status={p.status} />
                          </td>
                          <td className="px-5 py-4 font-semibold">{p.target_output}</td>
                          <td className="px-5 py-4 font-bold text-emerald-600">{p.actual_output}</td>
                          <td className="px-5 py-4 font-semibold text-rose-500">{p.remaining_output}</td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-brand-600">{p.progress_percentage}%</span>
                              <div className="w-16 bg-gray-100 dark:bg-gray-700 rounded-full h-1.5">
                                <div
                                  className="bg-brand-500 h-1.5 rounded-full"
                                  style={{ width: `${Math.min(100, p.progress_percentage)}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: Workload & Team Performance Report */}
          {activeTab === "WORKLOAD" && workloadData && (
            <div className="space-y-6">
              {/* Team Performance Table */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                <div className="p-5 border-b border-gray-100 dark:border-gray-700 font-bold text-sm text-gray-900 dark:text-white">
                  Team Performance &amp; Completion Rate
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        <th className="px-5 py-3.5">PIC / Team Member</th>
                        <th className="px-5 py-3.5">Primary Role</th>
                        <th className="px-5 py-3.5">Total Tasks</th>
                        <th className="px-5 py-3.5">Completed</th>
                        <th className="px-5 py-3.5">On Progress</th>
                        <th className="px-5 py-3.5">Revisions</th>
                        <th className="px-5 py-3.5">Overdue</th>
                        <th className="px-5 py-3.5">Average Completion</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {workloadData.team_performance?.map((m: any) => (
                        <tr key={m.user_id} className="hover:bg-gray-50/60 dark:hover:bg-gray-700/30">
                          <td className="px-5 py-4 font-bold text-gray-900 dark:text-white">{m.name}</td>
                          <td className="px-5 py-4 font-medium text-gray-500">{m.role}</td>
                          <td className="px-5 py-4 font-bold">{m.total_tasks}</td>
                          <td className="px-5 py-4 font-bold text-emerald-600">{m.completed_tasks}</td>
                          <td className="px-5 py-4 font-bold text-blue-600">{m.on_progress_tasks}</td>
                          <td className="px-5 py-4 font-bold text-amber-600">{m.revision_tasks}</td>
                          <td className="px-5 py-4 font-bold text-rose-500">{m.overdue_tasks}</td>
                          <td className="px-5 py-4 font-extrabold text-brand-600">{m.completion_rate}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Designer & Editor Specific Workload (Chapter 45 & 46) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-3">
                  <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                    Graphic Designer Workload (DG)
                  </h3>
                  <div className="space-y-2">
                    {workloadData.designer_workload?.map((d: any) => (
                      <div key={d.user_id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/40 text-xs">
                        <span className="font-bold text-gray-900 dark:text-white">{d.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-gray-500">Total: {d.total_tasks}</span>
                          <span className="font-bold text-emerald-600">Done: {d.completed_tasks}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-3">
                  <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                    Video Editor Workload (DAV)
                  </h3>
                  <div className="space-y-2">
                    {workloadData.editor_workload?.map((e: any) => (
                      <div key={e.user_id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/40 text-xs">
                        <span className="font-bold text-gray-900 dark:text-white">{e.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-gray-500">Total: {e.total_tasks}</span>
                          <span className="font-bold text-emerald-600">Done: {e.completed_tasks}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Output Deliverables Report (Chapter 50-52) */}
          {activeTab === "OUTPUTS" && outputData && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                <div className="p-5 border-b border-gray-100 dark:border-gray-700 font-bold text-sm text-gray-900 dark:text-white">
                  Target vs Realisasi Deliverable Output
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        <th className="px-5 py-3.5">Project</th>
                        <th className="px-5 py-3.5">Client</th>
                        <th className="px-5 py-3.5">Type</th>
                        <th className="px-5 py-3.5">Output Type</th>
                        <th className="px-5 py-3.5">Periode</th>
                        <th className="px-5 py-3.5">Target</th>
                        <th className="px-5 py-3.5">Realisasi</th>
                        <th className="px-5 py-3.5">Sisa</th>
                        <th className="px-5 py-3.5">Progress %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {outputData.overall_outputs?.map((o: any) => (
                        <tr key={o.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-700/30">
                          <td className="px-5 py-4 font-bold text-gray-900 dark:text-white">{o.project_name}</td>
                          <td className="px-5 py-4 text-gray-500">{o.client_name}</td>
                          <td className="px-5 py-4 text-gray-500">{o.project_type}</td>
                          <td className="px-5 py-4 font-bold text-brand-600">{o.output_type}</td>
                          <td className="px-5 py-4 text-gray-400">{o.period}</td>
                          <td className="px-5 py-4 font-bold">{o.target}</td>
                          <td className="px-5 py-4 font-bold text-emerald-600">{o.realisation}</td>
                          <td className="px-5 py-4 font-bold text-rose-500">{o.remaining}</td>
                          <td className="px-5 py-4 font-extrabold text-brand-600">{o.progress_percentage}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Timeline & Deadlines Report (Chapter 48-49) */}
          {activeTab === "TIMELINE" && timelineData && (
            <div className="space-y-6">
              {/* Upcoming Deadlines Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
                <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 text-center">
                  <div className="text-[11px] text-gray-400 font-bold">Hari Ini</div>
                  <div className="text-xl font-extrabold text-brand-600 mt-1">{timelineData.deadline_counts?.today || 0}</div>
                </div>
                <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 text-center">
                  <div className="text-[11px] text-gray-400 font-bold">Besok</div>
                  <div className="text-xl font-extrabold text-blue-600 mt-1">{timelineData.deadline_counts?.tomorrow || 0}</div>
                </div>
                <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 text-center">
                  <div className="text-[11px] text-gray-400 font-bold">Minggu Ini</div>
                  <div className="text-xl font-extrabold text-purple-600 mt-1">{timelineData.deadline_counts?.this_week || 0}</div>
                </div>
                <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 text-center">
                  <div className="text-[11px] text-gray-400 font-bold">7 Hari Ke Depan</div>
                  <div className="text-xl font-extrabold text-amber-600 mt-1">{timelineData.deadline_counts?.next_7_days || 0}</div>
                </div>
                <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 text-center">
                  <div className="text-[11px] text-gray-400 font-bold">14 Hari Ke Depan</div>
                  <div className="text-xl font-extrabold text-emerald-600 mt-1">{timelineData.deadline_counts?.next_14_days || 0}</div>
                </div>
                <div className="p-4 bg-rose-50 dark:bg-rose-950/30 rounded-2xl border border-rose-200 dark:border-rose-800 text-center">
                  <div className="text-[11px] text-rose-600 dark:text-rose-400 font-bold">Overdue</div>
                  <div className="text-xl font-extrabold text-rose-700 dark:text-rose-300 mt-1">{timelineData.deadline_counts?.total_overdue || 0}</div>
                </div>
              </div>

              {/* Overdue Tasks Table */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                <div className="p-5 border-b border-gray-100 dark:border-gray-700 font-bold text-sm text-rose-600 flex items-center gap-2">
                  <span>⚠️ Laporan Task Melewati Batas Deadline (Overdue)</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        <th className="px-5 py-3.5">Task No</th>
                        <th className="px-5 py-3.5">Project</th>
                        <th className="px-5 py-3.5">Judul Pekerjaan</th>
                        <th className="px-5 py-3.5">Assignee</th>
                        <th className="px-5 py-3.5">Due Date</th>
                        <th className="px-5 py-3.5">Overdue (Hari)</th>
                        <th className="px-5 py-3.5">Priority</th>
                        <th className="px-5 py-3.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {timelineData.overdue_tasks?.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="p-6 text-center text-gray-400">Tidak ada task yang overdue.</td>
                        </tr>
                      ) : (
                        timelineData.overdue_tasks?.map((t: any) => (
                          <tr key={t.id} className="hover:bg-rose-50/30">
                            <td className="px-5 py-4 font-mono font-bold text-brand-600">{t.task_no}</td>
                            <td className="px-5 py-4 font-bold text-gray-900 dark:text-white">{t.project_name}</td>
                            <td className="px-5 py-4 font-medium text-gray-800 dark:text-gray-200">{t.title}</td>
                            <td className="px-5 py-4 font-semibold text-brand-600">{t.assignee}</td>
                            <td className="px-5 py-4 text-gray-500">{t.due_date}</td>
                            <td className="px-5 py-4 font-extrabold text-rose-600">+{t.overdue_days} hari</td>
                            <td className="px-5 py-4 font-bold text-rose-500">{t.priority}</td>
                            <td className="px-5 py-4">
                              <StatusBadge status={t.status} />
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Client Reports (Chapter 53 & 54) */}
          {activeTab === "CLIENTS" && clientData && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                <div className="p-5 border-b border-gray-100 dark:border-gray-700 font-bold text-sm text-gray-900 dark:text-white">
                  Active Clients &amp; Contract Status
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        <th className="px-5 py-3.5">Client Name</th>
                        <th className="px-5 py-3.5">PIC AE</th>
                        <th className="px-5 py-3.5">Active Projects</th>
                        <th className="px-5 py-3.5">Total Projects</th>
                        <th className="px-5 py-3.5">Contract Period</th>
                        <th className="px-5 py-3.5">Contract Value</th>
                        <th className="px-5 py-3.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {clientData.active_clients?.map((c: any) => (
                        <tr key={c.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-700/30">
                          <td className="px-5 py-4 font-bold text-gray-900 dark:text-white">{c.name}</td>
                          <td className="px-5 py-4 font-medium text-brand-600">{c.pic_ae}</td>
                          <td className="px-5 py-4 font-bold text-emerald-600">{c.active_projects}</td>
                          <td className="px-5 py-4 font-bold text-gray-700 dark:text-gray-300">{c.total_projects}</td>
                          <td className="px-5 py-4 text-gray-500">{c.contract_period}</td>
                          <td className="px-5 py-4 font-bold text-gray-900 dark:text-white">
                            Rp {c.contract_value?.toLocaleString()}
                          </td>
                          <td className="px-5 py-4">
                            <span className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded">
                              {c.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: Financial Reports (Chapter 55-57) */}
          {activeTab === "FINANCIAL" && financialData && (
            <div className="space-y-6">
              {/* Financial KPI Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-1">
                  <div className="text-xs text-gray-500">Total Project Revenue</div>
                  <div className="text-xl font-extrabold text-gray-900 dark:text-white">
                    Rp {financialData.summary?.total_revenue?.toLocaleString()}
                  </div>
                </div>

                <div className="p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-1">
                  <div className="text-xs text-gray-500">Nett Project Revenue</div>
                  <div className="text-xl font-extrabold text-brand-600">
                    Rp {financialData.summary?.total_nett_revenue?.toLocaleString()}
                  </div>
                </div>

                <div className="p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-1">
                  <div className="text-xs text-gray-500">Total HPP Produksi</div>
                  <div className="text-xl font-extrabold text-amber-600">
                    Rp {financialData.summary?.total_hpp?.toLocaleString()}
                  </div>
                </div>

                <div className="p-5 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-800 shadow-sm space-y-1">
                  <div className="text-xs text-emerald-600 font-bold">Gross Margin %</div>
                  <div className="text-xl font-extrabold text-emerald-700 dark:text-emerald-300">
                    {financialData.summary?.gross_margin_percentage}%
                  </div>
                </div>
              </div>

              {/* Payment Klien Loco Table (Chapter 55) */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                <div className="p-5 border-b border-gray-100 dark:border-gray-700 font-bold text-sm text-gray-900 dark:text-white">
                  Payment Klien Loco &amp; Cost Breakdown
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        <th className="px-5 py-3.5">Project</th>
                        <th className="px-5 py-3.5">Type</th>
                        <th className="px-5 py-3.5">Project Revenue</th>
                        <th className="px-5 py-3.5">Cost of Sale</th>
                        <th className="px-5 py-3.5">HPP</th>
                        <th className="px-5 py-3.5">Nett Revenue</th>
                        <th className="px-5 py-3.5">Status Pembayaran</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {financialData.payments?.map((f: any) => (
                        <tr key={f.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-700/30">
                          <td className="px-5 py-4 font-bold text-gray-900 dark:text-white">{f.project_name}</td>
                          <td className="px-5 py-4 text-gray-500">{f.project_type}</td>
                          <td className="px-5 py-4 font-semibold">Rp {f.project_revenue?.toLocaleString()}</td>
                          <td className="px-5 py-4 text-gray-500">Rp {f.cost_of_sale?.toLocaleString()}</td>
                          <td className="px-5 py-4 text-amber-600 font-medium">Rp {f.hpp?.toLocaleString()}</td>
                          <td className="px-5 py-4 font-bold text-brand-600">Rp {f.nett_revenue?.toLocaleString()}</td>
                          <td className="px-5 py-4">
                            <span className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded">
                              {f.payment_status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
