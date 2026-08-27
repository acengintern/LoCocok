"use client";
import React, { useState, useMemo, useRef, useEffect } from "react";
import EmptyState from "./EmptyState";

export interface ColumnDef<T> {
  header: string;
  accessorKey: keyof T | (string & {});
  cell?: (item: T) => React.ReactNode;
  sortable?: boolean;
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  pagination?: PaginationMeta;
  loading?: boolean;
  emptyStateMessage?: string;
  onPageChange?: (page: number) => void;
  showToolbar?: boolean;
  searchPlaceholder?: string;
  pageSizeOptions?: number[];
  initialPageSize?: number;
  title?: string;
  headerActions?: React.ReactNode;
  // Bulk selection props
  enableSelection?: boolean;
  selectedIds?: (string | number)[];
  onSelectionChange?: (selectedIds: (string | number)[], selectedRows: T[]) => void;
  rowIdKey?: string;
  bulkActions?: (
    selectedIds: (string | number)[],
    selectedRows: T[],
    clearSelection: () => void
  ) => React.ReactNode;
}

export default function DataTable<T extends Record<string, any>>({
  columns,
  data = [],
  pagination,
  loading = false,
  emptyStateMessage = "No records found",
  onPageChange,
  showToolbar = true,
  searchPlaceholder = "Search...",
  pageSizeOptions = [5, 10, 25, 50, 100],
  initialPageSize = 10,
  title,
  headerActions,
  enableSelection = false,
  selectedIds: controlledSelectedIds,
  onSelectionChange,
  rowIdKey = "id",
  bulkActions,
}: DataTableProps<T>) {
  // Local state for client-side search, sort, and pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Page size dropdown state
  const [isPageSizeOpen, setIsPageSizeOpen] = useState(false);
  const pageSizeDropdownRef = useRef<HTMLDivElement>(null);

  // Selection state
  const [internalSelectedIds, setInternalSelectedIds] = useState<(string | number)[]>([]);
  const isControlledSelection = controlledSelectedIds !== undefined;
  const currentSelection = isControlledSelection ? (controlledSelectedIds || []) : internalSelectedIds;

  // Master checkbox ref for indeterminate state
  const masterCheckboxRef = useRef<HTMLInputElement>(null);

  // Close page size dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pageSizeDropdownRef.current &&
        !pageSizeDropdownRef.current.contains(event.target as Node)
      ) {
        setIsPageSizeOpen(false);
      }
    };

    if (isPageSizeOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isPageSizeOpen]);

  // Handle escape key for page size dropdown
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isPageSizeOpen) {
        setIsPageSizeOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPageSizeOpen]);

  // Client-side filtering
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const query = searchTerm.toLowerCase();
    return data.filter((row) =>
      columns.some((col) => {
        const val = row[col.accessorKey as keyof T];
        if (val === null || val === undefined) return false;
        return String(val).toLowerCase().includes(query);
      })
    );
  }, [data, searchTerm, columns]);

  // Client-side sorting
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
      }
      return sortOrder === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }, [filteredData, sortKey, sortOrder]);

  // Determine pagination parameters (server-side vs client-side)
  const isServerSide = !!pagination;
  const totalItems = isServerSide ? pagination.totalItems : sortedData.length;
  const activePage = isServerSide ? pagination.currentPage : currentPage;
  const itemsPerPage = isServerSide ? pagination.itemsPerPage : pageSize;
  const totalPages = isServerSide
    ? pagination.totalPages
    : Math.ceil(totalItems / itemsPerPage) || 1;

  const paginatedData = useMemo(() => {
    if (isServerSide) return data;
    const start = (activePage - 1) * itemsPerPage;
    return sortedData.slice(start, start + itemsPerPage);
  }, [isServerSide, data, sortedData, activePage, itemsPerPage]);

  // Current page item IDs for master checkbox
  const currentPageIds = useMemo(() => {
    return paginatedData.map((row) => row[rowIdKey]).filter((id) => id !== undefined);
  }, [paginatedData, rowIdKey]);

  const isAllCurrentPageSelected =
    currentPageIds.length > 0 &&
    currentPageIds.every((id) => currentSelection.includes(id));

  const isSomeCurrentPageSelected =
    currentPageIds.some((id) => currentSelection.includes(id)) &&
    !isAllCurrentPageSelected;

  useEffect(() => {
    if (masterCheckboxRef.current) {
      masterCheckboxRef.current.indeterminate = isSomeCurrentPageSelected;
    }
  }, [isSomeCurrentPageSelected]);

  // Update selection helper
  const updateSelection = (newIds: (string | number)[]) => {
    if (!isControlledSelection) {
      setInternalSelectedIds(newIds);
    }
    if (onSelectionChange) {
      const selectedRows = data.filter((row) => newIds.includes(row[rowIdKey]));
      onSelectionChange(newIds, selectedRows);
    }
  };

  const handleToggleAll = () => {
    if (isAllCurrentPageSelected) {
      const newIds = currentSelection.filter((id) => !currentPageIds.includes(id));
      updateSelection(newIds);
    } else {
      const newIds = Array.from(new Set([...currentSelection, ...currentPageIds]));
      updateSelection(newIds);
    }
  };

  const handleToggleRow = (id: string | number) => {
    if (currentSelection.includes(id)) {
      const newIds = currentSelection.filter((item) => item !== id);
      updateSelection(newIds);
    } else {
      const newIds = [...currentSelection, id];
      updateSelection(newIds);
    }
  };

  const handleClearSelection = () => {
    updateSelection([]);
  };

  const selectedRows = useMemo(() => {
    return data.filter((row) => currentSelection.includes(row[rowIdKey]));
  }, [data, currentSelection, rowIdKey]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortOrder === "asc") {
        setSortOrder("desc");
      } else {
        setSortKey(null);
        setSortOrder("asc");
      }
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const handlePageChange = (page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages));
    if (isServerSide && onPageChange) {
      onPageChange(validPage);
    } else {
      setCurrentPage(validPage);
    }
  };

  // Generate pagination buttons
  const paginationRange = useMemo(() => {
    const delta = 1;
    const range: (number | string)[] = [];
    for (
      let i = Math.max(2, activePage - delta);
      i <= Math.min(totalPages - 1, activePage + delta);
      i++
    ) {
      range.push(i);
    }

    if (activePage - delta > 2) {
      range.unshift("...");
    }
    if (activePage + delta < totalPages - 1) {
      range.push("...");
    }

    range.unshift(1);
    if (totalPages > 1) {
      range.push(totalPages);
    }

    return Array.from(new Set(range));
  }, [activePage, totalPages]);

  const startEntry = totalItems === 0 ? 0 : (activePage - 1) * itemsPerPage + 1;
  const endEntry = Math.min(activePage * itemsPerPage, totalItems);
  const totalColumnsCount = columns.length + (enableSelection ? 1 : 0);

  return (
    <div className="overflow-hidden rounded-2xl shadow-theme-xs bg-white dark:bg-white/[0.03]">
      {/* Optional Card Title Header if provided */}
      {title && (
        <div className="flex flex-wrap items-center justify-between gap-4 border border-b-0 border-gray-100 dark:border-white/[0.05] rounded-t-xl px-5 py-4 dark:bg-white/[0.02]">
          <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
            {title}
          </h3>
        </div>
      )}

      {/* Bulk Action Bar (when rows are selected) */}
      {enableSelection && currentSelection.length > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 border border-b-0 border-brand-200 bg-brand-50 px-5 py-3.5 dark:border-brand-900/40 dark:bg-brand-950/30 rounded-t-2xl">
          <div className="flex items-center gap-3">
            {/* Count */}
            <p className="text-sm font-medium text-brand-700 dark:text-brand-300">
              <span className="font-bold">{currentSelection.length}</span>{" "}
              {currentSelection.length === 1 ? "item" : "items"} selected
            </p>

            {/* Divider */}
            <span className="h-4 w-px bg-brand-200 dark:bg-brand-700/60" />

            {/* Deselect button */}
            <button
              type="button"
              onClick={handleClearSelection}
              className="group inline-flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:text-brand-800 dark:text-brand-400 dark:hover:text-brand-200 transition-colors"
            >
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-brand-100 group-hover:bg-brand-200 dark:bg-brand-900/60 dark:group-hover:bg-brand-800 transition-colors">
                <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </span>
              Deselect all
            </button>
          </div>

          {/* Bulk action slot */}
          <div className="flex items-center gap-2">
            {bulkActions && bulkActions(currentSelection, selectedRows, handleClearSelection)}
          </div>
        </div>
      ) : showToolbar ? (
        /* Toolbar */
        <div className="flex flex-col gap-3 px-4 py-3 border border-b-0 border-gray-100 dark:border-white/[0.05] rounded-t-2xl sm:flex-row sm:items-center sm:justify-between">
          {/* Entries per page (Custom Themed Dropdown) */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Show</span>
            <div ref={pageSizeDropdownRef} className="relative">
              <button
                type="button"
                onClick={() => setIsPageSizeOpen((prev) => !prev)}
                aria-haspopup="listbox"
                aria-expanded={isPageSizeOpen}
                className={`inline-flex h-9 min-w-[64px] items-center justify-between gap-2 rounded-lg border bg-white px-2.5 text-xs font-semibold shadow-theme-xs transition-colors cursor-pointer dark:bg-gray-800 ${
                  isPageSizeOpen
                    ? "border-brand-500 ring-2 ring-brand-500/20 text-brand-600 dark:text-brand-400"
                    : "border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.04] dark:hover:text-white"
                }`}
              >
                <span>{pageSize}</span>
                <svg
                  className={`w-3.5 h-3.5 text-gray-400 dark:text-gray-500 transition-transform duration-200 ${
                    isPageSizeOpen ? "rotate-180 text-brand-500 dark:text-brand-400" : ""
                  }`}
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3.8335 5.9165L8.00016 10.0832L12.1668 5.9165"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              {/* Custom Themed Dropdown Options Menu */}
              {isPageSizeOpen && (
                <div className="absolute left-0 top-full mt-1.5 z-50 min-w-[76px] rounded-xl border border-gray-200 bg-white p-1 shadow-theme-lg dark:border-gray-800 dark:bg-[#1E2635]">
                  <ul role="listbox" className="space-y-0.5">
                    {pageSizeOptions.map((opt) => {
                      const isSelected = opt === pageSize;
                      return (
                        <li key={opt} role="option" aria-selected={isSelected}>
                          <button
                            type="button"
                            onClick={() => {
                              setPageSize(opt);
                              setCurrentPage(1);
                              setIsPageSizeOpen(false);
                            }}
                            className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors text-left cursor-pointer ${
                              isSelected
                                ? "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400 font-semibold"
                                : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-white"
                            }`}
                          >
                            <span>{opt}</span>
                            {isSelected && (
                              <svg
                                className="ml-1.5 h-3.5 w-3.5 shrink-0 text-brand-500 dark:text-brand-400"
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
                    })}
                  </ul>
                </div>
              )}
            </div>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">entries</span>
          </div>

          {/* Search + actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            {headerActions && <div className="flex flex-wrap items-center gap-2">{headerActions}</div>}
            <div className="relative">
              <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                <svg className="fill-current" width="14" height="14" viewBox="0 0 20 20" fill="none">
                  <path fillRule="evenodd" clipRule="evenodd" d="M3.04199 9.37363C3.04199 5.87693 5.87735 3.04199 9.37533 3.04199C12.8733 3.04199 15.7087 5.87693 15.7087 9.37363C15.7087 12.8703 12.8733 15.7053 9.37533 15.7053C5.87735 15.7053 3.04199 12.8703 3.04199 9.37363ZM9.37533 1.54199C5.04926 1.54199 1.54199 5.04817 1.54199 9.37363C1.54199 13.6991 5.04926 17.2053 9.37533 17.2053C11.2676 17.2053 13.0032 16.5344 14.3572 15.4176L17.1773 18.238C17.4702 18.5309 17.945 18.5309 18.2379 18.238C18.5308 17.9451 18.5309 17.4703 18.238 17.1773L15.4182 14.3573C16.5367 13.0033 17.2087 11.2669 17.2087 9.37363C17.2087 5.04817 13.7014 1.54199 9.37533 1.54199Z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-9 w-full rounded-lg border border-gray-200 bg-white py-1.5 pl-8 pr-3 text-xs text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 sm:w-[220px]"
              />
            </div>
          </div>
        </div>
      ) : null}

      {/* Table Container */}
      <div className="max-w-full overflow-x-auto no-scrollbar">
        <div>
          <table className="min-w-full border-collapse">
            <thead>
              <tr>
                {/* Master Checkbox */}
                {enableSelection && (
                  <th className="w-12 px-4 py-3 border border-gray-100 dark:border-white/[0.05] text-center">
                    <label className="flex items-center justify-center cursor-pointer">
                      <div className="relative w-5 h-5">
                        <input
                          type="checkbox"
                          ref={masterCheckboxRef}
                          checked={isAllCurrentPageSelected || isSomeCurrentPageSelected}
                          onChange={handleToggleAll}
                          aria-label="Select all rows on current page"
                          className={`w-5 h-5 appearance-none cursor-pointer dark:border-gray-700 border border-gray-300 rounded-md disabled:opacity-60 transition-colors ${
                            isAllCurrentPageSelected || isSomeCurrentPageSelected
                              ? "border-transparent bg-brand-500"
                              : "hover:border-gray-400 dark:hover:border-gray-600"
                          }`}
                        />
                        {isSomeCurrentPageSelected ? (
                          <svg
                            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 14 14"
                            fill="none"
                          >
                            <path
                              d="M3.5 7H10.5"
                              stroke="white"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        ) : isAllCurrentPageSelected ? (
                          <svg
                            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 14 14"
                            fill="none"
                          >
                            <path
                              d="M11.6666 3.5L5.24992 9.91667L2.33325 7"
                              stroke="white"
                              strokeWidth="1.94437"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        ) : null}
                      </div>
                    </label>
                  </th>
                )}

                {columns.map((col, idx) => {
                  const isSortable = col.sortable !== false;
                  const isSorted = sortKey === col.accessorKey;
                  return (
                    <th
                      key={idx}
                      onClick={() => isSortable && handleSort(col.accessorKey as string)}
                      className="px-4 py-3 border border-gray-100 dark:border-white/[0.05]"
                    >
                      <div className={`flex items-center justify-between ${isSortable ? "cursor-pointer select-none" : ""}`}>
                        <span className="font-medium text-gray-700 text-theme-xs dark:text-gray-400">
                          {col.header}
                        </span>
                        {isSortable && (
                          <button type="button" className="flex flex-col gap-0.5 ml-1">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="8"
                              height="5"
                              fill="none"
                              className={isSorted && sortOrder === "asc" ? "text-brand-500" : "text-gray-300 dark:text-gray-700"}
                            >
                              <path fill="currentColor" d="M4.41.585a.5.5 0 0 0-.82 0L1.05 4.213A.5.5 0 0 0 1.46 5h5.08a.5.5 0 0 0 .41-.787z" />
                            </svg>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="8"
                              height="5"
                              fill="none"
                              className={isSorted && sortOrder === "desc" ? "text-brand-500" : "text-gray-300 dark:text-gray-700"}
                            >
                              <path fill="currentColor" d="M4.41 4.415a.5.5 0 0 1-.82 0L1.05.787A.5.5 0 0 1 1.46 0h5.08a.5.5 0 0 1 .41.787z" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={totalColumnsCount} className="py-12 text-center border border-gray-100 dark:border-white/[0.05]">
                    <div className="inline-flex items-center justify-center gap-3">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent"></div>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Loading data...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={totalColumnsCount} className="py-10 text-center border border-gray-100 dark:border-white/[0.05]">
                    <EmptyState title="No Records Found" message={emptyStateMessage} />
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, rowIndex) => {
                  const rowId = row[rowIdKey] ?? rowIndex;
                  const isSelected = currentSelection.includes(rowId);
                  return (
                    <tr
                      key={rowId}
                      className={`transition-colors ${
                        isSelected
                          ? "bg-brand-50/60 dark:bg-brand-950/25"
                          : "hover:bg-gray-50/70 dark:hover:bg-white/[0.02]"
                      }`}
                    >
                      {/* Row Checkbox */}
                      {enableSelection && (
                        <td className="w-12 px-4 py-4 border border-gray-100 dark:border-white/[0.05] text-center">
                          <label className="flex items-center justify-center cursor-pointer">
                            <div className="relative w-5 h-5">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleToggleRow(rowId)}
                                aria-label={`Select row ${rowId}`}
                                className={`w-5 h-5 appearance-none cursor-pointer dark:border-gray-700 border border-gray-300 rounded-md disabled:opacity-60 transition-colors ${
                                  isSelected
                                    ? "border-transparent bg-brand-500"
                                    : "hover:border-gray-400 dark:hover:border-gray-600"
                                }`}
                              />
                              {isSelected && (
                                <svg
                                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="14"
                                  height="14"
                                  viewBox="0 0 14 14"
                                  fill="none"
                                >
                                  <path
                                    d="M11.6666 3.5L5.24992 9.91667L2.33325 7"
                                    stroke="white"
                                    strokeWidth="1.94437"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              )}
                            </div>
                          </label>
                        </td>
                      )}

                      {columns.map((col, colIndex) => (
                        <td
                          key={colIndex}
                          className="px-4 py-4 border border-gray-100 dark:border-white/[0.05] font-normal text-theme-sm text-gray-800 dark:text-white/90 whitespace-nowrap"
                        >
                          {col.cell ? col.cell(row) : (row as any)[col.accessorKey]}
                        </td>
                      ))}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* TailAdmin Data Table Footer (Showing entries & Compact Numbered Pagination) */}
      {!loading && totalItems > 0 && (
        <div className="border border-t-0 rounded-b-2xl border-gray-100 px-4 py-3 dark:border-white/[0.05]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                Showing <span className="font-semibold text-gray-800 dark:text-white">{startEntry}</span> to{" "}
                <span className="font-semibold text-gray-800 dark:text-white">{endEntry}</span> of{" "}
                <span className="font-semibold text-gray-800 dark:text-white">{totalItems}</span> entries
              </p>
            </div>

            <div className="flex items-center justify-center gap-1.5">
              {/* Prev Button */}
              <button
                type="button"
                onClick={() => handlePageChange(activePage - 1)}
                disabled={activePage === 1}
                className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg border border-gray-200 bg-white text-theme-xs font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/[0.04] dark:hover:text-white transition-colors cursor-pointer disabled:cursor-not-allowed"
              >
                <svg className="w-3.5 h-3.5 stroke-current" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                <span>Prev</span>
              </button>

              {/* Numbered Page Buttons */}
              <div className="flex items-center gap-1">
                {paginationRange.map((page, idx) => {
                  if (page === "...") {
                    return (
                      <span
                        key={`ellipsis-${idx}`}
                        className="flex h-8 w-6 items-center justify-center text-theme-xs text-gray-400 dark:text-gray-500"
                      >
                        ...
                      </span>
                    );
                  }
                  const isCurrent = page === activePage;
                  return (
                    <button
                      type="button"
                      key={page}
                      onClick={() => handlePageChange(page as number)}
                      className={`flex h-8 min-w-[32px] px-2 items-center justify-center rounded-lg text-theme-xs font-medium transition-colors cursor-pointer ${
                        isCurrent
                          ? "bg-brand-500 text-white shadow-theme-xs font-semibold"
                          : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-white/[0.04] dark:hover:text-white"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>

              {/* Next Button */}
              <button
                type="button"
                onClick={() => handlePageChange(activePage + 1)}
                disabled={activePage === totalPages}
                className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg border border-gray-200 bg-white text-theme-xs font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/[0.04] dark:hover:text-white transition-colors cursor-pointer disabled:cursor-not-allowed"
              >
                <span>Next</span>
                <svg className="w-3.5 h-3.5 stroke-current" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

