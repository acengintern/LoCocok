"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

interface ActionItem {
  label: string;
  href: string;
  isPrimary?: boolean;
  icon?: React.ReactNode;
}

export default function DashboardBanner() {
  const { user } = useAuth();

  const { greeting, formattedDate } = useMemo(() => {
    const now = new Date();
    const hour = now.getHours();

    let greetingText = "Selamat Datang";
    if (hour >= 5 && hour < 12) greetingText = "Selamat Pagi";
    else if (hour >= 12 && hour < 16) greetingText = "Selamat Siang";
    else if (hour >= 16 && hour < 19) greetingText = "Selamat Sore";
    else greetingText = "Selamat Malam";

    const dateStr = now.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    return { greeting: greetingText, formattedDate: dateStr };
  }, []);

  const primaryRoleName = useMemo(() => {
    if (!user?.roles || user.roles.length === 0) return "Team Member";
    const firstRole = user.roles[0];
    return typeof firstRole === "string" ? firstRole : firstRole?.name || "Team Member";
  }, [user]);

  const displayName = user?.name || "Pengguna";

  // Action buttons based on role
  const quickActions: ActionItem[] = useMemo(() => {
    const roleLower = primaryRoleName.toLowerCase();

    if (roleLower.includes("admin") || roleLower.includes("system")) {
      return [
        {
          label: "New Project",
          href: "/projects",
          isPrimary: true,
          icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          ),
        },
        { label: "Clients", href: "/administration/clients" },
        { label: "Team Workload", href: "/production/workload" },
        { label: "Calendar", href: "/projects/calendar" },
      ];
    }

    if (roleLower.includes("account executive") || roleLower.includes("ae")) {
      return [
        {
          label: "New Project",
          href: "/projects",
          isPrimary: true,
          icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          ),
        },
        { label: "My Projects", href: "/projects/my" },
        { label: "Clients", href: "/administration/clients" },
        { label: "Calendar", href: "/projects/calendar" },
      ];
    }

    return [
      {
        label: "My Tasks",
        href: "/production/tasks",
        isPrimary: true,
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        ),
      },
      { label: "My Projects", href: "/projects/my" },
      { label: "Project Calendar", href: "/projects/calendar" },
    ];
  }, [primaryRoleName]);

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Left: Greeting & User Role */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-md bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700 dark:bg-brand-500/10 dark:text-brand-400">
            {primaryRoleName}
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500">&bull;</span>
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            {formattedDate}
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          {greeting}, {displayName}
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          Ringkasan operasional dan progres campaign agensi hari ini
        </p>
      </div>

      {/* Right: Quick Actions */}
      <div className="flex flex-wrap items-center gap-2">
        {quickActions.map((action, idx) =>
          action.isPrimary ? (
            <Link
              key={idx}
              href={action.href}
              className="inline-flex h-9.5 items-center gap-1.5 rounded-xl bg-brand-500 px-4 text-xs sm:text-sm font-semibold text-white shadow-theme-xs hover:bg-brand-600 active:scale-[0.98] transition-all cursor-pointer"
            >
              {action.icon}
              <span>{action.label}</span>
            </Link>
          ) : (
            <Link
              key={idx}
              href={action.href}
              className="inline-flex h-9.5 items-center rounded-xl border border-gray-200 bg-white px-3 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-300 dark:hover:bg-white/[0.06] shadow-theme-xs transition-colors"
            >
              <span>{action.label}</span>
            </Link>
          )
        )}
      </div>
    </div>
  );
}
