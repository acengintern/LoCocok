"use client";

import React, { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/client";
import Link from "next/link";

export default function ProjectStatusDistribution() {
  const [distribution, setDistribution] = useState<Record<string, number>>({});
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiClient.get("/dashboard/summary");
        const summary = response.data?.data ?? response.data;
        const dist = summary?.status_distribution || {};
        setDistribution(dist);
        const sum = Object.values(dist).reduce(
          (acc: number, curr: any) => acc + (Number(curr) || 0),
          0
        );
        setTotal(sum || 0);
      } catch {
        // Silently handle error
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stages = [
    {
      key: "PRE_PROD",
      title: "Pre-Production",
      subtitle: "Briefs, Content Plans & Scripts",
      barColor: "bg-sky-500",
      dotColor: "bg-sky-500",
      statuses: ["CONTENT_PLANNING", "SCRIPT_READY", "BRIEF"],
    },
    {
      key: "EXECUTION",
      title: "Active Production",
      subtitle: "Graphic Design & Video Editing",
      barColor: "bg-brand-500",
      dotColor: "bg-brand-500",
      statuses: ["DESIGN", "EDITING", "PRODUCTION", "IN_PROGRESS"],
    },
    {
      key: "REVIEW_QC",
      title: "Review & Revisions",
      subtitle: "Internal Director QC & Revisions",
      barColor: "bg-amber-500",
      dotColor: "bg-amber-500",
      statuses: ["QC_INTERNAL", "REVISION", "CLIENT_REVIEW", "HOLD"],
    },
    {
      key: "DELIVERED",
      title: "Completed & Published",
      subtitle: "Approved & Live Deliverables",
      barColor: "bg-emerald-500",
      dotColor: "bg-emerald-500",
      statuses: ["DONE", "APPROVED", "PUBLISHED", "COMPLETED"],
    },
  ];

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03] animate-pulse min-h-[360px]">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6"></div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  const stageStats = stages.map((stage) => {
    const count = stage.statuses.reduce((sum, statusKey) => {
      return sum + (Number(distribution[statusKey]) || 0);
    }, 0);
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    return { ...stage, count, pct };
  });

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Project Pipeline Stages
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Live progression across creative workflow stages
            </p>
          </div>
          <Link
            href="/projects"
            className="text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
          >
            {total} Total &rarr;
          </Link>
        </div>

        {/* Combined Segmented Pipeline Bar */}
        <div className="my-5">
          <div className="flex h-3 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800 p-0.5 gap-1">
            {stageStats.map((st) => (
              <div
                key={st.key}
                className={`h-full rounded-full ${st.barColor} transition-all duration-500`}
                style={{ width: `${Math.max(st.pct, st.count > 0 ? 8 : 0)}%` }}
                title={`${st.title}: ${st.count} projects (${st.pct}%)`}
              />
            ))}
          </div>
        </div>

        {/* Stages Breakdown List */}
        <div className="flex flex-col gap-2.5">
          {stageStats.map((stage) => (
            <div
              key={stage.key}
              className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/50 p-3 dark:border-gray-800 dark:bg-white/[0.02] hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className={`h-2.5 w-2.5 rounded-full ${stage.dotColor} shrink-0`} />
                <div>
                  <h4 className="text-xs font-semibold text-gray-900 dark:text-white">
                    {stage.title}
                  </h4>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    {stage.subtitle}
                  </p>
                </div>
              </div>

              <div className="text-right flex items-baseline gap-2">
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {stage.count}
                </span>
                <span className="text-xs text-gray-400 font-medium w-8 text-right">
                  {stage.pct}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
