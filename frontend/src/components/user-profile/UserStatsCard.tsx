"use client";
import React, { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/client";
import { UserStats } from "@/types/api";

export default function UserStatsCard() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchStats() {
      try {
        const res = await apiClient.get("/users/me/stats");
        if (isMounted && res.data?.data) {
          setStats(res.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch user stats:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchStats();

    return () => {
      isMounted = false;
    };
  }, []);

  const totalProjects = stats?.total_projects ?? 0;
  const totalTasks = stats?.total_tasks ?? 0;
  const completedTasks = stats?.completed_tasks ?? 0;
  const pendingTasks = stats?.pending_tasks ?? 0;

  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="p-5 border border-gray-200 rounded-2xl bg-white dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-5">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Workload & Performance Overview
          </h4>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            Live tracking of your active assignments and project deliverable progress
          </p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-28 rounded-xl border border-gray-100 bg-gray-100 dark:border-gray-800 dark:bg-gray-800/40"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Active Projects */}
          <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4.5 dark:border-gray-800 dark:bg-white/[0.02] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Active Projects
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-500 dark:bg-brand-500/10 dark:text-brand-400">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                  />
                </svg>
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white/90">
                {totalProjects}
              </h3>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Assigned or leading projects
              </p>
            </div>
          </div>

          {/* Card 2: Assigned Tasks */}
          <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4.5 dark:border-gray-800 dark:bg-white/[0.02] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Assigned Tasks
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-light-50 text-blue-light-500 dark:bg-blue-light-500/10 dark:text-blue-light-400">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  />
                </svg>
              </div>
            </div>
            <div className="mt-3">
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white/90">
                  {totalTasks}
                </h3>
                {pendingTasks > 0 && (
                  <span className="text-xs font-medium text-warning-600 dark:text-warning-400">
                    ({pendingTasks} pending)
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Total assigned workload
              </p>
            </div>
          </div>

          {/* Card 3: Completed Tasks */}
          <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4.5 dark:border-gray-800 dark:bg-white/[0.02] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Completed Tasks
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-bold text-success-600 dark:text-success-400">
                {completedTasks}
              </h3>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Finished production deliverables
              </p>
            </div>
          </div>

          {/* Card 4: Completion Rate */}
          <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4.5 dark:border-gray-800 dark:bg-white/[0.02] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Completion Rate
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
            </div>
            <div className="mt-3">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white/90">
                  {completionRate}%
                </h3>
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {completedTasks}/{totalTasks}
                </span>
              </div>
              {/* Progress bar */}
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  className="h-full rounded-full bg-brand-500 transition-all duration-500"
                  style={{ width: `${Math.min(completionRate, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
