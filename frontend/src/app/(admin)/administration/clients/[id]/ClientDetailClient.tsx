"use client";

import React, { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/client";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ClientData {
  id: number;
  name: string;
  brand_name: string;
  address: string;
  phone: string;
  email: string;
  pic_name: string;
  pic_phone: string;
  pic_email: string;
  status: string;
  ae?: { name: string };
  sms?: { name: string };
  created_at?: string;
  updated_at?: string;
}

export default function ClientDetailClient({ clientId }: { clientId: string }) {
  const router = useRouter();
  const [client, setClient] = useState<ClientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClient = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get(`/clients/${clientId}`);
        const data = res.data.data ? res.data.data : res.data;
        setClient(data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch client details");
      } finally {
        setLoading(false);
      }
    };
    fetchClient();
  }, [clientId]);

  if (loading) return <div className="text-gray-500">Loading client details...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!client) return <div className="text-gray-500">Client not found.</div>;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
          Client Details
        </h2>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => router.back()}>
            Back
          </Button>
          <Link href={`/administration/clients`}>
            <Button size="sm" variant="outline">Client List</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 flex flex-col gap-6">
          {/* Main Info Card */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex justify-between items-start mb-6 border-b border-gray-100 pb-4 dark:border-white/[0.05]">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                  {client.brand_name || client.name}
                </h3>
                {client.brand_name && client.name && client.brand_name !== client.name && (
                  <p className="text-sm text-gray-500 mt-1">{client.name}</p>
                )}
              </div>
              <Badge size="sm" color={client.status === "ACTIVE" ? "success" : "error"}>
                {client.status || "UNKNOWN"}
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Company Email</p>
                <p className="font-medium text-gray-800 dark:text-white/90">{client.email || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Company Phone</p>
                <p className="font-medium text-gray-800 dark:text-white/90">{client.phone || "-"}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-sm text-gray-500 mb-1">Address</p>
                <p className="font-medium text-gray-800 dark:text-white/90">{client.address || "-"}</p>
              </div>
            </div>
          </div>

          {/* PIC Info Card */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-6 border-b border-gray-100 pb-4 dark:border-white/[0.05]">
              Person in Charge (PIC)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
              <div className="sm:col-span-2">
                <p className="text-sm text-gray-500 mb-1">Name</p>
                <p className="font-medium text-gray-800 dark:text-white/90">{client.pic_name || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Email</p>
                <p className="font-medium text-gray-800 dark:text-white/90">{client.pic_email || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Phone</p>
                <p className="font-medium text-gray-800 dark:text-white/90">{client.pic_phone || "-"}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {/* Assignment Card */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-6 border-b border-gray-100 pb-4 dark:border-white/[0.05]">
              Assignments
            </h3>
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Account Executive (AE)</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-bold text-xs dark:bg-brand-900/30 dark:text-brand-400">
                    {client.ae?.name ? client.ae.name.charAt(0).toUpperCase() : "?"}
                  </div>
                  <p className="font-medium text-gray-800 dark:text-white/90">{client.ae?.name || "Unassigned"}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Sales Marketing Support (SMS)</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs dark:bg-blue-900/30 dark:text-blue-400">
                    {client.sms?.name ? client.sms.name.charAt(0).toUpperCase() : "?"}
                  </div>
                  <p className="font-medium text-gray-800 dark:text-white/90">{client.sms?.name || "Unassigned"}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Metadata Card */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-6 border-b border-gray-100 pb-4 dark:border-white/[0.05]">
              System Info
            </h3>
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Client ID</p>
                <p className="font-medium text-gray-800 dark:text-white/90">{client.id}</p>
              </div>
              {client.created_at && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Created At</p>
                  <p className="font-medium text-gray-800 dark:text-white/90">{new Date(client.created_at).toLocaleString()}</p>
                </div>
              )}
              {client.updated_at && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Last Updated</p>
                  <p className="font-medium text-gray-800 dark:text-white/90">{new Date(client.updated_at).toLocaleString()}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
