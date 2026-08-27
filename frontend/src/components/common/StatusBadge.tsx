import React from "react";

type StatusType = "success" | "warning" | "danger" | "info" | "default";

interface StatusBadgeProps {
  status: string;
  type?: StatusType;
}

const getStatusType = (status: string): StatusType => {
  const s = status.toLowerCase();
  if (["active", "approved", "success", "completed", "delivered"].includes(s)) return "success";
  if (["pending", "warning", "in progress", "processing"].includes(s)) return "warning";
  if (["danger", "error", "failed", "rejected", "cancelled"].includes(s)) return "danger";
  if (["info", "draft", "new"].includes(s)) return "info";
  return "default";
};

export default function StatusBadge({ status, type }: StatusBadgeProps) {
  const badgeType = type || getStatusType(status);

  const styles = {
    success: "bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-400 border-success-200 dark:border-success-500/20",
    warning: "bg-warning-50 text-warning-700 dark:bg-warning-500/10 dark:text-warning-400 border-warning-200 dark:border-warning-500/20",
    danger: "bg-error-50 text-error-700 dark:bg-error-500/10 dark:text-error-400 border-error-200 dark:border-error-500/20",
    info: "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400 border-brand-200 dark:border-brand-500/20",
    default: "bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[badgeType]}`}
    >
      {status}
    </span>
  );
}
