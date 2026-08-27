import React from "react";
import EmptyState from "@/components/common/EmptyState";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Media & Files | LOCO TRACK",
  description: "Digital asset management, media library, and version control",
};

export default function FilesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Media &amp; File Asset Library
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Pusat penyimpanan file desain, raw footage, export video, dan versioning aset digital agensi
          </p>
        </div>
      </div>

      <EmptyState
        title="Modul Media & Files (Tahap 2)"
        message="Fitur Digital Asset Management (DAM) terintegrasi dengan Google Drive/S3 sedang disiapkan untuk rilis tahap berikutnya."
      />
    </div>
  );
}
