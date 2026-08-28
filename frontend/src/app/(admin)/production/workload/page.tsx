"use client";

import React, { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api/client";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import StatusBadge from "@/components/common/StatusBadge";
import { useToast } from "@/context/ToastContext";

interface TeamMember {
  user_id: number;
  name: string;
  username: string;
  role: string;
  total_tasks: number;
  completed_tasks: number;
  on_progress_tasks: number;
  revision_tasks: number;
  overdue_tasks: number;
  completion_rate: number;
}

interface DailyTask {
  id: number;
  task_no: string;
  title: string;
  project_name: string;
  client_name: string;
  pic_ae: string;
  pic_sms: string;
  assignee: string;
  due_date: string;
  priority: string;
  status: string;
  output_type: string;
}

export default function WorkloadPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>([]);
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/reports/workload-summary");
      const data = res.data?.data || res.data;
      if (data) {
        setTeamMembers(data.team_performance || []);
        setDailyTasks(data.daily_workload || []);
      }
    } catch (error) {
      console.error("Failed to load workload data", error);
      showToast({ variant: "error", title: "Error", message: "Gagal memuat data workload tim." });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter team members
  const filteredTeam = teamMembers.filter((m) => {
    if (roleFilter === "DESIGNER" && !m.role.toLowerCase().includes("designer") && !m.role.toLowerCase().includes("design")) return false;
    if (roleFilter === "EDITOR" && !m.role.toLowerCase().includes("editor") && !m.role.toLowerCase().includes("video") && !m.role.toLowerCase().includes("dav")) return false;
    if (roleFilter === "SMS" && !m.role.toLowerCase().includes("social") && !m.role.toLowerCase().includes("sms")) return false;
    if (searchQuery && !m.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // Filter tasks
  const filteredTasks = dailyTasks.filter((t) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        t.title.toLowerCase().includes(q) ||
        t.assignee.toLowerCase().includes(q) ||
        t.project_name.toLowerCase().includes(q) ||
        t.client_name.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (selectedDate && t.due_date !== selectedDate) return false;
    return true;
  });

  // Group tasks by Date and Assignee for Monday Challenge format
  const groupedTasks: Record<string, Record<string, DailyTask[]>> = {};
  filteredTasks.forEach((t) => {
    const dateKey = t.due_date || "No Deadline";
    if (!groupedTasks[dateKey]) groupedTasks[dateKey] = {};
    const assigneeKey = t.assignee || "Unassigned";
    if (!groupedTasks[dateKey][assigneeKey]) groupedTasks[dateKey][assigneeKey] = [];
    groupedTasks[dateKey][assigneeKey].push(t);
  });

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Daily Workload & Team Capacity" />

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Daily Workload (Monday Challenge)
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Monitoring beban kerja harian person-in-charge, distribusi tugas, dan kapasitas tim produksi
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Cari PIC / Project / Task..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 px-3.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <Button onClick={fetchData} variant="outline" className="h-10">
            Refresh
          </Button>
        </div>
      </div>

      {/* Team Capacity & Utilization Matrix */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Kapasitas &amp; Beban Kerja Anggota Tim
          </h2>
          <div className="flex gap-1.5 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
            {["ALL", "DESIGNER", "EDITOR", "SMS"].map((role) => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  roleFilter === role
                    ? "bg-white dark:bg-gray-700 text-brand-600 dark:text-brand-400 shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredTeam.map((member) => {
              const activeCount = member.on_progress_tasks + member.revision_tasks;
              let capacityBadge = { label: "Kapasitas Tersedia", color: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" };
              if (activeCount >= 4) {
                capacityBadge = { label: "Overloaded", color: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400" };
              } else if (activeCount >= 2) {
                capacityBadge = { label: "Optimal / Busy", color: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400" };
              }

              return (
                <div
                  key={member.user_id}
                  className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-base">
                        {member.name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                        {member.role}
                      </p>
                    </div>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${capacityBadge.color}`}>
                      {capacityBadge.label}
                    </span>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100 dark:border-gray-700 text-center">
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded-xl">
                      <div className="text-xs text-gray-400">Total</div>
                      <div className="text-sm font-bold text-gray-900 dark:text-white">{member.total_tasks}</div>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-950/30 p-2 rounded-xl">
                      <div className="text-xs text-blue-500">Active</div>
                      <div className="text-sm font-bold text-blue-600 dark:text-blue-400">{activeCount}</div>
                    </div>
                    <div className="bg-emerald-50 dark:bg-emerald-950/30 p-2 rounded-xl">
                      <div className="text-xs text-emerald-500">Done</div>
                      <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{member.completed_tasks}</div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-gray-500 mb-1">
                      <span>Completion</span>
                      <span>{member.completion_rate}%</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-brand-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${member.completion_rate}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Monday Challenge Daily Workload Breakdown */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Pola Alokasi Harian (Monday Challenge Format)
          </h2>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Pola: Tanggal &rarr; PIC &rarr; Project &rarr; Task List
          </span>
        </div>

        {Object.keys(groupedTasks).length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 text-gray-500">
            Tidak ada task untuk filter yang dipilih.
          </div>
        ) : (
          Object.entries(groupedTasks).map(([date, assignees]) => (
            <div
              key={date}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm"
            >
              {/* Date Header */}
              <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-500"></span>
                  <span className="font-bold text-gray-900 dark:text-white text-sm uppercase tracking-wider">
                    {date}
                  </span>
                </div>
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                  {Object.values(assignees).reduce((acc, tasks) => acc + tasks.length, 0)} Tasks
                </span>
              </div>

              {/* Assignees & Tasks */}
              <div className="p-6 space-y-6 divide-y divide-gray-100 dark:divide-gray-700">
                {Object.entries(assignees).map(([assigneeName, tasks], index) => (
                  <div key={assigneeName} className={`${index > 0 ? "pt-5" : ""}`}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-xs">
                        {assigneeName.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="font-extrabold text-gray-900 dark:text-white text-base">
                        {assigneeName.toUpperCase()}
                      </span>
                      <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-md font-medium text-gray-600 dark:text-gray-300">
                        {tasks.length} item pekerjaan
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 ml-11">
                      {tasks.map((t) => (
                        <div
                          key={t.id}
                          className="p-3.5 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30 hover:border-brand-300 dark:hover:border-brand-500/40 transition-all shadow-2xs space-y-2"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-bold text-xs text-brand-600 dark:text-brand-400">
                              {t.project_name}
                            </span>
                            <StatusBadge status={t.status} />
                          </div>

                          <p className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">
                            {t.title}
                          </p>

                          <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 pt-1 border-t border-gray-200/40 dark:border-gray-700/50">
                            <span>Output: {t.output_type}</span>
                            <span
                              className={`font-bold ${
                                t.priority === "URGENT" || t.priority === "HIGH"
                                  ? "text-rose-500"
                                  : "text-gray-500"
                              }`}
                            >
                              {t.priority}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
