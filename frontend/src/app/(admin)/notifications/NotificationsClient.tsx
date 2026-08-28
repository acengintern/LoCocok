"use client";

import React, { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/client";
import { Notification } from "@/types/api";
import DataTable, { ColumnDef } from "@/components/common/DataTable";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ProtectedContent from "@/components/ProtectedContent";

export default function NotificationsClient() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get('/notifications');
      // If using paginated response, response.data.data may contain the array
      setNotifications(response.data.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await apiClient.post('/notifications/mark-all-read');
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await apiClient.put(`/notifications/${id}/mark-read`);
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
  };

  const columns: ColumnDef<Notification>[] = [
    {
      header: "Status",
      accessorKey: "read_at",
      cell: (item) => (
        <span
          className={`inline-block px-2.5 py-1 text-xs font-medium rounded-full ${
            item.read_at ? "bg-gray-100 text-gray-800" : "bg-brand-100 text-brand-800"
          }`}
        >
          {item.read_at ? "Read" : "Unread"}
        </span>
      ),
    },
    {
      header: "Type",
      accessorKey: "type",
      cell: (item) => <span className="font-medium text-gray-700">{item.type}</span>,
    },
    {
      header: "Message",
      accessorKey: "data",
      cell: (item) => (
        <div className="text-gray-600 dark:text-gray-400">
          {String(item.data?.message || JSON.stringify(item.data))}
        </div>
      ),
    },
    {
      header: "Date",
      accessorKey: "created_at",
      cell: (item) => (
        <span className="text-gray-500 whitespace-nowrap">
          {new Date(item.created_at).toLocaleString()}
        </span>
      ),
    },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: (item) => (
        <div className="flex gap-2">
          {!item.read_at && (
            <button
              onClick={() => handleMarkRead(item.id)}
              className="text-brand-500 hover:text-brand-600 text-sm font-medium transition-colors"
            >
              Mark Read
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <ProtectedContent>
      <PageBreadcrumb pageTitle="Notifications" />

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Notification Center
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Manage your recent notifications and alerts.
            </p>
          </div>
          <button
            onClick={handleMarkAllRead}
            disabled={loading || notifications.every((n) => n.read_at)}
            className="px-4 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 disabled:opacity-50 transition-colors"
          >
            Mark All as Read
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-error-50 text-error-600 rounded-lg dark:bg-error-500/10 dark:text-error-500">
            {error}
          </div>
        )}

        <DataTable
          columns={columns}
          data={notifications}
          loading={loading}
          enableSelection={true}
          bulkActions={(selectedIds, selectedRows, clearSelection) => (
            <button
              onClick={async () => {
                try {
                  await Promise.all(
                    selectedIds.map((id) => apiClient.put(`/notifications/${id}/mark-read`))
                  );
                  clearSelection();
                  fetchNotifications();
                } catch (err: any) {
                  console.error(err);
                }
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/[0.03] transition-colors"
            >
              Mark Selected as Read ({selectedIds.length})
            </button>
          )}
          emptyStateMessage="You have no notifications."
        />
      </div>
    </ProtectedContent>
  );
}
