import React from "react";
import EmptyState from "@/components/common/EmptyState";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reports & Analytics | LOCO TRACK",
  description: "Performance metrics, workload reports, and financial summaries",
};

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Reports &amp; Analytics
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Laporan efisiensi SLA pengerjaan, throughput tim, dan ringkasan performa finansial
          </p>
        </div>
      </div>

      <EmptyState
        title="Modul Reports & Analytics (Tahap 2)"
        message="Fitur ekspor laporan PDF/Excel dan grafik analytics performa sedang disiapkan untuk rilis tahap berikutnya."
      />
    </div>
  );
}
