import os
import shutil

base_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "src")

# 1. Routing Structure
routes = [
    "dashboard",
    "projects",
    "projects/[id]",
    "production",
    "production/tasks",
    "production/workload",
    "production/additional-load",
    "production/approval-queue",
    "production/board",
    "content",
    "content/brief",
    "content/content-plan",
    "content/script",
    "timeline",
    "reports",
    "files",
    "activity-log",
    "administration",
    "administration/users",
    "administration/roles",
    "administration/clients",
    "administration/teams",
    "administration/master-data",
    "administration/settings"
]

admin_dir = os.path.join(base_dir, "app", "(admin)")
os.makedirs(admin_dir, exist_ok=True)

page_template = '''import React from "react";
import EmptyState from "@/components/common/EmptyState";

export default function Page() {
  return (
    <div className="flex flex-col gap-6">
      <EmptyState title="Coming in Phase 2" message="This module is under construction." />
    </div>
  );
}
'''

for route in routes:
    route_path = os.path.join(admin_dir, os.path.normpath(route))
    os.makedirs(route_path, exist_ok=True)
    with open(os.path.join(route_path, "page.tsx"), "w", encoding="utf-8") as f:
        f.write(page_template)

# 2. Components Structure
components = ["common", "dashboard", "projects", "production", "content", "reports", "ui"]
for comp in components:
    os.makedirs(os.path.join(base_dir, "components", comp), exist_ok=True)

# 3. EmptyState Component
empty_state_path = os.path.join(base_dir, "components", "common", "EmptyState.tsx")
empty_state_code = '''import React from "react";
import { PageIcon } from "@/icons";

interface EmptyStateProps {
  title: string;
  message: string;
}

export default function EmptyState({ title, message }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900 shadow-sm">
      <div className="w-16 h-16 mb-4 text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
        <PageIcon />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-500 dark:text-gray-400">{message}</p>
    </div>
  );
}
'''
with open(empty_state_path, "w", encoding="utf-8") as f:
    f.write(empty_state_code)

# 4. API Abstraction
api_dir = os.path.join(base_dir, "lib", "api")
os.makedirs(api_dir, exist_ok=True)
with open(os.path.join(api_dir, "client.ts"), "w", encoding="utf-8") as f:
    f.write('''export const apiClient = async (endpoint: string, options: RequestInit = {}) => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
  const response = await fetch(${baseUrl}, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  if (!response.ok) {
    throw new Error("API request failed");
  }
  return response.json();
};
''')

# 5. Types Foundation
types_dir = os.path.join(base_dir, "types")
os.makedirs(types_dir, exist_ok=True)
type_files = ["auth.ts", "user.ts", "project.ts", "task.ts", "client.ts", "content.ts", "workload.ts", "output.ts", "common.ts"]
for t_file in type_files:
    with open(os.path.join(types_dir, t_file), "w", encoding="utf-8") as f:
        f.write("// Type definitions placeholder\n")

# 6. Mock Data
mock_dir = os.path.join(base_dir, "lib", "mock")
os.makedirs(mock_dir, exist_ok=True)
with open(os.path.join(mock_dir, "dashboard.ts"), "w", encoding="utf-8") as f:
    f.write('''export const mockDashboardStats = {
  totalProject: 53,
  activeProject: 20,
  done: 33,
  overdue: 3,
  overtime: 8,
  expiryWarning: 5,
  pendingQC: 12,
  pendingApproval: 7,
};
''')

print("Scaffolding complete.")
