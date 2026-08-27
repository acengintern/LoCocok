import React from "react";
import EmptyState from "@/components/common/EmptyState";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Script & Ideation | LOCO TRACK",
  description: "Copywriting, video scripts, and creative ideation workspace",
};

export default function ScriptPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Script &amp; Creative Ideation
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Penyusunan naskah video/audio, storyboard, ideation hook, dan copywriting
          </p>
        </div>
      </div>

      <EmptyState
        title="Modul Script & Ideation (Tahap 2)"
        message="Fitur penulisan script kolaboratif, storyboard builder, dan copy approval sedang disiapkan untuk rilis tahap berikutnya."
      />
    </div>
  );
}
