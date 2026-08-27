"use client";
import React, { useState } from "react";
import RolesClient from "./RolesClient";
import PermissionsClient from "../permissions/PermissionsClient";

export type RolesPermissionsTab = "roles" | "permissions";

interface RolesPermissionsPageProps {
  initialTab?: RolesPermissionsTab;
}

export default function RolesPermissionsPage({ initialTab = "roles" }: RolesPermissionsPageProps) {
  const [activeTab, setActiveTab] = useState<RolesPermissionsTab>(initialTab);

  const tabs = [
    { id: "roles" as const, name: "Roles" },
    { id: "permissions" as const, name: "Permission Matrix" },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Page heading */}
      <div className="flex flex-col gap-1">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-white/90">
          Roles &amp; Permissions
        </h2>
        <p className="text-theme-sm text-gray-500 dark:text-gray-400">
          Manage system roles and configure fine-grained permissions per role.
        </p>
      </div>

      {/* Underline Tabs Navigation with border-bottom */}
      <div className="border-b border-gray-200 dark:border-gray-800">
        <nav className="-mb-px flex space-x-6 sm:space-x-8 overflow-x-auto no-scrollbar" aria-label="Roles & Permissions Tabs">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
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

      {/* Tab content */}
      <div className="min-w-0 w-full">
        {activeTab === "roles" ? <RolesClient /> : <PermissionsClient />}
      </div>
    </div>
  );
}

