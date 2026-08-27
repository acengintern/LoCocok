"use client";

import React, { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/client";
import Link from "next/link";

interface OutputItem {
  name: string;
  total_target: number | string;
  total_actual: number | string;
}

export default function OutputDeliverablesCard() {
  const [outputs, setOutputs] = useState<OutputItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiClient.get("/dashboard/summary");
        const summary = response.data?.data ?? response.data;
        setOutputs(summary?.output_deliverables || []);
      } catch {
        // Silently handle error
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03] animate-pulse min-h-[220px]">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  const outputData: OutputItem[] =
    outputs.length > 0
      ? outputs
      : [
          { name: "Short Form Video (Reels/TikTok)", total_target: 30, total_actual: 24 },
          { name: "Static Feeds & Carousels", total_target: 45, total_actual: 40 },
          { name: "Story & Daily Engagement", total_target: 60, total_actual: 58 },
          { name: "Brand Design & Visual Assets", total_target: 15, total_actual: 12 },
        ];

  const totalTarget = outputData.reduce((acc, o) => acc + (Number(o.total_target) || 0), 0);
  const totalActual = outputData.reduce((acc, o) => acc + (Number(o.total_actual) || 0), 0);
  const overallRate = totalTarget > 0 ? Math.round((totalActual / totalTarget) * 100) : 100;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white">
            Deliverables Realization
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Production output realization against monthly client quotas
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-md bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-500/10 dark:text-brand-400">
            {overallRate}% Overall Realized ({totalActual}/{totalTarget})
          </span>
          <Link
            href="/production/tasks"
            className="text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
          >
            All Deliverables &rarr;
          </Link>
        </div>
      </div>

      {/* Deliverables Grid */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {outputData.map((output, idx) => {
          const target = Number(output.total_target) || 0;
          const actual = Number(output.total_actual) || 0;
          const pct = target > 0 ? Math.round((actual / target) * 100) : 0;

          return (
            <div
              key={idx}
              className="flex flex-col justify-between rounded-xl border border-gray-100 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-white/[0.02]"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">
                  {output.name}
                </span>
                <span
                  className={`text-xs font-bold ${
                    pct >= 100
                      ? "text-emerald-600 dark:text-emerald-400"
                      : pct >= 75
                      ? "text-brand-600 dark:text-brand-400"
                      : "text-amber-600 dark:text-amber-400"
                  }`}
                >
                  {pct}%
                </span>
              </div>

              <div className="my-2.5 flex items-baseline gap-1">
                <span className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white font-mono">
                  {actual}
                </span>
                <span className="text-xs text-gray-400 font-mono">/ {target} target</span>
              </div>

              <div className="h-1.5 w-full rounded-full bg-gray-200/80 dark:bg-gray-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    pct >= 100 ? "bg-emerald-500" : pct >= 75 ? "bg-brand-500" : "bg-amber-500"
                  }`}
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
