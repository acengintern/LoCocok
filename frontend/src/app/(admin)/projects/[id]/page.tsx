"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiClient } from "@/lib/api/client";
import Button from "@/components/ui/button/Button";
import { useAuth } from "@/hooks/useAuth";
import { hasRole } from "@/lib/rbac";
import ContractsTab from "@/components/projects/ContractsTab";
import FinancialTab from "@/components/projects/FinancialTab";
import OutputsTab from "@/components/projects/OutputsTab";
import ContentPlanningTab from "@/components/projects/ContentPlanningTab";
import TasksTab from "@/components/projects/TasksTab";
import FilesTab from "@/components/projects/FilesTab";
import Modal from "@/components/common/Modal";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import DatePicker from "@/components/form/date-picker";
import { useToast } from "@/context/ToastContext";

interface UserOption {
  id: number;
  name: string;
  roles?: { id: number; name: string }[];
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { user } = useAuth();
  const { showToast } = useToast();

  const showFinancial = hasRole(user, ["System Administrator", "Finance"]);

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [clientsList, setClientsList] = useState<{ id: number; name: string }[]>([]);
  const [typesList, setTypesList] = useState<{ id: number; name: string }[]>([]);
  const [usersList, setUsersList] = useState<UserOption[]>([]);
  const [saving, setSaving] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: "",
    client_id: "",
    project_type_id: "",
    ae_id: "",
    sms_id: "",
    cd_id: "",
    priority: "MID",
    status: "CONTENT_PLANNING",
    start_date: "",
    end_date: "",
    notes: "",
  });

  const fetchProject = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/projects/${id}?include=client,projectType,ae,sms,cd`);
      setProject(res.data?.data || res.data);
    } catch (error) {
      console.error("Failed to fetch project details", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchOptions = useCallback(async () => {
    try {
      const [cRes, tRes, uRes] = await Promise.all([
        apiClient.get("/clients"),
        apiClient.get("/master/project-types"),
        apiClient.get("/users"),
      ]);
      const cData = cRes.data?.data ?? cRes.data;
      const tData = tRes.data?.data ?? tRes.data;
      const uData = uRes.data?.data ?? uRes.data;
      if (Array.isArray(cData)) setClientsList(cData);
      if (Array.isArray(tData)) setTypesList(tData);
      if (Array.isArray(uData)) setUsersList(uData);
    } catch (err) {
      console.error("Failed to fetch options", err);
    }
  }, []);

  useEffect(() => {
    if (id) {
      fetchProject();
      fetchOptions();
    }
  }, [id, fetchProject, fetchOptions]);

  const handleOpenEdit = () => {
    if (!project) return;
    setEditFormData({
      name: project.name || "",
      client_id: project.client?.id ? String(project.client.id) : project.client_id ? String(project.client_id) : "",
      project_type_id: project.project_type?.id ? String(project.project_type.id) : project.project_type_id ? String(project.project_type_id) : "",
      ae_id: project.ae?.id ? String(project.ae.id) : project.ae_id ? String(project.ae_id) : "",
      sms_id: project.sms?.id ? String(project.sms.id) : project.sms_id ? String(project.sms_id) : "",
      cd_id: project.creative_director?.id ? String(project.creative_director.id) : project.cd_id ? String(project.cd_id) : "",
      priority: project.priority || "MID",
      status: project.status || "CONTENT_PLANNING",
      start_date: project.start_date ? project.start_date.split("T")[0] : "",
      end_date: project.end_date ? project.end_date.split("T")[0] : "",
      notes: project.notes || "",
    });
    setIsEditModalOpen(true);
  };

  // Filter users strictly by specific role keywords (excluding administrator)
  const checkUserHasRole = useCallback((user: UserOption, targetKeywords: string[]) => {
    if (!user.roles || user.roles.length === 0) return false;
    return user.roles.some((r) => {
      const roleName = (typeof r === "string" ? r : r.name)?.toLowerCase() || "";
      return targetKeywords.some((keyword) => roleName.includes(keyword.toLowerCase()));
    });
  }, []);

  const aeOptions = useMemo(() => {
    const filtered = usersList.filter((u) => checkUserHasRole(u, ["account executive", "ae"]));
    return [
      { value: "", label: "-- Unassigned PIC AE --" },
      ...filtered.map((u) => ({
        value: String(u.id),
        label: `${u.name}${u.roles?.length ? ` (${u.roles.map((r) => r.name).join(", ")})` : ""}`,
      })),
    ];
  }, [usersList, checkUserHasRole]);

  const smsOptions = useMemo(() => {
    const filtered = usersList.filter((u) => checkUserHasRole(u, ["social media", "sms"]));
    return [
      { value: "", label: "-- Unassigned PIC SMS --" },
      ...filtered.map((u) => ({
        value: String(u.id),
        label: `${u.name}${u.roles?.length ? ` (${u.roles.map((r) => r.name).join(", ")})` : ""}`,
      })),
    ];
  }, [usersList, checkUserHasRole]);

  const cdOptions = useMemo(() => {
    const filtered = usersList.filter((u) => checkUserHasRole(u, ["creative director", "cd"]));
    return [
      { value: "", label: "-- Unassigned PIC CD --" },
      ...filtered.map((u) => ({
        value: String(u.id),
        label: `${u.name}${u.roles?.length ? ` (${u.roles.map((r) => r.name).join(", ")})` : ""}`,
      })),
    ];
  }, [usersList, checkUserHasRole]);

  const handleSaveEdit = async () => {
    if (!editFormData.name.trim()) {
      showToast({ variant: "error", title: "Validation Error", message: "Project name is required." });
      return;
    }

    setSaving(true);
    try {
      const payload: Record<string, any> = {
        name: editFormData.name.trim(),
        client_id: Number(editFormData.client_id),
        project_type_id: Number(editFormData.project_type_id),
        priority: editFormData.priority,
        status: editFormData.status,
        ae_id: editFormData.ae_id ? Number(editFormData.ae_id) : null,
        sms_id: editFormData.sms_id ? Number(editFormData.sms_id) : null,
        cd_id: editFormData.cd_id ? Number(editFormData.cd_id) : null,
        start_date: editFormData.start_date || null,
        end_date: editFormData.end_date || null,
        notes: editFormData.notes || null,
      };

      await apiClient.put(`/projects/${id}`, payload);
      showToast({
        variant: "success",
        title: "Project Updated",
        message: "Perubahan project dan alokasi PIC berhasil disimpan.",
      });
      setIsEditModalOpen(false);
      fetchProject();
    } catch (err: any) {
      showToast({
        variant: "error",
        title: "Update Failed",
        message: err.response?.data?.message || "Failed to update project.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Project Not Found</h2>
        <Button onClick={() => router.push("/projects")}>Back to Projects</Button>
      </div>
    );
  }

  const userSelectOptions = [
    { value: "", label: "-- Unassigned --" },
    ...usersList.map((u) => {
      const roleStr = u.roles?.map((r) => r.name).join(", ");
      return {
        value: String(u.id),
        label: roleStr ? `${u.name} (${roleStr})` : u.name,
      };
    }),
  ];

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "contracts", label: "Contracts" },
    { id: "outputs", label: "Outputs" },
    { id: "content-planning", label: "Content Planning" },
    { id: "tasks", label: "Tasks" },
    ...(showFinancial ? [{ id: "financial", label: "Financial" }] : []),
    { id: "files", label: "Files" },
    { id: "timeline", label: "Timeline" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-brand-600 dark:text-brand-400">
              {project.project_code || `PRJ-${project.id}`}
            </span>
            <span className="text-xs text-gray-400">&bull;</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {project.client?.name || "No Client"}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white mt-1">
            {project.name}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.push("/projects")}>
            Back
          </Button>
          <Button onClick={handleOpenEdit} className="bg-brand-500 hover:bg-brand-600 text-white">
            Edit Project &amp; PIC
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-white/[0.05]">
        <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${
                activeTab === tab.id
                  ? "border-brand-500 text-brand-600 dark:text-brand-400"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors cursor-pointer`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="pt-2">
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">
                Project Details
              </h3>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">Project Type</dt>
                  <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{project.project_type?.name || project.projectType?.name || "-"}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">Status</dt>
                  <dd className="mt-1">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400">
                      {project.status || "-"}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">Priority</dt>
                  <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{project.priority || "-"}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">Start Date</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">{project.start_date || "-"}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">Deadline (End Date)</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">{project.end_date || "-"}</dd>
                </div>
              </dl>
              {project.notes && (
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">Notes &amp; Brief</dt>
                  <dd className="mt-1 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{project.notes}</dd>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  PIC &amp; Team Assignments
                </h3>
                <button
                  type="button"
                  onClick={handleOpenEdit}
                  className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
                >
                  Edit PIC &rarr;
                </button>
              </div>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-3 dark:border-gray-800 dark:bg-white/[0.02]">
                  <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">Account Executive (AE)</dt>
                  <dd className="mt-1 text-sm font-bold text-gray-900 dark:text-white">
                    {project.ae?.name ? project.ae.name : project.ae ? `${project.ae.first_name || ''} ${project.ae.last_name || ''}`.trim() || "-" : "-"}
                  </dd>
                </div>
                <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-3 dark:border-gray-800 dark:bg-white/[0.02]">
                  <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">Social Media Specialist (SMS)</dt>
                  <dd className="mt-1 text-sm font-bold text-gray-900 dark:text-white">
                    {project.sms?.name ? project.sms.name : project.sms ? `${project.sms.first_name || ''} ${project.sms.last_name || ''}`.trim() || "-" : "-"}
                  </dd>
                </div>
                <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-3 dark:border-gray-800 dark:bg-white/[0.02] sm:col-span-2">
                  <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">Creative Director (CD)</dt>
                  <dd className="mt-1 text-sm font-bold text-gray-900 dark:text-white">
                    {project.cd?.name ? project.cd.name : project.cd ? `${project.cd.first_name || ''} ${project.cd.last_name || ''}`.trim() || "-" : "-"}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        )}

        {activeTab === "contracts" && <ContractsTab projectId={id} />}
        {activeTab === "outputs" && <OutputsTab projectId={id} />}
        {activeTab === "content-planning" && <ContentPlanningTab projectId={id} />}
        {activeTab === "tasks" && <TasksTab projectId={id} />}
        {activeTab === "financial" && showFinancial && <FinancialTab projectId={id} />}
        {activeTab === "files" && <FilesTab projectId={id} />}
        {activeTab === "timeline" && (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03] text-center text-gray-500">
            Timeline module will be implemented in subsequent tasks.
          </div>
        )}
      </div>

      {/* Edit Project Modal with Full PIC Support */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Project & PIC Assignments"
        maxWidth="2xl"
      >
        <div className="space-y-4 max-h-[75vh] overflow-y-auto px-2 py-1">
          {/* Row 1: Project Name & Client */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Project Name *</Label>
              <Input
                type="text"
                placeholder="e.g. Social Media Campaign Q3"
                value={editFormData.name}
                onChange={(e) => {
                  const val = e.target.value;
                  setEditFormData((prev) => ({ ...prev, name: val }));
                }}
              />
            </div>

            <div>
              <Label>Client *</Label>
              <Select
                searchable={true}
                searchPlaceholder="Cari nama client..."
                options={clientsList.map((c) => ({ value: String(c.id), label: c.name }))}
                value={editFormData.client_id}
                onChange={(val) => setEditFormData((prev) => ({ ...prev, client_id: val }))}
                placeholder="Select Client"
              />
            </div>
          </div>

          {/* Row 2: Project Type, Priority & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label>Project Type *</Label>
              <Select
                options={typesList.map((t) => ({ value: String(t.id), label: t.name }))}
                value={editFormData.project_type_id}
                onChange={(val) => setEditFormData((prev) => ({ ...prev, project_type_id: val }))}
                placeholder="Select Project Type"
              />
            </div>

            <div>
              <Label>Priority</Label>
              <Select
                options={[
                  { value: "LOW", label: "Low" },
                  { value: "MID", label: "Mid" },
                  { value: "HIGH", label: "High" },
                  { value: "URGENT", label: "Urgent" },
                ]}
                value={editFormData.priority}
                onChange={(val) => setEditFormData((prev) => ({ ...prev, priority: val }))}
                placeholder="Select Priority"
              />
            </div>

            <div>
              <Label>Status</Label>
              <Select
                options={[
                  { value: "CONTENT_PLANNING", label: "Content Planning" },
                  { value: "SCRIPT_READY", label: "Script Ready" },
                  { value: "DESIGN", label: "Design" },
                  { value: "EDITING", label: "Editing" },
                  { value: "QC_INTERNAL", label: "QC Internal" },
                  { value: "CLIENT_REVIEW", label: "Client Review" },
                  { value: "REVISION", label: "Revision" },
                  { value: "APPROVED", label: "Approved" },
                  { value: "PUBLISHED", label: "Published" },
                  { value: "DONE", label: "Done / Completed" },
                  { value: "HOLD", label: "On Hold" },
                ]}
                value={editFormData.status}
                onChange={(val) => setEditFormData((prev) => ({ ...prev, status: val }))}
                placeholder="Select Status"
              />
            </div>
          </div>

          {/* Row 3: PIC Team Assignments */}
          <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-3.5 dark:border-gray-800 dark:bg-white/[0.02] space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>PIC &amp; Team Assignments</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <Label>PIC Account Executive (AE)</Label>
                <Select
                  options={aeOptions}
                  value={editFormData.ae_id}
                  onChange={(val) => setEditFormData((prev) => ({ ...prev, ae_id: val }))}
                  placeholder="Pilih PIC AE"
                />
              </div>

              <div>
                <Label>PIC Social Media (SMS)</Label>
                <Select
                  options={smsOptions}
                  value={editFormData.sms_id}
                  onChange={(val) => setEditFormData((prev) => ({ ...prev, sms_id: val }))}
                  placeholder="Pilih PIC SMS"
                />
              </div>

              <div>
                <Label>Creative Director (CD)</Label>
                <Select
                  options={cdOptions}
                  value={editFormData.cd_id}
                  onChange={(val) => setEditFormData((prev) => ({ ...prev, cd_id: val }))}
                  placeholder="Pilih PIC CD"
                />
              </div>
            </div>
          </div>

          {/* Row 4: Start Date & End Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <DatePicker
                id="edit_detail_start_date"
                label="Start Date"
                placeholder="Pilih tanggal mulai"
                value={editFormData.start_date}
                onChange={(dateStr) => setEditFormData((prev) => ({ ...prev, start_date: dateStr }))}
              />
            </div>

            <div>
              <DatePicker
                id="edit_detail_end_date"
                label="Deadline (End Date)"
                placeholder="Pilih tanggal deadline"
                value={editFormData.end_date}
                onChange={(dateStr) => setEditFormData((prev) => ({ ...prev, end_date: dateStr }))}
              />
            </div>
          </div>

          {/* Row 5: Notes / Brief */}
          <div>
            <Label>Project Notes / Scope Brief</Label>
            <textarea
              rows={2}
              placeholder="Catatan ruang lingkup project, deliverables, atau instruksi khusus..."
              value={editFormData.notes}
              onChange={(e) => {
                const val = e.target.value;
                setEditFormData((prev) => ({ ...prev, notes: val }));
              }}
              className="w-full rounded-xl border border-gray-200 bg-white p-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={saving} className="bg-brand-500 hover:bg-brand-600 text-white">
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
