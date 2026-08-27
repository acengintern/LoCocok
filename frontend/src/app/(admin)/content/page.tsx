import React from "react";
import EmptyState from "@/components/common/EmptyState";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Content Planning Hub | LOCO TRACK",
  description: "Overview of creative briefs, content matrices, and ideation",
};

export default function ContentPlanningHubPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Content Planning Hub
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Pusat operasional perencanaan konten dan ideation kreatif kampanye
          </p>
        </div>
      </div>

      <EmptyState
        title="Content Planning Hub (Tahap 2)"
        message="Fitur ringkasan pipeline konten terintegrasi sedang disiapkan untuk rilis tahap berikutnya."
      />
    </div>
  );
}
