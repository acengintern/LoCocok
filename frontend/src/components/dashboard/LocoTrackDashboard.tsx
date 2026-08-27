"use client";

import React from "react";
import DashboardBanner from "./DashboardBanner";
import SummaryCards from "./SummaryCards";
import WorkloadChart from "./WorkloadChart";
import ProjectStatusDistribution from "./ProjectStatusDistribution";
import OutputDeliverablesCard from "./OutputDeliverablesCard";
import AdminRecentProjects from "./AdminRecentProjects";

export default function LocoTrackDashboard() {
  return (
    <div className="flex flex-col gap-6">
      {/* 1. Dynamic Role-Aware Welcome Banner */}
      <DashboardBanner />

      {/* 2. Top Summary KPI Cards */}
      <SummaryCards />

      {/* 3. Visual Charts Grid (Workload + Status Distribution) */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <WorkloadChart />
        <ProjectStatusDistribution />
      </div>

      {/* 4. Creative Deliverables Realization Matrix */}
      <OutputDeliverablesCard />

      {/* 5. Recent Active Projects Table */}
      <AdminRecentProjects />
    </div>
  );
}
