import React from "react";
import EmptyState from "@/components/common/EmptyState";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Production Board | LOCO TRACK",
  description: "Visual Kanban board for agency production workflow",
};

export default function ProductionBoardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Production Kanban Board
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Papan visual interaktif alur tugas: To Do, In Progress, Review, Revisi, hingga Done
          </p>
        </div>
      </div>

      <EmptyState
        title="Modul Production Board (Tahap 2)"
        message="Fitur drag-and-drop Kanban board interaktif dengan filter multi-tim sedang disiapkan untuk rilis tahap berikutnya."
      />
    </div>
  );
}
