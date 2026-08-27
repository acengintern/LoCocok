"use client";

import React, { useState, useEffect } from "react";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import { useToast } from "@/context/ToastContext";
import { apiClient } from "@/lib/api/client";
import { useSettings } from "@/hooks/useSettings";

export default function SettingsClient() {
  const { showToast } = useToast();
  const { settings, loading, refreshSettings } = useSettings();
  const [agencyName, setAgencyName] = useState(settings?.agency_name || "");
  const [contactEmail, setContactEmail] = useState(settings?.contact_email || "");
  const [currency, setCurrency] = useState(settings?.currency || "IDR");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setAgencyName(settings.agency_name || "");
      setContactEmail(settings.contact_email || "");
      setCurrency(settings.currency || "IDR");
    }
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiClient.post("/settings", {
        settings: {
          agency_name: agencyName,
          contact_email: contactEmail,
          currency: currency,
        }
      });
      await refreshSettings();
      showToast({
        variant: "success",
        title: "Settings Saved",
        message: "System configuration updated successfully.",
      });
    } catch (error) {
      showToast({
        variant: "error",
        title: "Settings Failed",
        message: "Failed to update configuration.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            System Settings
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Global agency parameters, security baselines, and workspace preferences
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Agency Profile */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03] space-y-4">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            Agency Profile & Workspace
          </h2>
          <div className="space-y-3">
            <div>
              <Label>Agency Name</Label>
              <Input
                type="text"
                value={agencyName}
                onChange={(e) => setAgencyName(e.target.value)}
              />
            </div>
            <div>
              <Label>Administrative Contact Email</Label>
              <Input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
              />
            </div>
            <div>
              <Label>Primary Currency</Label>
              <Select
                options={[
                  { value: "IDR", label: "IDR (Indonesian Rupiah - Rp)" },
                  { value: "USD", label: "USD (US Dollar - $)" },
                  { value: "SGD", label: "SGD (Singapore Dollar - S$)" },
                ]}
                value={currency}
                onChange={(val) => setCurrency(val)}
              />
            </div>
          </div>
        </div>

        {/* Card 2: Security & Governance */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03] space-y-4">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            Security & RBAC Enforcement
          </h2>
          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-white/[0.01]">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">System Admin Protection</p>
                <p className="text-xs text-gray-500">Immutable superadmin permissions</p>
              </div>
              <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400">
                ACTIVE
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-white/[0.01]">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Sanctum Token Auth</p>
                <p className="text-xs text-gray-500">Session guard & API token authentication</p>
              </div>
              <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400">
                ENABLED
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-white/[0.01]">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Activity Audit Logging</p>
                <p className="text-xs text-gray-500">Auto-tracks models & permission changes</p>
              </div>
              <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400">
                ENABLED
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button size="md" onClick={handleSave} disabled={saving}>
          {saving ? "Saving Changes..." : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}
