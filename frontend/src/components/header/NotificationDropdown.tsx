"use client";

import Link from "next/link";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { apiClient } from "@/lib/api/client";
import { Notification } from "@/types/api";
import { useAuth } from "@/hooks/useAuth";

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const { user } = useAuth();

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [countRes, notifRes] = await Promise.all([
        apiClient.get("/notifications/unread-count"),
        apiClient.get("/notifications?limit=8"),
      ]);
      setUnreadCount(countRes.data.data?.count || 0);
      setNotifications(notifRes.data.data || []);
    } catch (error) {
      console.warn("Failed to fetch notifications", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, fetchData]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      fetchData();
    }
  };

  const closeDropdown = () => {
    setIsOpen(false);
  };

  const handleMarkAllRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setMarkingAll(true);
      await apiClient.post("/notifications/mark-all-read");
      setUnreadCount(0);
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read_at: new Date().toISOString() }))
      );
    } catch (error) {
      console.error("Failed to mark all as read", error);
    } finally {
      setMarkingAll(false);
    }
  };

  const handleMarkRead = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await apiClient.put(`/notifications/${id}/mark-read`);
      setUnreadCount((prev) => Math.max(0, prev - 1));
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
      );
    } catch (error) {
      console.error("Failed to mark single notification as read", error);
    }
  };

  const formatRelativeTime = (dateStr: string): string => {
    try {
      const now = new Date();
      const date = new Date(dateStr);
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return "Baru saja";
      if (diffMins < 60) return `${diffMins}m lalu`;
      if (diffHours < 24) return `${diffHours}j lalu`;
      if (diffDays === 1) return "Kemarin";
      if (diffDays < 7) return `${diffDays}h lalu`;
      return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
    } catch {
      return "-";
    }
  };

  const getNotificationIcon = (type: string, message: string) => {
    const combined = `${type} ${message}`.toLowerCase();

    if (combined.includes("approval") || combined.includes("approved") || combined.includes("qc")) {
      return (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
      );
    }

    if (combined.includes("revision") || combined.includes("revisi") || combined.includes("urgent")) {
      return (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
      );
    }

    if (combined.includes("task") || combined.includes("tugas") || combined.includes("assigned")) {
      return (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
      );
    }

    if (combined.includes("payment") || combined.includes("invoice") || combined.includes("revenue")) {
      return (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      );
    }

    return (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      </div>
    );
  };

  const filteredNotifications = useMemo(() => {
    if (filter === "unread") {
      return notifications.filter((n) => !n.read_at);
    }
    return notifications;
  }, [notifications, filter]);

  const hasUnread = unreadCount > 0;

  return (
    <div className="relative">
      {/* Trigger Bell Button */}
      <button
        onClick={toggleDropdown}
        aria-label="Open Notifications"
        aria-expanded={isOpen}
        className="relative flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition-all hover:bg-gray-100 hover:text-gray-900 active:scale-95 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
      >
        {/* Unread Counter Badge */}
        {hasUnread && (
          <span className="absolute -top-1 -right-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-brand-500 px-1 font-mono text-[10px] font-bold text-white shadow-xs ring-2 ring-white dark:ring-gray-900">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}

        {/* Bell SVG */}
        <svg
          className="w-5 h-5 transition-transform group-hover:rotate-12"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
      </button>

      {/* Floating Dropdown Card */}
      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="-right-[120px] sm:right-0 mt-2.5 flex h-auto max-h-[540px] w-[340px] sm:w-[400px] flex-col rounded-2xl border border-gray-200/90 bg-white p-0 shadow-theme-xl dark:border-gray-800 dark:bg-gray-900 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 p-4 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">
              Notifikasi
            </h4>
            {hasUnread && (
              <span className="inline-flex items-center rounded-md bg-brand-50 px-2 py-0.5 font-mono text-[10px] font-bold text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                {unreadCount} Baru
              </span>
            )}
          </div>

          {hasUnread && (
            <button
              onClick={handleMarkAllRead}
              disabled={markingAll}
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 transition-colors cursor-pointer"
            >
              {markingAll ? (
                <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
              <span>Tandai Semua Dibaca</span>
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 border-b border-gray-100 px-4 pt-2 bg-gray-50/50 dark:border-gray-800 dark:bg-white/[0.01]">
          <button
            onClick={() => setFilter("all")}
            className={`pb-2.5 text-xs font-medium transition-all ${
              filter === "all"
                ? "border-b-2 border-brand-500 font-semibold text-brand-600 dark:text-brand-400"
                : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            Semua ({notifications.length})
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`ml-4 pb-2.5 text-xs font-medium transition-all ${
              filter === "unread"
                ? "border-b-2 border-brand-500 font-semibold text-brand-600 dark:text-brand-400"
                : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            Belum Dibaca ({unreadCount})
          </button>
        </div>

        {/* Notifications List */}
        <div className="max-h-[340px] overflow-y-auto custom-scrollbar divide-y divide-gray-100 dark:divide-gray-800/80">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
              <span className="text-xs text-gray-400">Memuat notifikasi...</span>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500 mb-3">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <h5 className="text-xs font-bold text-gray-800 dark:text-gray-200">
                Semua Notifikasi Bersih
              </h5>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                {filter === "unread" ? "Tidak ada notifikasi yang belum dibaca." : "Belum ada riwayat notifikasi baru."}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notif) => {
              const isUnread = !notif.read_at;
              const msg = String(notif.data?.message || notif.data?.title || "Notifikasi aktivitas baru");

              return (
                <div
                  key={notif.id}
                  className={`group relative flex items-start gap-3 p-3.5 transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.02] ${
                    isUnread ? "bg-brand-50/30 dark:bg-brand-500/5" : ""
                  }`}
                >
                  {/* Category Icon */}
                  {getNotificationIcon(notif.type, msg)}

                  {/* Text Content */}
                  <div className="flex-1 min-w-0 pr-6">
                    <Link
                      href="/notifications"
                      onClick={closeDropdown}
                      className="block text-xs font-medium text-gray-800 hover:text-brand-600 dark:text-gray-200 dark:hover:text-brand-400 leading-snug line-clamp-2"
                    >
                      {msg}
                    </Link>

                    <div className="flex items-center gap-2 mt-1 font-mono text-[10px] text-gray-400 dark:text-gray-500">
                      <span className="capitalize">{notif.type.replace(/_/g, " ")}</span>
                      <span>•</span>
                      <span>{formatRelativeTime(notif.created_at)}</span>
                    </div>
                  </div>

                  {/* Single Mark Read Button */}
                  {isUnread && (
                    <button
                      onClick={(e) => handleMarkRead(e, notif.id)}
                      title="Tandai sudah dibaca"
                      className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full text-gray-400 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-500/20 dark:hover:text-brand-300 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer Link */}
        <div className="border-t border-gray-100 p-2.5 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-900">
          <Link
            href="/notifications"
            onClick={closeDropdown}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold text-gray-700 hover:bg-white hover:text-brand-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-brand-400 transition-all shadow-2xs"
          >
            <span>Buka Pusat Notifikasi Lengkap</span>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </Dropdown>
    </div>
  );
}
