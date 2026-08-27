"use client";

import React, { useEffect, useState, useMemo } from "react";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { apiClient } from "@/lib/api/client";
import Link from "next/link";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface WorkloadData {
  id?: number;
  name: string;
  active_tasks_count?: number;
  active_tasks?: number;
}

export default function WorkloadChart() {
  const [data, setData] = useState<WorkloadData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkload = async () => {
      try {
        const response = await apiClient.get("/dashboard/workload");
        setData(response.data?.data || response.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch workload");
      } finally {
        setLoading(false);
      }
    };

    fetchWorkload();
  }, []);

  const { categories, seriesData, totalTasks, totalMembers } = useMemo(() => {
    const validData = (data || []).map((item) => ({
      name: item.name || "Member",
      count: Number(item.active_tasks_count ?? item.active_tasks ?? 0),
    }));

    return {
      categories: validData.map((d) => d.name),
      seriesData: validData.map((d) => d.count),
      totalTasks: validData.reduce((acc, c) => acc + c.count, 0),
      totalMembers: validData.length,
    };
  }, [data]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03] min-h-[360px] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4 w-full">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3 self-start"></div>
          <div className="h-52 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03] min-h-[360px] flex items-center justify-center text-error-500 text-sm">
        {error}
      </div>
    );
  }

  const options: ApexOptions = {
    colors: ["#465fff"],
    chart: {
      fontFamily: "inherit",
      type: "bar",
      height: 280,
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "40%",
        borderRadius: 6,
      },
    },
    dataLabels: { enabled: false },
    legend: { show: false },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    xaxis: {
      categories: categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: {
          colors: "#94a3b8",
          fontSize: "12px",
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: "#94a3b8",
          fontSize: "12px",
        },
      },
    },
    grid: {
      borderColor: "rgba(226, 232, 240, 0.6)",
      strokeDashArray: 4,
      yaxis: { lines: { show: true } },
    },
    tooltip: {
      theme: "dark",
      y: {
        formatter: (val: number) => `${val} tasks`,
      },
    },
  };

  const series = [
    {
      name: "Active Tasks",
      data: seriesData,
    },
  ];

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Team Workload
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Active tasks assigned per team member
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-md bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700 dark:bg-brand-500/10 dark:text-brand-400">
              {totalTasks} Active Tasks
            </span>
            <Link
              href="/production/workload"
              className="text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
            >
              Details &rarr;
            </Link>
          </div>
        </div>

        {/* Chart */}
        <div className="mt-4 min-h-[280px]">
          {categories.length === 0 ? (
            <div className="py-20 text-center text-sm text-gray-400">
              Belum ada data tugas aktif tim.
            </div>
          ) : (
            <ReactApexChart options={options} series={series} type="bar" height={280} />
          )}
        </div>
      </div>
    </div>
  );
}
