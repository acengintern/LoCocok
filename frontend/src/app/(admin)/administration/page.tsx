import React from "react";
import EmptyState from "@/components/common/EmptyState";

export default function Page() {
  return (
    <div className="flex flex-col gap-6">
      <EmptyState title="Coming in Phase 2" message="This module is under construction." />
    </div>
  );
}
