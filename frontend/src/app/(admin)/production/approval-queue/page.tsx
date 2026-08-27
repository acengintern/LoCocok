import React from "react";
import EmptyState from "@/components/common/EmptyState";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Approval Queue | LOCO TRACK",
  description: "Internal QC and client approval management queue",
};

export default function ApprovalQueuePage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Approval Queue &amp; QC Internal
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Antrean verifikasi output desain dan video sebelum dikirimkan untuk review klien
          </p>
        </div>
      </div>

      <EmptyState
        title="Modul Approval Queue (Tahap 2)"
        message="Fitur pipeline approval bertingkat dan approval token client link sedang disiapkan untuk rilis tahap berikutnya."
      />
    </div>
  );
}
