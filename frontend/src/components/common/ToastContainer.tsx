"use client";
import React, { useEffect, useState } from "react";
import { useToast, Toast, ToastVariant } from "@/context/ToastContext";

/* ─── per-variant config matching TailAdmin Alert style ─── */
const cfg: Record<ToastVariant, {
  wrap: string;      // container border colour
  iconBg: string;    // icon circle bg
  iconColor: string; // icon svg colour
  titleColor: string;
  icon: React.ReactNode;
}> = {
  success: {
    wrap:       "border-success-500 bg-success-50 dark:border-success-500/30 dark:bg-success-500/15",
    iconBg:     "bg-success-100 dark:bg-success-500/20",
    iconColor:  "text-success-500",
    titleColor: "text-success-800 dark:text-success-400",
    icon: (
      <svg className="fill-current" width="20" height="20" viewBox="0 0 24 24">
        <path fillRule="evenodd" clipRule="evenodd"
          d="M3.7 12A8.3 8.3 0 0 1 12 3.7 8.3 8.3 0 0 1 20.3 12 8.3 8.3 0 0 1 12 20.3 8.3 8.3 0 0 1 3.7 12ZM12 1.9A10.1 10.1 0 1 0 12 22.1 10.1 10.1 0 0 0 12 1.9Zm3.62-1.41a.9.9 0 0 0-1.27 0l-3.16 3.16-1.54-1.54a.9.9 0 0 0-1.27 1.27l2.17 2.17a.9.9 0 0 0 1.27 0l3.8-3.8a.9.9 0 0 0 0-1.26Z"
        />
        <path fillRule="evenodd" clipRule="evenodd"
          d="M15.62 9.47a.9.9 0 0 0-1.27 0L11.19 12.63l-1.54-1.53a.9.9 0 1 0-1.27 1.27l2.17 2.17a.9.9 0 0 0 1.27 0l3.8-3.8a.9.9 0 0 0 0-1.27Z"
        />
      </svg>
    ),
  },
  error: {
    wrap:       "border-error-500 bg-error-50 dark:border-error-500/30 dark:bg-error-500/15",
    iconBg:     "bg-error-100 dark:bg-error-500/20",
    iconColor:  "text-error-500",
    titleColor: "text-error-800 dark:text-error-400",
    icon: (
      <svg className="fill-current" width="20" height="20" viewBox="0 0 24 24">
        <path fillRule="evenodd" clipRule="evenodd"
          d="M20.35 12A8.35 8.35 0 1 1 3.65 12a8.35 8.35 0 0 1 16.7 0ZM12 22.15A10.15 10.15 0 1 0 12 1.85 10.15 10.15 0 0 0 12 22.15Zm1 -5.68a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm-1-10.84a.9.9 0 0 1 .9.9v5.68a.9.9 0 1 1-1.8 0V6.63a.9.9 0 0 1 .9-.9Z"
        />
      </svg>
    ),
  },
  warning: {
    wrap:       "border-warning-500 bg-warning-50 dark:border-warning-500/30 dark:bg-warning-500/15",
    iconBg:     "bg-warning-100 dark:bg-warning-500/20",
    iconColor:  "text-warning-500",
    titleColor: "text-warning-800 dark:text-warning-400",
    icon: (
      <svg className="fill-current" width="20" height="20" viewBox="0 0 24 24">
        <path fillRule="evenodd" clipRule="evenodd"
          d="M3.65 12A8.35 8.35 0 1 0 20.35 12 8.35 8.35 0 0 0 3.65 12ZM12 1.85A10.15 10.15 0 1 1 12 22.15 10.15 10.15 0 0 1 12 1.85Zm-1 4.43a1 1 0 1 1 2 0v1a.9.9 0 0 1-1.8 0v-1Zm.9 3.76a.9.9 0 0 1 .9.9v5.68a.9.9 0 0 1-1.8 0v-5.68a.9.9 0 0 1 .9-.9Z"
        />
      </svg>
    ),
  },
  info: {
    wrap:       "border-blue-light-500 bg-blue-light-50 dark:border-blue-light-500/30 dark:bg-blue-light-500/15",
    iconBg:     "bg-blue-light-100 dark:bg-blue-light-500/20",
    iconColor:  "text-blue-light-500",
    titleColor: "text-blue-light-800 dark:text-blue-light-400",
    icon: (
      <svg className="fill-current" width="20" height="20" viewBox="0 0 24 24">
        <path fillRule="evenodd" clipRule="evenodd"
          d="M3.65 12A8.35 8.35 0 1 0 20.35 12 8.35 8.35 0 0 0 3.65 12ZM12 1.85A10.15 10.15 0 1 1 12 22.15 10.15 10.15 0 0 1 12 1.85Zm-1 4.18a1 1 0 1 1 2 0v1a.9.9 0 0 1-1.8 0V6.03Zm.9 3.97a.9.9 0 0 1 .9.9v6.1a.9.9 0 1 1-1.8 0V10.9a.9.9 0 0 1 .9-.9Z"
        />
      </svg>
    ),
  },
};

function ToastItem({ toast }: { toast: Toast }) {
  const { dismissToast } = useToast();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  const c = cfg[toast.variant];

  return (
    <div
      role="alert"
      className={`
        flex w-[340px] items-start gap-3 rounded-xl border p-4
        shadow-theme-md
        transition-all duration-300 ease-out
        ${c.wrap}
        ${visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"}
      `}
    >
      {/* Icon circle */}
      <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${c.iconBg} ${c.iconColor}`}>
        {c.icon}
      </span>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${c.titleColor}`}>
          {toast.title}
        </p>
        {toast.message && (
          <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-300">
            {toast.message}
          </p>
        )}
      </div>

      {/* Close */}
      <button
        type="button"
        onClick={() => dismissToast(toast.id)}
        aria-label="Dismiss"
        className={`mt-0.5 shrink-0 opacity-60 hover:opacity-100 transition-opacity ${c.iconColor}`}
      >
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const { toasts, showToast } = useToast();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const oauthFlag = sessionStorage.getItem("oauth_just_logged_in");
      if (oauthFlag) {
        sessionStorage.removeItem("oauth_just_logged_in");
        showToast({
          variant: "success",
          title: "Login Google Berhasil",
          message: "Akun Google Anda berhasil terhubung dan masuk ke workspace!",
        });
      }
    }
  }, [showToast]);

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} />
        </div>
      ))}
    </div>
  );
}
