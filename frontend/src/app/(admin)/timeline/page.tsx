import React from "react";
import EmptyState from "@/components/common/EmptyState";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Production Timeline | LOCO TRACK",
  description: "Gantt chart timeline and interactive project scheduling",
};

export default function TimelinePage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Production Timeline &amp; Gantt View
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Visualisasi rentang waktu pengerjaan project dan ketergantungan task secara linear
          </p>
        </div>
      </div>

      <EmptyState
        title="Modul Production Timeline (Tahap 2)"
        message="Fitur visualisasi Gantt Chart interaktif dan dependency tracking sedang disiapkan untuk rilis tahap berikutnya."
      />
    </div>
  );
}
