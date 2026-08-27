"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api/client";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import Select from "@/components/form/Select";
import Modal from "@/components/common/Modal";

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
  created_at?: string;
}

export default function ProjectCalendarPage() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [clientFilter, setClientFilter] = useState<string>("ALL");

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/projects?include=client,projectType,ae,sms");
      const responseData = res.data?.data ?? res.data;
      if (Array.isArray(responseData)) {
        setProjects(responseData);
      } else {
        setProjects([]);
      }
    } catch (err) {
      console.error("Failed to fetch projects for calendar", err);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Clients list for filter
  const clientsList = useMemo(() => {
    const map = new Map<number, string>();
    projects.forEach((p) => {
      if (p.client?.id && p.client?.name) {
        map.set(p.client.id, p.client.name);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [projects]);

  const statusOptions = [
    { value: "ALL", label: "Semua Status" },
    { value: "CONTENT_PLANNING", label: "Content Planning" },
    { value: "SCRIPT_READY", label: "Script Ready" },
    { value: "DESIGN", label: "Design" },
    { value: "EDITING", label: "Editing" },
    { value: "QC_INTERNAL", label: "QC Internal" },
    { value: "REVISION", label: "Revision" },
    { value: "DONE", label: "Done" },
  ];

  const clientOptions = useMemo(() => {
    const opts = [{ value: "ALL", label: "Semua Klien" }];
    clientsList.forEach((c) => {
      opts.push({ value: String(c.id), label: c.name });
    });
    return opts;
  }, [clientsList]);

  // Month navigation helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const today = () => {
    setCurrentDate(new Date());
  };

  const monthName = currentDate.toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });

  // Format local date to YYYY-MM-DD
  const toLocalDateString = (d: Date): string => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  // Calculate calendar grid days
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sunday
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days: { date: Date; isCurrentMonth: boolean; dateStr: string }[] = [];

    // Prev month trailing days (start from Monday = 1, adjust for Sunday = 0)
    const offset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
    for (let i = offset - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, daysInPrevMonth - i);
      days.push({
        date: d,
        isCurrentMonth: false,
        dateStr: toLocalDateString(d),
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      days.push({
        date: d,
        isCurrentMonth: true,
        dateStr: toLocalDateString(d),
      });
    }

    // Next month leading days to complete full weeks (multiples of 7)
    const remaining = 7 - (days.length % 7);
    if (remaining < 7) {
      for (let i = 1; i <= remaining; i++) {
        const d = new Date(year, month + 1, i);
        days.push({
          date: d,
          isCurrentMonth: false,
          dateStr: toLocalDateString(d),
        });
      }
    }

    return days;
  }, [year, month]);

  // Filter projects
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      if (statusFilter !== "ALL" && p.status !== statusFilter) return false;
      if (clientFilter !== "ALL" && String(p.client?.id) !== clientFilter) return false;
      return true;
    });
  }, [projects, statusFilter, clientFilter]);

  // Map projects to dates
  const projectsByDate = useMemo(() => {
    const map: Record<string, ProjectItem[]> = {};

    filteredProjects.forEach((proj) => {
      // Use start_date or created_at
      const rawDate = proj.start_date || proj.created_at || "";
      if (rawDate) {
        const dStr = rawDate.split("T")[0];
        if (!map[dStr]) map[dStr] = [];
        map[dStr].push(proj);
      }

      // Also map end_date if distinct
      if (proj.end_date) {
        const endDStr = proj.end_date.split("T")[0];
        if (endDStr !== rawDate.split("T")[0]) {
          if (!map[endDStr]) map[endDStr] = [];
          if (!map[endDStr].some((p) => p.id === proj.id)) {
            map[endDStr].push(proj);
          }
        }
      }
    });

    return map;
  }, [filteredProjects]);

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "DONE":
      case "APPROVED":
      case "PUBLISHED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30";
      case "CONTENT_PLANNING":
      case "SCRIPT_READY":
        return "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:border-sky-500/30";
      case "DESIGN":
      case "EDITING":
        return "bg-brand-50 text-brand-700 border-brand-200 dark:bg-brand-500/10 dark:text-brand-300 dark:border-brand-500/30";
      case "QC_INTERNAL":
      case "REVISION":
        return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700";
    }
  };

  const getStatusBadgeColor = (status: string): "success" | "primary" | "warning" | "error" | "light" => {
    switch (status?.toUpperCase()) {
      case "DONE":
      case "APPROVED":
        return "success";
      case "CONTENT_PLANNING":
      case "SCRIPT_READY":
        return "primary";
      case "DESIGN":
      case "EDITING":
      case "QC_INTERNAL":
        return "warning";
      case "REVISION":
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

  const todayStr = toLocalDateString(new Date());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Project Calendar
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Jadwal pengerjaan, deadline, dan milestone seluruh project agensi
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/projects"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700/60 dark:hover:text-white shadow-theme-xs transition-all cursor-pointer"
          >
            <svg className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            <span>All Projects</span>
          </Link>
          <Link
            href="/projects/my"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-brand-500 px-3.5 text-xs font-semibold text-white hover:bg-brand-600 shadow-theme-xs shadow-brand-500/20 transition-all cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>My Projects</span>
          </Link>
        </div>
      </div>

      {/* Calendar Card Container */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03] space-y-4">
        {/* Month Toolbar & Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Navigation buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={prevMonth}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-750 transition-colors"
              title="Bulan Sebelumnya"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={today}
              className="inline-flex h-8 items-center rounded-lg border border-gray-200 bg-white px-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-750 transition-colors"
            >
              Hari Ini
            </button>
            <button
              onClick={nextMonth}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-750 transition-colors"
              title="Bulan Berikutnya"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <h2 className="ml-2 text-base sm:text-lg font-bold tracking-tight text-gray-900 dark:text-white capitalize">
              {monthName}
            </h2>
          </div>

          {/* Quick Dropdown Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Status Filter */}
            <div className="w-44 sm:w-48">
              <Select
                options={statusOptions}
                value={statusFilter}
                onChange={(val) => setStatusFilter(val)}
                placeholder="Semua Status"
              />
            </div>

            {/* Client Filter */}
            {clientsList.length > 0 && (
              <div className="w-44 sm:w-48">
                <Select
                  searchable={true}
                  searchPlaceholder="Cari klien..."
                  options={clientOptions}
                  value={clientFilter}
                  onChange={(val) => setClientFilter(val)}
                  placeholder="Semua Klien"
                />
              </div>
            )}
          </div>
        </div>

        {/* Main Calendar Grid */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          {/* Day Header (Sen - Min) */}
          <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50 text-center font-mono text-[11px] font-bold text-gray-600 dark:border-gray-800 dark:bg-gray-900/60 dark:text-gray-400">
            {["SEN", "SEL", "RAB", "KAM", "JUM", "SAB", "MIN"].map((dayName, idx) => (
              <div key={idx} className="py-2.5 border-r border-gray-200 last:border-r-0 dark:border-gray-800">
                {dayName}
              </div>
            ))}
          </div>

          {/* Days Matrix */}
          {loading ? (
            <div className="py-24 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-brand-500 border-r-transparent"></div>
              <p className="mt-2 text-xs font-mono text-gray-500">Memuat jadwal project...</p>
            </div>
          ) : (
            <div className="grid grid-cols-7 auto-rows-fr divide-y divide-gray-200 dark:divide-gray-800">
              {calendarDays.map((cell, idx) => {
                const cellProjects = projectsByDate[cell.dateStr] || [];
                const isToday = cell.dateStr === todayStr;

                return (
                  <div
                    key={idx}
                    className={`min-h-[105px] sm:min-h-[120px] p-1.5 sm:p-2 border-r border-gray-200 last:border-r-0 dark:border-gray-800 flex flex-col justify-between transition-colors ${
                      !cell.isCurrentMonth
                        ? "bg-gray-50/40 text-gray-400 dark:bg-gray-900/20 dark:text-gray-600"
                        : isToday
                        ? "bg-brand-50/20 dark:bg-brand-500/5"
                        : "bg-white dark:bg-transparent hover:bg-gray-50/60 dark:hover:bg-white/[0.01]"
                    }`}
                  >
                    {/* Date Number Header */}
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`flex h-6 w-6 items-center justify-center rounded-lg font-mono text-xs font-bold ${
                          isToday
                            ? "bg-brand-500 text-white shadow-xs"
                            : cell.isCurrentMonth
                            ? "text-gray-800 dark:text-gray-200"
                            : "text-gray-400 dark:text-gray-600"
                        }`}
                      >
                        {cell.date.getDate()}
                      </span>

                      {cellProjects.length > 0 && (
                        <span className="font-mono text-[10px] text-gray-400">
                          {cellProjects.length} {cellProjects.length === 1 ? "proj" : "projs"}
                        </span>
                      )}
                    </div>

                    {/* Projects List on this day */}
                    <div className="flex flex-col gap-1 flex-1 overflow-y-auto max-h-[80px] no-scrollbar">
                      {cellProjects.map((proj) => (
                        <button
                          key={proj.id}
                          onClick={() => setSelectedProject(proj)}
                          className={`group w-full text-left rounded-md border px-1.5 py-1 text-[10px] font-medium leading-tight transition-all truncate cursor-pointer hover:scale-[1.01] active:scale-[0.99] ${getStatusColor(
                            proj.status
                          )}`}
                          title={`${proj.project_code} - ${proj.name} (${proj.client?.name || "No Client"})`}
                        >
                          <div className="font-bold font-mono truncate">{proj.project_code}</div>
                          <div className="truncate text-gray-600 dark:text-gray-300">{proj.name}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Project Quick Detail Modal */}
      <Modal
        isOpen={Boolean(selectedProject)}
        onClose={() => setSelectedProject(null)}
        title="Project Schedule Detail"
        maxWidth="md"
      >
        {selectedProject && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs font-bold text-brand-600 dark:text-brand-400">
                  {selectedProject.project_code}
                </span>
                <Badge size="sm" color={getStatusBadgeColor(selectedProject.status)}>
                  {formatTitleCase(selectedProject.status)}
                </Badge>
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                {selectedProject.name}
              </h3>
            </div>

            {/* Modal Body */}
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-500 dark:text-gray-400">Client Brand:</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  {selectedProject.client?.name || "-"}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-500 dark:text-gray-400">Project Type:</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  {selectedProject.project_type?.name || "-"}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-500 dark:text-gray-400">Account Executive:</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  {selectedProject.ae?.name || "-"}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-500 dark:text-gray-400">Social Media Specialist:</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  {selectedProject.sms?.name || "-"}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-500 dark:text-gray-400">Timeline Period:</span>
                <span className="font-mono text-gray-800 dark:text-gray-200">
                  {selectedProject.start_date || selectedProject.created_at?.split("T")[0] || "-"} s/d{" "}
                  {selectedProject.end_date || "Ongoing"}
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedProject(null)}
              >
                Tutup
              </Button>
              <Link
                href={`/projects/${selectedProject.id}`}
                className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-2 text-xs font-semibold text-white shadow-theme-xs hover:bg-brand-600 transition-colors"
              >
                Buka Detail Project &rarr;
              </Link>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
