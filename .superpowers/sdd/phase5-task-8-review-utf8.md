diff --git a/src/app/(admin)/projects/[id]/page.tsx b/src/app/(admin)/projects/[id]/page.tsx
index 39104b3..fbdd7a5 100644
--- a/src/app/(admin)/projects/[id]/page.tsx
+++ b/src/app/(admin)/projects/[id]/page.tsx
@@ -3,11 +3,18 @@ import React, { useState, useEffect } from "react";
 import { useParams, useRouter } from "next/navigation";
 import { apiClient } from "@/lib/api/client";
 import Button from "@/components/ui/button/Button";
+import { useAuth } from "@/hooks/useAuth";
+import { hasRole } from "@/lib/rbac";
+import ContractsTab from "@/components/projects/ContractsTab";
+import FinancialTab from "@/components/projects/FinancialTab";
 
 export default function ProjectDetailPage() {
   const params = useParams();
   const router = useRouter();
   const id = params.id as string;
+  const { user } = useAuth();
+
+  const showFinancial = hasRole(user, ["System Administrator", "Finance"]);
 
   const [project, setProject] = useState<any>(null);
   const [loading, setLoading] = useState(true);
@@ -49,9 +56,10 @@ export default function ProjectDetailPage() {
 
   const tabs = [
     { id: "overview", label: "Overview" },
+    { id: "contracts", label: "Contracts" },
     { id: "outputs", label: "Outputs" },
     { id: "tasks", label: "Tasks" },
-    { id: "financial", label: "Financial" },
+    ...(showFinancial ? [{ id: "financial", label: "Financial" }] : []),
     { id: "files", label: "Files" },
     { id: "timeline", label: "Timeline" },
   ];
@@ -153,6 +161,9 @@ export default function ProjectDetailPage() {
           </div>
         )}
 
+        {activeTab === "contracts" && (
+          <ContractsTab projectId={id} />
+        )}
         {activeTab === "outputs" && (
           <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03] text-center text-gray-500">
             Outputs module will be implemented in subsequent tasks.
@@ -163,10 +174,8 @@ export default function ProjectDetailPage() {
             Tasks module will be implemented in subsequent tasks.
           </div>
         )}
-        {activeTab === "financial" && (
-          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03] text-center text-gray-500">
-            Financial module will be implemented in subsequent tasks.
-          </div>
+        {activeTab === "financial" && showFinancial && (
+          <FinancialTab projectId={id} />
         )}
         {activeTab === "files" && (
           <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03] text-center text-gray-500">
diff --git a/src/components/projects/ContractsTab.tsx b/src/components/projects/ContractsTab.tsx
new file mode 100644
index 0000000..0bb5485
--- /dev/null
+++ b/src/components/projects/ContractsTab.tsx
@@ -0,0 +1,80 @@
+"use client";
+
+import React, { useState, useEffect } from "react";
+import { apiClient } from "@/lib/api/client";
+import Button from "@/components/ui/button/Button";
+import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
+import { Contract } from "@/types/api";
+
+interface ContractsTabProps {
+  projectId: string;
+}
+
+export default function ContractsTab({ projectId }: ContractsTabProps) {
+  const [contracts, setContracts] = useState<Contract[]>([]);
+  const [loading, setLoading] = useState(true);
+
+  useEffect(() => {
+    const fetchContracts = async () => {
+      try {
+        setLoading(true);
+        const res = await apiClient.get(`/projects/${projectId}/contracts`);
+        setContracts(res.data?.data || res.data || []);
+      } catch (error) {
+        console.error("Failed to fetch contracts", error);
+      } finally {
+        setLoading(false);
+      }
+    };
+
+    if (projectId) {
+      fetchContracts();
+    }
+  }, [projectId]);
+
+  return (
+    <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
+      <div className="flex justify-between items-center mb-4">
+        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Contracts</h3>
+        <Button>Add Contract</Button>
+      </div>
+
+      {loading ? (
+        <div className="flex justify-center py-4">
+          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-500"></div>
+        </div>
+      ) : contracts.length === 0 ? (
+        <div className="text-center text-gray-500 py-4">No contracts found.</div>
+      ) : (
+        <div className="overflow-x-auto">
+          <Table>
+            <TableHeader className="bg-gray-50 dark:bg-white/[0.02]">
+              <TableRow>
+                <TableCell isHeader>Contract Number</TableCell>
+                <TableCell isHeader>Start Date</TableCell>
+                <TableCell isHeader>End Date</TableCell>
+                <TableCell isHeader>Value</TableCell>
+                <TableCell isHeader>Actions</TableCell>
+              </TableRow>
+            </TableHeader>
+            <TableBody>
+              {contracts.map((contract) => (
+                <TableRow key={contract.id} className="border-b border-gray-200 dark:border-white/[0.05]">
+                  <TableCell>{contract.contract_number}</TableCell>
+                  <TableCell>{contract.start_date || "-"}</TableCell>
+                  <TableCell>{contract.end_date || "-"}</TableCell>
+                  <TableCell>
+                    {contract.value !== undefined ? `$${Number(contract.value).toLocaleString()}` : "-"}
+                  </TableCell>
+                  <TableCell>
+                    <Button variant="outline" size="sm">Edit</Button>
+                  </TableCell>
+                </TableRow>
+              ))}
+            </TableBody>
+          </Table>
+        </div>
+      )}
+    </div>
+  );
+}
diff --git a/src/components/projects/FinancialTab.tsx b/src/components/projects/FinancialTab.tsx
new file mode 100644
index 0000000..9d8db1a
--- /dev/null
+++ b/src/components/projects/FinancialTab.tsx
@@ -0,0 +1,176 @@
+"use client";
+
+import React, { useState, useEffect } from "react";
+import { apiClient } from "@/lib/api/client";
+import Button from "@/components/ui/button/Button";
+import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
+import { ProjectFinancial, ProjectPayment, ProjectCost } from "@/types/api";
+
+interface FinancialTabProps {
+  projectId: string;
+}
+
+export default function FinancialTab({ projectId }: FinancialTabProps) {
+  const [activeSubTab, setActiveSubTab] = useState<"summary" | "payments" | "costs">("summary");
+  
+  const [financial, setFinancial] = useState<ProjectFinancial | null>(null);
+  const [payments, setPayments] = useState<ProjectPayment[]>([]);
+  const [costs, setCosts] = useState<ProjectCost[]>([]);
+  const [loading, setLoading] = useState(true);
+
+  useEffect(() => {
+    const fetchData = async () => {
+      try {
+        setLoading(true);
+        const [finRes, payRes, costRes] = await Promise.all([
+          apiClient.get(`/projects/${projectId}/financials`).catch(() => ({ data: null })),
+          apiClient.get(`/projects/${projectId}/payments`).catch(() => ({ data: { data: [] } })),
+          apiClient.get(`/projects/${projectId}/costs`).catch(() => ({ data: { data: [] } }))
+        ]);
+
+        setFinancial(finRes.data?.data || finRes.data || null);
+        setPayments(payRes.data?.data || payRes.data || []);
+        setCosts(costRes.data?.data || costRes.data || []);
+      } catch (error) {
+        console.error("Failed to fetch financial data", error);
+      } finally {
+        setLoading(false);
+      }
+    };
+
+    if (projectId) {
+      fetchData();
+    }
+  }, [projectId]);
+
+  if (loading) {
+    return (
+      <div className="flex justify-center py-8">
+        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
+      </div>
+    );
+  }
+
+  return (
+    <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
+      {/* Sub Tabs */}
+      <div className="border-b border-gray-200 dark:border-white/[0.05] px-6">
+        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
+          {[
+            { id: "summary", label: "Summary" },
+            { id: "payments", label: "Payments" },
+            { id: "costs", label: "Costs" },
+          ].map((tab) => (
+            <button
+              key={tab.id}
+              onClick={() => setActiveSubTab(tab.id as any)}
+              className={`${
+                activeSubTab === tab.id
+                  ? "border-brand-500 text-brand-600 dark:text-brand-400"
+                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
+              } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors`}
+            >
+              {tab.label}
+            </button>
+          ))}
+        </nav>
+      </div>
+
+      <div className="p-6">
+        {activeSubTab === "summary" && (
+          <div>
+            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Financial Summary</h3>
+            {financial ? (
+              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
+                <div className="p-4 bg-gray-50 dark:bg-white/[0.02] rounded-lg">
+                  <dt className="text-sm font-medium text-gray-500">Total Budget</dt>
+                  <dd className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
+                    ${financial.total_budget ? Number(financial.total_budget).toLocaleString() : "0"}
+                  </dd>
+                </div>
+                <div className="p-4 bg-gray-50 dark:bg-white/[0.02] rounded-lg">
+                  <dt className="text-sm font-medium text-gray-500">Used Budget</dt>
+                  <dd className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
+                    ${financial.used_budget ? Number(financial.used_budget).toLocaleString() : "0"}
+                  </dd>
+                </div>
+              </dl>
+            ) : (
+              <div className="text-gray-500">No financial summary available.</div>
+            )}
+          </div>
+        )}
+
+        {activeSubTab === "payments" && (
+          <div>
+            <div className="flex justify-between items-center mb-4">
+              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Payments</h3>
+              <Button>Add Payment</Button>
+            </div>
+            {payments.length === 0 ? (
+              <div className="text-center text-gray-500 py-4">No payments found.</div>
+            ) : (
+              <div className="overflow-x-auto">
+                <Table>
+                  <TableHeader className="bg-gray-50 dark:bg-white/[0.02]">
+                    <TableRow>
+                      <TableCell isHeader>Amount</TableCell>
+                      <TableCell isHeader>Date</TableCell>
+                      <TableCell isHeader>Status</TableCell>
+                    </TableRow>
+                  </TableHeader>
+                  <TableBody>
+                    {payments.map((payment) => (
+                      <TableRow key={payment.id} className="border-b border-gray-200 dark:border-white/[0.05]">
+                        <TableCell>${Number(payment.amount).toLocaleString()}</TableCell>
+                        <TableCell>{payment.payment_date || "-"}</TableCell>
+                        <TableCell>
+                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
+                            {payment.status}
+                          </span>
+                        </TableCell>
+                      </TableRow>
+                    ))}
+                  </TableBody>
+                </Table>
+              </div>
+            )}
+          </div>
+        )}
+
+        {activeSubTab === "costs" && (
+          <div>
+            <div className="flex justify-between items-center mb-4">
+              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Costs</h3>
+              <Button>Add Cost</Button>
+            </div>
+            {costs.length === 0 ? (
+              <div className="text-center text-gray-500 py-4">No costs found.</div>
+            ) : (
+              <div className="overflow-x-auto">
+                <Table>
+                  <TableHeader className="bg-gray-50 dark:bg-white/[0.02]">
+                    <TableRow>
+                      <TableCell isHeader>Description</TableCell>
+                      <TableCell isHeader>Amount</TableCell>
+                      <TableCell isHeader>Date</TableCell>
+                    </TableRow>
+                  </TableHeader>
+                  <TableBody>
+                    {costs.map((cost) => (
+                      <TableRow key={cost.id} className="border-b border-gray-200 dark:border-white/[0.05]">
+                        <TableCell>{cost.description || "-"}</TableCell>
+                        <TableCell>${Number(cost.amount).toLocaleString()}</TableCell>
+                        <TableCell>{cost.cost_date || "-"}</TableCell>
+                      </TableRow>
+                    ))}
+                  </TableBody>
+                </Table>
+              </div>
+            )}
+          </div>
+        )}
+      </div>
+    </div>
+  );
+}
