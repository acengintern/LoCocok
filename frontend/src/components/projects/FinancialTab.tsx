"use client";

import React, { useState, useEffect } from "react";
import { apiClient } from "@/lib/api/client";
import Button from "@/components/ui/button/Button";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { ProjectFinancial, ProjectPayment, ProjectCost } from "@/types/api";

interface FinancialTabProps {
  projectId: string;
}

export default function FinancialTab({ projectId }: FinancialTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<"summary" | "payments" | "costs">("summary");
  
  const [financial, setFinancial] = useState<ProjectFinancial | null>(null);
  const [payments, setPayments] = useState<ProjectPayment[]>([]);
  const [costs, setCosts] = useState<ProjectCost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [finRes, payRes, costRes] = await Promise.all([
          apiClient.get(`/projects/${projectId}/financials`).catch(() => ({ data: null })),
          apiClient.get(`/projects/${projectId}/payments`).catch(() => ({ data: { data: [] } })),
          apiClient.get(`/projects/${projectId}/costs`).catch(() => ({ data: { data: [] } }))
        ]);

        setFinancial(finRes.data?.data || finRes.data || null);

        const rawPay = payRes?.data?.data;
        setPayments(Array.isArray(rawPay?.data) ? rawPay.data : Array.isArray(rawPay) ? rawPay : Array.isArray(payRes?.data) ? payRes.data : []);

        const rawCost = costRes?.data?.data;
        setCosts(Array.isArray(rawCost?.data) ? rawCost.data : Array.isArray(rawCost) ? rawCost : Array.isArray(costRes?.data) ? costRes.data : []);
      } catch (error) {
        console.error("Failed to fetch financial data", error);
        setPayments([]);
        setCosts([]);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchData();
    }
  }, [projectId]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      {/* Sub Tabs */}
      <div className="border-b border-gray-200 dark:border-white/[0.05] px-6">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          {[
            { id: "summary", label: "Summary" },
            { id: "payments", label: "Payments" },
            { id: "costs", label: "Costs" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`${
                activeSubTab === tab.id
                  ? "border-brand-500 text-brand-600 dark:text-brand-400"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-6">
        {activeSubTab === "summary" && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Financial Summary</h3>
            {financial ? (
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-white/[0.02] rounded-lg">
                  <dt className="text-sm font-medium text-gray-500">Total Budget</dt>
                  <dd className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                    ${financial.total_budget ? Number(financial.total_budget).toLocaleString() : "0"}
                  </dd>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-white/[0.02] rounded-lg">
                  <dt className="text-sm font-medium text-gray-500">Used Budget</dt>
                  <dd className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                    ${financial.used_budget ? Number(financial.used_budget).toLocaleString() : "0"}
                  </dd>
                </div>
              </dl>
            ) : (
              <div className="text-gray-500">No financial summary available.</div>
            )}
          </div>
        )}

        {activeSubTab === "payments" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Payments</h3>
              <Button>Add Payment</Button>
            </div>
            {(!Array.isArray(payments) || payments.length === 0) ? (
              <div className="text-center text-gray-500 py-4">No payments found.</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gray-50 dark:bg-white/[0.02]">
                    <TableRow>
                      <TableCell isHeader>Amount</TableCell>
                      <TableCell isHeader>Date</TableCell>
                      <TableCell isHeader>Status</TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(Array.isArray(payments) ? payments : []).map((payment) => (
                      <TableRow key={payment.id} className="border-b border-gray-200 dark:border-white/[0.05]">
                        <TableCell>${Number(payment.amount).toLocaleString()}</TableCell>
                        <TableCell>{payment.payment_date || "-"}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {payment.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        )}

        {activeSubTab === "costs" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Costs</h3>
              <Button>Add Cost</Button>
            </div>
            {(!Array.isArray(costs) || costs.length === 0) ? (
              <div className="text-center text-gray-500 py-4">No costs found.</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gray-50 dark:bg-white/[0.02]">
                    <TableRow>
                      <TableCell isHeader>Description</TableCell>
                      <TableCell isHeader>Amount</TableCell>
                      <TableCell isHeader>Date</TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(Array.isArray(costs) ? costs : []).map((cost) => (
                      <TableRow key={cost.id} className="border-b border-gray-200 dark:border-white/[0.05]">
                        <TableCell>{cost.description || "-"}</TableCell>
                        <TableCell>${Number(cost.amount).toLocaleString()}</TableCell>
                        <TableCell>{cost.cost_date || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
