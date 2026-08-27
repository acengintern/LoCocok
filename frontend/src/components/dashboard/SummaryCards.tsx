"use client";

import React, { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/client";
import { useSettings } from "@/hooks/useSettings";
import Link from "next/link";

interface SummaryData {
  total_projects?: number;
  active_projects?: number;
  completed_projects?: number;
  total_clients?: number;
  revenue?: number;
  pending_approvals?: number;
  task_metrics?: {
    total: number;
    completed: number;
    rate: number;
  };
}

export default function SummaryCards() {
  const { formatCurrency } = useSettings();
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await apiClient.get("/dashboard/summary");
        setData(response.data?.data ?? response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch summary");
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03] animate-pulse h-32"
          >
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-3"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-4 bg-error-50 border border-error-200 text-error-600 rounded-xl text-sm dark:bg-error-950/20 dark:border-error-800/40">
        {error || "Failed to load summary metrics"}
      </div>
    );
  }

  const totalProj = data.total_projects || 0;
  const activeProj = data.active_projects || 0;
  const completedProj = data.completed_projects || 0;
  const pendingApprovals = data.pending_approvals || 0;
  const totalClients = data.total_clients || 0;

  const cards = [
    {
      title: "Active Projects",
      value: activeProj,
      subtitle: `${totalProj} total projects recorded`,
      badge: "In Production",
      badgeColor: "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400",
      href: "/projects",
      icon: (
        <svg className="w-5 h-5 text-brand-600 dark:text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
      ),
    },
    {
      title: "Client Accounts",
      value: totalClients,
      subtitle: "Active retained brand partners",
      badge: "Clients",
      badgeColor: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
      href: "/administration/clients",
      icon: (
        <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      title: "Pipeline Revenue",
      value: formatCurrency(data.revenue),
      subtitle: "Contract & campaign value",
      badge: "Verified",
      badgeColor: "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400",
      href: "/projects",
      icon: (
        <svg className="w-5 h-5 text-sky-600 dark:text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: "Deliverables Completed",
      value: completedProj,
      subtitle: `${pendingApprovals} tasks in review queue`,
      badge: pendingApprovals > 0 ? `${pendingApprovals} In QC` : "On Schedule",
      badgeColor: "bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400",
      href: "/production/tasks",
      icon: (
        <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {cards.map((card, idx) => (
        <Link
          key={idx}
          href={card.href}
          className="group relative flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs transition-all hover:border-gray-300 hover:shadow-theme-md dark:border-gray-800 dark:bg-white/[0.03] dark:hover:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {card.title}
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-50 dark:bg-white/[0.05] group-hover:scale-105 transition-transform">
              {card.icon}
            </div>
          </div>

          <div className="my-3">
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white truncate">
              {card.value}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800 text-xs">
            <span className="text-gray-500 dark:text-gray-400 truncate">
              {card.subtitle}
            </span>
            <span className={`shrink-0 rounded-md px-2 py-0.5 font-medium ${card.badgeColor}`}>
              {card.badge}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
