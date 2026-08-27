import React, { useState, useRef, useEffect, useMemo } from "react";
import { twMerge } from "tailwind-merge";

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  options: Option[];
  placeholder?: string;
  onChange: (value: string) => void;
  className?: string;
  defaultValue?: string;
  value?: string;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  searchable?: boolean;
  searchPlaceholder?: string;
}

const Select: React.FC<SelectProps> = ({
  options,
  placeholder = "Select an option",
  onChange,
  className = "",
  defaultValue = "",
  value,
  disabled = false,
  size = "md",
  searchable = false,
  searchPlaceholder = "Search...",
}) => {
  const [internalValue, setInternalValue] = useState<string>(value || defaultValue);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const selectRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  const selectedOption = options.find((opt) => opt.value === currentValue);

  const shouldShowSearch = searchable || options.length > 8;

  // Auto focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && shouldShowSearch) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setSearchQuery("");
    }
  }, [isOpen, shouldShowSearch]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    if (!isControlled) {
      setInternalValue(optionValue);
    }
    onChange(optionValue);
    setIsOpen(false);
    setSearchQuery("");
  };

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen((prev) => !prev);
    }
  };

  // Filtered options based on search query
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const q = searchQuery.toLowerCase();
    return options.filter((opt) => opt.label.toLowerCase().includes(q));
  }, [options, searchQuery]);

  const sizeClasses = {
    sm: "h-9 px-3 py-1.5 pr-8 text-xs",
    md: "h-11 px-4 py-2.5 pr-11 text-sm",
    lg: "h-12 px-4 py-3 pr-11 text-base",
  };

  const optionSizeClasses = {
    sm: "px-2.5 py-1.5 text-xs",
    md: "px-3 py-2.5 text-sm",
    lg: "px-3.5 py-3 text-base",
  };

  return (
    <div ref={selectRef} className="relative w-full">
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={toggleDropdown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={twMerge(
          "w-full rounded-lg border border-gray-300 bg-white text-left shadow-theme-xs transition-all",
          "focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10",
          "dark:border-gray-700 dark:bg-gray-900 dark:focus:border-brand-800",
          "disabled:cursor-not-allowed disabled:opacity-50",
          sizeClasses[size],
          selectedOption
            ? "text-gray-800 dark:text-white/90 font-medium"
            : "text-gray-400 dark:text-gray-400",
          isOpen ? "border-brand-500 ring-3 ring-brand-500/10 dark:border-brand-500" : "",
          className
        )}
      >
        <span className="block truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 ${size === "sm" ? "right-2.5" : "right-3.5"}`}>
          <svg
            className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
            width={size === "sm" ? "16" : "20"}
            height={size === "sm" ? "16" : "20"}
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4.79175 7.39587L10.0001 12.6042L15.2084 7.39587"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>

      {/* Dropdown Options Menu */}
      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-1.5 w-full rounded-2xl border border-gray-200 bg-white p-1.5 shadow-theme-lg transition-all dark:border-gray-800 dark:bg-[#1E2635]">
          {shouldShowSearch && (
            <div className="p-1 pb-2 border-b border-gray-100 dark:border-gray-800/80">
              <div className="relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full h-8.5 rounded-lg border border-gray-200 bg-gray-50/80 px-3 pl-8 text-xs text-gray-800 placeholder:text-gray-400 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800/90 dark:text-white dark:focus:bg-gray-900 dark:placeholder:text-gray-500"
                />
                <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSearchQuery("");
                      searchInputRef.current?.focus();
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          )}

          <ul
            role="listbox"
            className="max-h-60 overflow-y-auto space-y-1 custom-scrollbar pt-1"
          >
            {filteredOptions.length === 0 ? (
              <li className="px-3 py-4 text-center text-xs text-gray-400 dark:text-gray-500">
                Tidak ada opsi ditemukan
              </li>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = option.value === currentValue;
                return (
                  <li key={option.value} role="option" aria-selected={isSelected}>
                    <button
                      type="button"
                      onClick={() => handleSelect(option.value)}
                      className={twMerge(
                        "flex w-full items-center justify-between rounded-lg font-medium transition-colors text-left",
                        optionSizeClasses[size],
                        isSelected
                          ? "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400 font-semibold"
                          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-white"
                      )}
                    >
                      <span className="truncate">{option.label}</span>
                      {isSelected && (
                        <svg
                          className="ml-2 h-3.5 w-3.5 shrink-0 text-brand-500 dark:text-brand-400"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Select;
