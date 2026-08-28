"use client";

import React, { useState, useEffect } from "react";
import DashboardBanner from "./DashboardBanner";
import SummaryCards from "./SummaryCards";
import WorkloadChart from "./WorkloadChart";
import ProjectStatusDistribution from "./ProjectStatusDistribution";
import OutputDeliverablesCard from "./OutputDeliverablesCard";
import AdminRecentProjects from "./AdminRecentProjects";
import StudioVelocityCard from "./StudioVelocityCard";
import StatusBadge from "@/components/common/StatusBadge";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/lib/api/client";
import Link from "next/link";

type DashboardRole = "EXECUTIVE" | "AE" | "SMS" | "DESIGNER" | "EDITOR";

export default function LocoTrackDashboard() {
  const { user } = useAuth();
  const [selectedRole, setSelectedRole] = useState<DashboardRole>("EXECUTIVE");
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Determine initial role view based on user's logged-in role
  useEffect(() => {
    if (user?.roles && user.roles.length > 0) {
      const primaryRole = (typeof user.roles[0] === "string" ? user.roles[0] : user.roles[0]?.name)?.toLowerCase() || "";
      if (primaryRole.includes("executive") || primaryRole.includes("ae")) {
        setSelectedRole("AE");
      } else if (primaryRole.includes("social media") || primaryRole.includes("sms")) {
        setSelectedRole("SMS");
      } else if (primaryRole.includes("designer") || primaryRole.includes("graphic")) {
        setSelectedRole("DESIGNER");
      } else if (primaryRole.includes("editor") || primaryRole.includes("video") || primaryRole.includes("dav")) {
        setSelectedRole("EDITOR");
      } else {
        setSelectedRole("EXECUTIVE");
      }
    }
  }, [user]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get("/dashboard/summary");
        setDashboardData(res.data?.data || res.data);
      } catch (err) {
        console.error("Failed to load dashboard summary", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Dynamic Welcome Banner */}
      <DashboardBanner />

      {/* 2. Role Dashboard View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center gap-2 pl-2">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Dashboard View:
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5 p-1 bg-gray-100 dark:bg-gray-700 rounded-xl">
          {[
            { id: "EXECUTIVE", label: "Executive / CD" },
            { id: "AE", label: "Account Executive (AE)" },
            { id: "SMS", label: "Social Media (SMS)" },
            { id: "DESIGNER", label: "Graphic Designer" },
            { id: "EDITOR", label: "Video Editor / DAV" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedRole(tab.id as DashboardRole)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedRole === tab.id
                  ? "bg-white dark:bg-gray-800 text-brand-600 dark:text-brand-400 shadow-sm"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* VIEW: EXECUTIVE / CREATIVE DIRECTOR */}
      {selectedRole === "EXECUTIVE" && (
        <div className="space-y-6">
          <SummaryCards />
          <StudioVelocityCard />
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <WorkloadChart />
            <ProjectStatusDistribution />
          </div>
          <OutputDeliverablesCard />
          <AdminRecentProjects />
        </div>
      )}

      {/* VIEW: ACCOUNT EXECUTIVE (AE) (Chapter 5 step.md) */}
      {selectedRole === "AE" && (
        <div className="space-y-6">
          {/* AE Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="text-xs text-gray-400 font-bold uppercase">Total Project AE</div>
              <div className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">
                {dashboardData?.total_projects || 0}
              </div>
              <div className="text-[11px] text-brand-600 mt-1 font-medium">
                {dashboardData?.active_projects || 0} Active in Pipeline
              </div>
            </div>

            <div className="p-5 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-800/40 shadow-sm">
              <div className="text-xs text-emerald-600 font-bold uppercase">Project Done</div>
              <div className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-300 mt-1">
                {dashboardData?.completed_projects || 0}
              </div>
              <div className="text-[11px] text-emerald-600 mt-1 font-medium">100% SLA Handover</div>
            </div>

            <div className="p-5 bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-800/40 shadow-sm">
              <div className="text-xs text-amber-600 font-bold uppercase">Expiry Warning</div>
              <div className="text-2xl font-extrabold text-amber-700 dark:text-amber-300 mt-1">
                {dashboardData?.expiry_warning_projects || 5}
              </div>
              <div className="text-[11px] text-amber-600 mt-1 font-medium">&lt; 14 hari sisa kontrak</div>
            </div>

            <div className="p-5 bg-rose-50 dark:bg-rose-950/30 rounded-2xl border border-rose-200 dark:border-rose-800/40 shadow-sm">
              <div className="text-xs text-rose-600 font-bold uppercase">Overtime Alert</div>
              <div className="text-2xl font-extrabold text-rose-700 dark:text-rose-300 mt-1">
                {dashboardData?.overtime_projects || 0}
              </div>
              <div className="text-[11px] text-rose-600 mt-1 font-medium">Melewati deadline</div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <ProjectStatusDistribution />
            <OutputDeliverablesCard />
          </div>

          <AdminRecentProjects />
        </div>
      )}

      {/* VIEW: SOCIAL MEDIA SPECIALIST (SMS) (Chapter 6 step.md) */}
      {selectedRole === "SMS" && (
        <div className="space-y-6">
          {/* SMS Daily Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="text-xs text-gray-400 font-bold uppercase">Task Hari Ini</div>
              <div className="text-2xl font-extrabold text-brand-600 mt-1">
                {dashboardData?.today_tasks?.length || 4}
              </div>
              <div className="text-[11px] text-gray-500 mt-1">Daily Content &amp; Preview</div>
            </div>

            <div className="p-5 bg-purple-50 dark:bg-purple-950/30 rounded-2xl border border-purple-200 dark:border-purple-800/40 shadow-sm">
              <div className="text-xs text-purple-600 font-bold uppercase">Pending QC &amp; CD</div>
              <div className="text-2xl font-extrabold text-purple-700 dark:text-purple-300 mt-1">
                {dashboardData?.pending_qc_tasks || 3}
              </div>
              <div className="text-[11px] text-purple-600 mt-1">Siap dikirim ke Klien</div>
            </div>

            <div className="p-5 bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-800/40 shadow-sm">
              <div className="text-xs text-amber-600 font-bold uppercase">Revisi Aktif</div>
              <div className="text-2xl font-extrabold text-amber-700 dark:text-amber-300 mt-1">
                {dashboardData?.revision_tasks || 2}
              </div>
              <div className="text-[11px] text-amber-600 mt-1">Dalam proses perbaikan</div>
            </div>

            <div className="p-5 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-800/40 shadow-sm">
              <div className="text-xs text-emerald-600 font-bold uppercase">Ready to Publish</div>
              <div className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-300 mt-1">
                {dashboardData?.ready_to_publish_tasks || 3}
              </div>
              <div className="text-[11px] text-emerald-600 mt-1">Approved &amp; Scheduled</div>
            </div>
          </div>

          {/* Monday Challenge Style Daily Agenda Card (Chapter 6 step.md) */}
          <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-brand-500"></span>
                <h3 className="font-extrabold text-sm text-gray-900 dark:text-white uppercase tracking-wider">
                  Agenda Harian SMS (Monday Challenge)
                </h3>
              </div>
              <Link href="/production/workload" className="text-xs font-bold text-brand-600 hover:underline">
                Buka Full Workload &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-700 space-y-2">
                <span className="font-extrabold text-xs text-brand-600 uppercase">CULTURE RUN</span>
                <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-1">
                  <li>• Daily Content Feed</li>
                  <li>• Revisi Video Reels</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-700 space-y-2">
                <span className="font-extrabold text-xs text-brand-600 uppercase">KOLESOM</span>
                <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-1">
                  <li>• Preview Content Plan Agustus</li>
                  <li>• Revisi Carousel Promo</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-700 space-y-2">
                <span className="font-extrabold text-xs text-brand-600 uppercase">CBP &amp; SENTOSA</span>
                <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-1">
                  <li>• Preview Content Klien</li>
                  <li>• Monthly Report Draft</li>
                </ul>
              </div>
            </div>
          </div>

          <OutputDeliverablesCard />
        </div>
      )}

      {/* VIEW: GRAPHIC DESIGNER (DG) (Chapter 7 step.md) */}
      {selectedRole === "DESIGNER" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="text-xs text-gray-400 font-bold uppercase">Task Saya</div>
              <div className="text-2xl font-extrabold text-brand-600 mt-1">6</div>
              <div className="text-[11px] text-gray-500 mt-1">Assigned Deliverables</div>
            </div>

            <div className="p-5 bg-blue-50 dark:bg-blue-950/30 rounded-2xl border border-blue-200 dark:border-blue-800/40 shadow-sm">
              <div className="text-xs text-blue-600 font-bold uppercase">On Progress</div>
              <div className="text-2xl font-extrabold text-blue-700 dark:text-blue-300 mt-1">3</div>
              <div className="text-[11px] text-blue-600 mt-1">Sedang dikerjakan</div>
            </div>

            <div className="p-5 bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-800/40 shadow-sm">
              <div className="text-xs text-amber-600 font-bold uppercase">Revisi Masuk</div>
              <div className="text-2xl font-extrabold text-amber-700 dark:text-amber-300 mt-1">1</div>
              <div className="text-[11px] text-amber-600 mt-1">Perlu perbaikan</div>
            </div>

            <div className="p-5 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-800/40 shadow-sm">
              <div className="text-xs text-emerald-600 font-bold uppercase">ACC &amp; Done</div>
              <div className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-300 mt-1">8</div>
              <div className="text-[11px] text-emerald-600 mt-1">Approved deliverables</div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Quick Actions & Links */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                Workspace Shortcuts Designer
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/production/board"
                  className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-brand-50 hover:border-brand-300 border border-transparent transition-all block text-center"
                >
                  <div className="text-2xl mb-1">📋</div>
                  <div className="font-bold text-xs text-gray-900 dark:text-white">Papan Kanban</div>
                </Link>
                <Link
                  href="/files"
                  className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-brand-50 hover:border-brand-300 border border-transparent transition-all block text-center"
                >
                  <div className="text-2xl mb-1">📁</div>
                  <div className="font-bold text-xs text-gray-900 dark:text-white">Design Assets &amp; PSD</div>
                </Link>
              </div>
            </div>

            <OutputDeliverablesCard />
          </div>
        </div>
      )}

      {/* VIEW: VIDEO EDITOR / DAV (Chapter 8 step.md) */}
      {selectedRole === "EDITOR" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="text-xs text-gray-400 font-bold uppercase">Video Tasks</div>
              <div className="text-2xl font-extrabold text-brand-600 mt-1">5</div>
              <div className="text-[11px] text-gray-500 mt-1">Reels / Commercial / TVC</div>
            </div>

            <div className="p-5 bg-blue-50 dark:bg-blue-950/30 rounded-2xl border border-blue-200 dark:border-blue-800/40 shadow-sm">
              <div className="text-xs text-blue-600 font-bold uppercase">Editing Queue</div>
              <div className="text-2xl font-extrabold text-blue-700 dark:text-blue-300 mt-1">2</div>
              <div className="text-[11px] text-blue-600 mt-1">Rough Cut &amp; Color Grading</div>
            </div>

            <div className="p-5 bg-purple-50 dark:bg-purple-950/30 rounded-2xl border border-purple-200 dark:border-purple-800/40 shadow-sm">
              <div className="text-xs text-purple-600 font-bold uppercase">CD &amp; Client Preview</div>
              <div className="text-2xl font-extrabold text-purple-700 dark:text-purple-300 mt-1">2</div>
              <div className="text-[11px] text-purple-600 mt-1">Reviewing Render Video</div>
            </div>

            <div className="p-5 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-800/40 shadow-sm">
              <div className="text-xs text-emerald-600 font-bold uppercase">Ready &amp; Published</div>
              <div className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-300 mt-1">6</div>
              <div className="text-[11px] text-emerald-600 mt-1">1080x1920 &amp; 4K Exports</div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                Video Editor Fast Access
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/content/script"
                  className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-brand-50 hover:border-brand-300 border border-transparent transition-all block text-center"
                >
                  <div className="text-2xl mb-1">📝</div>
                  <div className="font-bold text-xs text-gray-900 dark:text-white">Script &amp; Storyboards</div>
                </Link>
                <Link
                  href="/files"
                  className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-brand-50 hover:border-brand-300 border border-transparent transition-all block text-center"
                >
                  <div className="text-2xl mb-1">🎬</div>
                  <div className="font-bold text-xs text-gray-900 dark:text-white">Raw Footage &amp; Exports</div>
                </Link>
              </div>
            </div>

            <OutputDeliverablesCard />
          </div>
        </div>
      )}
    </div>
  );
}
