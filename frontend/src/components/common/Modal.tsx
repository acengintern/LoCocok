import React, { useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl";
  className?: string;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = "md",
  className = "",
}: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses: Record<string, string> = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
    "5xl": "max-w-5xl",
  };

  const selectedMaxWidth = maxWidthClasses[maxWidth] || "max-w-md";

  return (
    <div className="fixed inset-0 z-999999 flex items-center justify-center overflow-y-auto overflow-x-hidden no-scrollbar bg-black/60 backdrop-blur-sm p-3 sm:p-4 animate-fadeIn">
      <div
        className="fixed inset-0 cursor-pointer transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      
      <div
        className={`relative w-full ${selectedMaxWidth} rounded-2xl bg-white p-5 sm:p-6 shadow-2xl dark:bg-gray-900 border border-gray-100 dark:border-gray-800 transition-all ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || description) && (
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100 dark:border-gray-800/80">
            <div>
              {title && (
                <h3 className="text-base sm:text-lg font-bold tracking-tight text-gray-900 dark:text-white">
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {description}
                </p>
              )}
            </div>

            {/* Compact, elegant Close "X" Button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              className="inline-flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white transition-colors cursor-pointer shrink-0 ml-4"
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
              <span className="sr-only">Close modal</span>
            </button>
          </div>
        )}
        
        <div className="text-gray-700 dark:text-gray-300">
          {children}
        </div>
      </div>
    </div>
  );
}
