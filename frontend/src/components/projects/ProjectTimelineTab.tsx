"use client";

import React, { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api/client";
import StatusBadge from "@/components/common/StatusBadge";

interface ProjectTimelineTabProps {
  projectId: string;
}

export default function ProjectTimelineTab({ projectId }: ProjectTimelineTabProps) {
  const [project, setProject] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTimelineData = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, tRes] = await Promise.all([
        apiClient.get(`/projects/${projectId}`),
        apiClient.get(`/projects/${projectId}/tasks`),
      ]);

      setProject(pRes.data?.data || pRes.data);
      const taskData = tRes.data?.data?.data || tRes.data?.data || tRes.data || [];
      setTasks(Array.isArray(taskData) ? taskData : []);
    } catch (error) {
      console.error("Failed to load project timeline", error);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchTimelineData();
  }, [fetchTimelineData]);

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (!project) return null;

  const today = new Date();
  const endDate = project.end_date ? new Date(project.end_date) : null;
  const remainingDays = endDate ? Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 3600 * 24)) : null;
  const isOvertime = endDate && today > endDate && project.status !== "DONE";

  return (
    <div className="space-y-6">
      {/* Project Schedule Overview Card */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Project Schedule &amp; Milestone Timeline
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Rentang pengerjaan: {project.start_date || "-"} &rarr; {project.end_date || "-"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isOvertime ? (
              <span className="bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 text-xs font-bold px-2.5 py-1 rounded-lg">
                OVERTIME
              </span>
            ) : remainingDays !== null && remainingDays <= 14 ? (
              <span className="bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 text-xs font-bold px-2.5 py-1 rounded-lg">
                EXPIRY WARNING ({remainingDays}d)
              </span>
            ) : (
              <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 text-xs font-bold px-2.5 py-1 rounded-lg">
                ON SCHEDULE ({remainingDays}d remaining)
              </span>
            )}
            <StatusBadge status={project.status} />
          </div>
        </div>

        {/* Milestone Steps */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-2">
          {[
            { label: "1. Brief", done: true },
            { label: "2. Content Plan", done: ["CONTENT_PLANNING", "SCRIPT_READY", "DESIGN", "EDITING", "QC_INTERNAL", "CLIENT_REVIEW", "APPROVED", "PUBLISHED", "DONE"].includes(project.status) },
            { label: "3. Production", done: ["DESIGN", "EDITING", "QC_INTERNAL", "CLIENT_REVIEW", "APPROVED", "PUBLISHED", "DONE"].includes(project.status) },
            { label: "4. QC Internal", done: ["QC_INTERNAL", "CLIENT_REVIEW", "APPROVED", "PUBLISHED", "DONE"].includes(project.status) },
            { label: "5. Client Review", done: ["CLIENT_REVIEW", "APPROVED", "PUBLISHED", "DONE"].includes(project.status) },
            { label: "6. Published / Done", done: ["APPROVED", "PUBLISHED", "DONE"].includes(project.status) },
          ].map((step, idx) => (
            <div
              key={step.label}
              className={`p-2.5 rounded-xl border text-center text-xs font-semibold ${
                step.done
                  ? "bg-brand-50 border-brand-200 text-brand-700 dark:bg-brand-950/40 dark:border-brand-800 dark:text-brand-300"
                  : "bg-gray-50 border-gray-200 text-gray-400 dark:bg-gray-800 dark:border-gray-700"
              }`}
            >
              {step.label}
            </div>
          ))}
        </div>
      </div>

      {/* Task Schedule Breakdown */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">
          Deliverable Tasks Timeline
        </h3>

        {tasks.length === 0 ? (
          <div className="p-6 text-center text-xs text-gray-400">
            Belum ada task yang terdaftar pada project ini.
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="p-3.5 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-brand-600">{task.task_no}</span>
                    <span className="font-semibold text-xs text-gray-900 dark:text-white">{task.title}</span>
                  </div>
                  <div className="text-[11px] text-gray-400 mt-0.5">
                    Deadline: {task.due_date ? task.due_date.split("T")[0] : "-"} | Priority: {task.priority}
                  </div>
                </div>

                <StatusBadge status={task.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
