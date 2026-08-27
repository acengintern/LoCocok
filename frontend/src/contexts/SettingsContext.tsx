'use client';

import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { apiClient } from '@/lib/api/client';

export interface SystemSettings {
  agency_name: string;
  contact_email: string;
  currency: "IDR" | "USD" | "SGD" | string;
}

export interface SettingsContextType {
  settings: SystemSettings;
  loading: boolean;
  refreshSettings: () => Promise<void>;
  formatCurrency: (amount?: number | null) => string;
}

export const DEFAULT_SETTINGS: SystemSettings = {
  agency_name: "LOCO TRACK",
  contact_email: "admin@lococreative.com",
  currency: "IDR",
};

export const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshSettings = useCallback(async () => {
    try {
      const response = await apiClient.get('/settings');
      if (response.data?.data) {
        setSettings((prev) => ({
          ...prev,
          ...response.data.data,
        }));
      }
    } catch (error) {
      // Retain fallback defaults if unauthenticated or offline
      console.warn("Could not fetch system settings, using defaults.", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSettings();
  }, [refreshSettings]);

  const formatCurrency = useCallback((amount?: number | null): string => {
    let val = amount ?? 0;
    if (isNaN(val)) val = 0;

    const curr = settings.currency || "IDR";
    switch (curr.toUpperCase()) {
      case "USD":
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 2,
        }).format(val);
      case "SGD":
        return new Intl.NumberFormat("en-SG", {
          style: "currency",
          currency: "SGD",
          maximumFractionDigits: 2,
        }).format(val);
      case "IDR":
      default:
        return new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          maximumFractionDigits: 0,
        }).format(val);
    }
  }, [settings.currency]);

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings, formatCurrency }}>
      {children}
    </SettingsContext.Provider>
  );
};
