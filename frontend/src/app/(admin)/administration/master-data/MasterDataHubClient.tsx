"use client";

import React, { useState } from "react";
import MasterDataCrud from "@/components/master-data/MasterDataCrud";

export type MasterDataTab =
  | "project-types"
  | "output-types"
  | "task-types"
  | "file-types"
  | "teams";

interface MasterDataHubClientProps {
  initialTab?: MasterDataTab;
}

export default function MasterDataHubClient({ initialTab = "project-types" }: MasterDataHubClientProps) {
  const [activeTab, setActiveTab] = useState<MasterDataTab>(initialTab);

  const tabs = [
    { id: "project-types" as const, name: "Project Types", endpoint: "project-types" },
    { id: "output-types" as const, name: "Output Types", endpoint: "output-types" },
    { id: "task-types" as const, name: "Task Types", endpoint: "task-types" },
    { id: "file-types" as const, name: "File Types", endpoint: "file-types" },
    { id: "teams" as const, name: "Teams & Departments", endpoint: "teams" },
  ];

  const currentTab = tabs.find((t) => t.id === activeTab) || tabs[0];

  return (
    <div className="flex flex-col gap-6">
      {/* Underline Tabs Navigation with border-bottom */}
      <div className="border-b border-gray-200 dark:border-gray-800">
        <nav className="-mb-px flex space-x-6 sm:space-x-8 overflow-x-auto no-scrollbar" aria-label="Master Data Tabs">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap border-b-2 py-3.5 px-1 text-sm font-medium transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "border-brand-500 text-brand-500 font-semibold dark:border-brand-400 dark:text-brand-400"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-700 dark:hover:text-gray-200"
                }`}
              >
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Active Tab Content */}
      <div className="min-w-0">
        <MasterDataCrud
          key={currentTab.id}
          title={currentTab.name}
          endpoint={currentTab.endpoint}
        />
      </div>
    </div>
  );
}

