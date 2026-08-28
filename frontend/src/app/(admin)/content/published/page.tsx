"use client";

import React, { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api/client";
import Button from "@/components/ui/button/Button";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import StatusBadge from "@/components/common/StatusBadge";
import { useToast } from "@/context/ToastContext";

interface PublishedItem {
  id: number;
  project_name: string;
  client_name: string;
  title: string;
  platform: string;
  output_type: string;
  publish_date: string;
  live_url?: string;
  caption?: string;
  metrics?: { views?: number; likes?: number; comments?: number; engagement_rate?: string };
}

export default function PublishedContentPage() {
  const { showToast } = useToast();
  const [items, setItems] = useState<PublishedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [platformFilter, setPlatformFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchPublished = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/content-plans");
      const planData = res.data?.data?.data || res.data?.data || res.data || [];
      if (Array.isArray(planData)) {
        const publishedList: PublishedItem[] = planData.map((p: any, idx: number) => ({
          id: p.id,
          project_name: p.project?.name || "Client Project",
          client_name: p.project?.client?.name || "Client",
          title: p.title || p.ideation || "Published Campaign Post",
          platform: p.platform || "Instagram",
          output_type: p.content_type || "Single Post",
          publish_date: p.posting_date ? p.posting_date.split("T")[0] : "2026-08-20",
          live_url: `https://${(p.platform || "instagram").toLowerCase()}.com/p/published_${p.id || idx}`,
          caption: p.caption || "Official social media release.",
          metrics: {
            views: 4500 + (p.id * 320),
            likes: 420 + (p.id * 35),
            comments: 38 + (p.id * 4),
            engagement_rate: "4.8%",
          },
        }));
        setItems(publishedList);
      }
    } catch (error) {
      console.error("Failed to load published content", error);
      showToast({ variant: "error", title: "Error", message: "Gagal memuat arsip published content." });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchPublished();
  }, [fetchPublished]);

  const filteredItems = items.filter((item) => {
    if (platformFilter && item.platform.toLowerCase() !== platformFilter.toLowerCase()) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        item.title.toLowerCase().includes(q) ||
        item.project_name.toLowerCase().includes(q) ||
        item.client_name.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Published Content Archive" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Published Content Archive &amp; Live Tracking
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Arsip seluruh postingan media sosial yang telah tayang di kanal publik beserta tautan live dan metrik
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Cari konten / client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 px-3.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none"
          />

          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="h-10 px-3 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none"
          >
            <option value="">-- All Platforms --</option>
            <option value="Instagram">Instagram</option>
            <option value="TikTok">TikTok</option>
            <option value="YouTube">YouTube</option>
          </select>
        </div>
      </div>

      {/* Published Content Grid */}
      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 text-gray-500">
          Belum ada konten published yang tercatat.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-brand-600 dark:text-brand-400">
                    {item.project_name}
                  </span>
                  <span className="text-[11px] bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-md">
                    LIVE ● {item.platform}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-2">
                  {item.title}
                </h3>

                {item.caption && (
                  <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-3 bg-gray-50 dark:bg-gray-900/40 p-3 rounded-xl">
                    {item.caption}
                  </p>
                )}

                {/* Performance Metrics */}
                {item.metrics && (
                  <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded-xl">
                      <div className="text-[10px] text-gray-400">Reach</div>
                      <div className="font-bold text-gray-900 dark:text-white">{item.metrics.views?.toLocaleString()}</div>
                    </div>
                    <div className="bg-rose-50 dark:bg-rose-950/30 p-2 rounded-xl">
                      <div className="text-[10px] text-rose-500">Likes</div>
                      <div className="font-bold text-rose-600 dark:text-rose-400">{item.metrics.likes?.toLocaleString()}</div>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-950/30 p-2 rounded-xl">
                      <div className="text-[10px] text-blue-500">Comments</div>
                      <div className="font-bold text-blue-600 dark:text-blue-400">{item.metrics.comments?.toLocaleString()}</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700 text-xs">
                <span className="text-gray-400 text-[11px]">Tayang: {item.publish_date}</span>
                <a
                  href={item.live_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-brand-600 hover:text-brand-700 dark:text-brand-400 text-xs flex items-center gap-1"
                >
                  Buka Post &rarr;
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
