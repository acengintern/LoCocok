import React from "react";
import EmptyState from "@/components/common/EmptyState";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Production Operations | LOCO TRACK",
  description: "Operations and production pipeline overview",
};

export default function ProductionPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Production Hub
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Pusat operasional eksekusi tugas, workflow approval, dan beban kerja tim
          </p>
        </div>
      </div>

      <EmptyState
        title="Production Hub (Tahap 2)"
        message="Fitur ringkasan eksekutif produksi dan metrik SLA sedang disiapkan untuk rilis tahap berikutnya."
      />
    </div>
  );
}
