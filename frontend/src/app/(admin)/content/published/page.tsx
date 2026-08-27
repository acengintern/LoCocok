import React from "react";
import EmptyState from "@/components/common/EmptyState";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Published Content | LOCO TRACK",
  description: "Repository of published client content and live link tracking",
};

export default function PublishedContentPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Published Content Archive
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Arsip seluruh konten yang telah tayang di media sosial klien beserta tautan publikasi
          </p>
        </div>
      </div>

      <EmptyState
        title="Modul Published Content (Tahap 2)"
        message="Fitur arsip live links, analitik performa postingan, dan auto-sync media sosial sedang disiapkan untuk rilis tahap berikutnya."
      />
    </div>
  );
}
