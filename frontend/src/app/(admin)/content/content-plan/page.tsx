import React from "react";
import EmptyState from "@/components/common/EmptyState";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Content Plans | LOCO TRACK",
  description: "Editorial calendar and content planning matrix",
};

export default function ContentPlanPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Content Plans &amp; Editorial Matrix
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Perencanaan pilar konten, jadwal posting feed/reels/story, dan matriks distribusi
          </p>
        </div>
      </div>

      <EmptyState
        title="Modul Content Plans (Tahap 2)"
        message="Fitur kalender editorial dan matriks pilar konten sedang disiapkan untuk rilis tahap berikutnya."
      />
    </div>
  );
}
