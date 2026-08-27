import React from "react";
import EmptyState from "@/components/common/EmptyState";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Additional Load | LOCO TRACK",
  description: "Manage additional client requests, revisions, and extra scope tasks",
};

export default function AdditionalLoadPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Additional Load &amp; Out-of-Scope Requests
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Pencatatan permintaan tambahan di luar kontrak, estimasi biaya ekstra, dan alokasi tim
          </p>
        </div>
      </div>

      <EmptyState
        title="Modul Additional Load (Tahap 2)"
        message="Fitur tracking permintaan tambahan dan perhitungan cost add-on sedang disiapkan untuk rilis tahap berikutnya."
      />
    </div>
  );
}
