import React from "react";
import EmptyState from "@/components/common/EmptyState";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Daily Workload | LOCO TRACK",
  description: "Team capacity and daily workload distribution",
};

export default function WorkloadPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Daily Workload &amp; Team Capacity
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Monitoring kapasitas kerja harian tim produksi (Graphic Designer, Video Editor, Copywriter)
          </p>
        </div>
      </div>

      <EmptyState
        title="Modul Daily Workload (Tahap 2)"
        message="Fitur visualisasi kapasitas harian dan heat-map beban kerja tim sedang disiapkan untuk rilis tahap berikutnya."
      />
    </div>
  );
}
