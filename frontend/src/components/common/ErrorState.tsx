import React from "react";
import { AlertIcon } from "@/icons";

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryText?: string;
}

export default function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
  retryText = "Try Again",
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border border-error-200 dark:border-error-500/20 rounded-xl bg-error-50/50 dark:bg-error-500/5 shadow-sm">
      <div className="w-16 h-16 mb-4 text-error-500 bg-error-100 dark:bg-error-500/20 rounded-full flex items-center justify-center">
        <AlertIcon />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">{message}</p>
      
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-300 dark:focus:ring-brand-800 transition-colors"
        >
          {retryText}
        </button>
      )}
    </div>
  );
}
