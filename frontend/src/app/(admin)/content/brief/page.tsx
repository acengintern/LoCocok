import React from "react";
import EmptyState from "@/components/common/EmptyState";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Client Briefs | LOCO TRACK",
  description: "Creative briefs and requirements for client campaigns",
};

export default function BriefsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Briefs &amp; Creative Direction
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Kumpulan dokumen brief, brand guidelines, dan arahan kreatif kampanye klien
          </p>
        </div>
      </div>

      <EmptyState
        title="Modul Briefs (Tahap 2)"
        message="Fitur manajemen brief dan template creative direction sedang disiapkan untuk rilis tahap berikutnya."
      />
    </div>
  );
}
