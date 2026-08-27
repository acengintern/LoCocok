"use client";
import React, { useEffect, useState, useCallback } from "react";
import { apiClient } from "@/lib/api/client";
import { useToast } from "@/context/ToastContext";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";

interface Permission {
  id: number;
  name: string;
  guard_name?: string;
}

interface Role {
  id: number;
  name: string;
  permissions?: Permission[];
}

const PROTECTED_ROLE = "system administrator";

export default function PermissionsClient() {
  const { showToast } = useToast();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Track which (roleId, permId) combos are currently pending API
  const [toggling, setToggling] = useState<Set<string>>(new Set());
  
  // Search
  const [search, setSearch] = useState("");

  // Responsive view mode: "matrix" on desktop default, "cards" on mobile default
  const [viewMode, setViewMode] = useState<"matrix" | "cards">("matrix");
  const [activeRoleCardId, setActiveRoleCardId] = useState<number | null>(null);

  // Add permission modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newPermName, setNewPermName] = useState("");
  const [addFormError, setAddFormError] = useState<string | null>(null);
  const [addingPerm, setAddingPerm] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [permRes, roleRes] = await Promise.all([
        apiClient.get("/permissions"),
        apiClient.get("/roles"),
      ]);
      const perms = permRes.data?.data ?? permRes.data;
      const rolesRaw = roleRes.data?.data ?? roleRes.data;
      const parsedPerms = Array.isArray(perms) ? perms : [];
      const parsedRoles = Array.isArray(rolesRaw) ? rolesRaw : [];
      
      setPermissions(parsedPerms);
      setRoles(parsedRoles);

      // Select first non-protected role for card view default
      const firstValidRole = parsedRoles.find(
        (r: Role) => r.name.toLowerCase() !== PROTECTED_ROLE
      );
      if (firstValidRole) {
        setActiveRoleCardId(firstValidRole.id);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to load permissions and roles");
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = useCallback(
    (role: Role, permId: number) =>
      Array.isArray(role.permissions) && role.permissions.some((p) => p.id === permId),
    []
  );

  const handleToggle = async (role: Role, perm: Permission) => {
    if (role.name.toLowerCase() === PROTECTED_ROLE) return;
    const key = `${role.id}-${perm.id}`;
    if (toggling.has(key)) return;

    const currently = hasPermission(role, perm.id);
    const existingPerms = role.permissions || [];
    setToggling((prev) => new Set(prev).add(key));

    // Optimistic update
    setRoles((prev) =>
      prev.map((r) => {
        if (r.id !== role.id) return r;
        return {
          ...r,
          permissions: currently
            ? existingPerms.filter((p) => p.id !== perm.id)
            : [...existingPerms, perm],
        };
      })
    );

    try {
      if (currently) {
        // Revoke
        await apiClient.delete(`/roles/${role.id}/permissions/${perm.id}`);
        showToast({
          variant: "warning",
          title: "Permission Revoked",
          message: `"${perm.name}" revoked from ${role.name}.`,
        });
      } else {
        // Assign
        await apiClient.post(`/roles/${role.id}/permissions`, {
          permission_id: perm.id,
        });
        showToast({
          variant: "success",
          title: "Permission Granted",
          message: `"${perm.name}" assigned to ${role.name}.`,
        });
      }
    } catch (err: any) {
      // Rollback on error
      setRoles((prev) =>
        prev.map((r) => {
          if (r.id !== role.id) return r;
          return {
            ...r,
            permissions: currently
              ? [...existingPerms, perm]
              : existingPerms.filter((p) => p.id !== perm.id),
          };
        })
      );
      const msg = err.response?.data?.message || "Failed to update permission";
      showToast({ variant: "error", title: "Error", message: msg });
    } finally {
      setToggling((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  };

  const handleCreatePermission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPermName.trim()) {
      setAddFormError("Permission name is required.");
      return;
    }
    setAddFormError(null);
    setAddingPerm(true);
    try {
      await apiClient.post("/permissions", { name: newPermName.trim().toLowerCase() });
      showToast({
        variant: "success",
        title: "Permission created",
        message: `"${newPermName}" added to matrix.`,
      });
      setIsAddModalOpen(false);
      setNewPermName("");
      fetchData();
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to create permission";
      setAddFormError(msg);
      showToast({ variant: "error", title: "Failed", message: msg });
    } finally {
      setAddingPerm(false);
    }
  };

  const filteredPermissions = permissions.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  // Group permissions logically
  const grouped = filteredPermissions.reduce<Record<string, Permission[]>>(
    (acc, perm) => {
      let group = "General";
      if (perm.name.includes("-")) {
        const parts = perm.name.split("-");
        group = parts.slice(1).join(" ");
      } else if (perm.name.includes(".")) {
        const parts = perm.name.split(".");
        group = parts[0];
      }
      group = group.charAt(0).toUpperCase() + group.slice(1);
      if (!acc[group]) acc[group] = [];
      acc[group].push(perm);
      return acc;
    },
    {}
  );

  const visibleRoles = roles.filter(
    (r) => r.name.toLowerCase() !== PROTECTED_ROLE
  );

  const selectedRole = visibleRoles.find((r) => r.id === activeRoleCardId) || visibleRoles[0];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-gray-400">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
        <span className="text-sm font-medium">Loading RBAC matrix...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-3 rounded-2xl border border-error-200 bg-error-50 p-5 text-sm text-error-600 dark:border-error-800/40 dark:bg-error-950/20 dark:text-error-400">
        <div className="font-semibold text-base">Unable to load Permission Matrix</div>
        <p>{error}</p>
        <Button size="sm" variant="outline" className="w-fit mt-1" onClick={fetchData}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      {/* Control bar: Search, View Switcher, Add Button */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Left: Search input */}
        <div className="relative w-full lg:w-72">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
            <svg className="fill-current" width="14" height="14" viewBox="0 0 20 20" fill="none">
              <path fillRule="evenodd" clipRule="evenodd" d="M3.04199 9.37363C3.04199 5.87693 5.87735 3.04199 9.37533 3.04199C12.8733 3.04199 15.7087 5.87693 15.7087 9.37363C15.7087 12.8703 12.8733 15.7053 9.37533 15.7053C5.87735 15.7053 3.04199 12.8703 3.04199 9.37363ZM9.37533 1.54199C5.04926 1.54199 1.54199 5.04817 1.54199 9.37363C1.54199 13.6991 5.04926 17.2053 9.37533 17.2053C11.2676 17.2053 13.0032 16.5344 14.3572 15.4176L17.1773 18.238C17.4702 18.5309 17.945 18.5309 18.2379 18.238C18.5308 17.9451 18.5309 17.4703 18.238 17.1773L15.4182 14.3573C16.5367 13.0033 17.2087 11.2669 17.2087 9.37363C17.2087 5.04817 13.7014 1.54199 9.37533 1.54199Z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search permissions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8.5 w-full rounded-lg border border-gray-200 bg-white py-1.5 pl-8.5 pr-3 text-theme-xs text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
          />
        </div>

        {/* Right: View Switcher (Matrix vs Role View) + Add Permission button */}
        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2.5">
          {/* View toggle pills */}
          <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50/80 p-0.5 dark:border-gray-800 dark:bg-white/[0.03]">
            <button
              type="button"
              onClick={() => setViewMode("matrix")}
              className={[
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition cursor-pointer",
                viewMode === "matrix"
                  ? "bg-white text-gray-800 font-semibold shadow-theme-xs dark:bg-gray-800 dark:text-white"
                  : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200",
              ].join(" ")}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                <path d="M1 3.5A1.5 1.5 0 0 1 2.5 2h11A1.5 1.5 0 0 1 15 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 1 12.5v-9zM2.5 3a.5.5 0 0 0-.5.5V6h4V3H2.5zm5 0v3h4V3h-4zm5 0v3H14V3.5a.5.5 0 0 0-.5-.5h-1zm1.5 4H14v3h1.5a.5.5 0 0 0 .5-.5V7zm-2.5 0h-4v3h4V7zm-5 0H2v3h4V7zm-4 4v1.5a.5.5 0 0 0 .5.5H6v-2H2zm5 2h4v-2h-4v2zm5 0h1.5a.5.5 0 0 0 .5-.5V13h-2v2z"/>
              </svg>
              Matrix View
            </button>
            <button
              type="button"
              onClick={() => setViewMode("cards")}
              className={[
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition cursor-pointer",
                viewMode === "cards"
                  ? "bg-white text-gray-800 font-semibold shadow-theme-xs dark:bg-gray-800 dark:text-white"
                  : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200",
              ].join(" ")}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                <path d="M2.5 1A1.5 1.5 0 0 0 1 2.5v11A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-11A1.5 1.5 0 0 0 13.5 1h-11zm0 1h11a.5.5 0 0 1 .5.5v2h-12v-2a.5.5 0 0 1 .5-.5zM1 6h14v7.5a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5V6z"/>
              </svg>
              Role Cards
            </button>
          </div>

          <Button
            size="md"
            onClick={() => setIsAddModalOpen(true)}
            startIcon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
            }
          >
            Add Permission
          </Button>
        </div>
      </div>

      {/* VIEW MODE 1: MATRIX TABLE */}
      {viewMode === "matrix" && (
        <div className="relative rounded-2xl border border-gray-200 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full min-w-max border-collapse text-left">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-white/[0.02]">
                  <th className="sticky left-0 z-20 min-w-[180px] sm:min-w-[220px] bg-gray-50/95 dark:bg-gray-900/95 backdrop-blur-sm px-4 sm:px-6 py-3.5 text-theme-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 border-r border-gray-100 dark:border-gray-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                    Permission
                  </th>
                  {visibleRoles.map((role) => (
                    <th
                      key={role.id}
                      className="px-4 py-3.5 text-center text-theme-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 min-w-[120px] sm:min-w-[140px]"
                    >
                      <span className="block truncate max-w-[120px] mx-auto font-bold" title={role.name}>
                        {role.name}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {Object.keys(grouped).length === 0 ? (
                  <tr>
                    <td
                      colSpan={visibleRoles.length + 1}
                      className="py-12 text-center text-sm text-gray-400"
                    >
                      No permissions match your search.
                    </td>
                  </tr>
                ) : (
                  Object.entries(grouped).map(([group, perms]) => (
                    <React.Fragment key={group}>
                      {/* Group separator banner */}
                      <tr className="bg-gray-50/60 dark:bg-white/[0.01]">
                        <td
                          colSpan={visibleRoles.length + 1}
                          className="sticky left-0 px-4 sm:px-6 py-2 text-theme-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 bg-brand-50/40 dark:bg-brand-950/20 border-y border-brand-100/40 dark:border-brand-900/20"
                        >
                          {group}
                        </td>
                      </tr>
                      {perms.map((perm) => (
                        <tr
                          key={perm.id}
                          className="transition-colors hover:bg-gray-50/60 dark:hover:bg-white/[0.02]"
                        >
                          {/* Sticky permission name */}
                          <td className="sticky left-0 z-10 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm px-4 sm:px-6 py-3 border-r border-gray-100 dark:border-gray-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-mono text-[11px] font-semibold border border-gray-200/50 dark:border-gray-700/50">
                              {perm.name}
                            </span>
                          </td>
                          {/* Toggle switches per role */}
                          {visibleRoles.map((role) => {
                            const active = hasPermission(role, perm.id);
                            const key = `${role.id}-${perm.id}`;
                            const isPending = toggling.has(key);
                            return (
                              <td key={role.id} className="px-4 py-3 text-center">
                                <button
                                  type="button"
                                  disabled={isPending}
                                  onClick={() => handleToggle(role, perm)}
                                  className={[
                                    "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-all duration-200 ease-out focus:outline-hidden hover:scale-105 active:scale-95",
                                    active ? "bg-brand-500 shadow-xs shadow-brand-500/30" : "bg-gray-200 dark:bg-gray-700",
                                    isPending ? "opacity-40 cursor-wait animate-pulse" : "",
                                  ].join(" ")}
                                  aria-checked={active}
                                  role="switch"
                                  title={`${active ? "Revoke" : "Grant"} "${perm.name}" for ${role.name}`}
                                >
                                  <span
                                    className={[
                                      "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
                                      active ? "translate-x-4" : "translate-x-0",
                                    ].join(" ")}
                                  />
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: ROLE CARDS (Optimized for Mobile/Touch) */}
      {viewMode === "cards" && (
        <div className="flex flex-col gap-4">
          {/* Role selector horizontal pills / scroll */}
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {visibleRoles.map((role) => {
              const isSelected = selectedRole?.id === role.id;
              const grantedCount = (role.permissions || []).length;
              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => setActiveRoleCardId(role.id)}
                  className={[
                    "flex shrink-0 items-center gap-2 rounded-lg px-3.5 py-2 text-theme-xs font-medium transition-all shadow-theme-xs cursor-pointer active:scale-[0.98]",
                    isSelected
                      ? "bg-brand-500 text-white font-semibold shadow-brand-500/20"
                      : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-800 dark:hover:bg-white/5",
                  ].join(" ")}
                >
                  <span>{role.name}</span>
                  <span
                    className={[
                      "rounded-full px-1.5 py-0.2 text-[11px] font-bold",
                      isSelected ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-400",
                    ].join(" ")}
                  >
                    {grantedCount}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Role Permissions Card */}
          {selectedRole && (
            <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
                <div>
                  <h4 className="text-base font-bold text-gray-800 dark:text-white">
                    {selectedRole.name}
                  </h4>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {(selectedRole.permissions || []).length} of {permissions.length} permissions granted
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-6">
                {Object.entries(grouped).map(([group, perms]) => (
                  <div key={group} className="flex flex-col gap-2.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                      {group}
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {perms.map((perm) => {
                        const active = hasPermission(selectedRole, perm.id);
                        const key = `${selectedRole.id}-${perm.id}`;
                        const isPending = toggling.has(key);
                        return (
                          <div
                            key={perm.id}
                            onClick={() => !isPending && handleToggle(selectedRole, perm)}
                            className={[
                              "flex items-center justify-between p-3 rounded-xl border transition-all duration-200 cursor-pointer select-none hover:shadow-theme-xs active:scale-[0.99]",
                              active
                                ? "border-brand-300 bg-brand-50/50 dark:border-brand-800/80 dark:bg-brand-950/25"
                                : "border-gray-200 bg-white hover:border-gray-300 dark:border-gray-800 dark:bg-gray-900/40 dark:hover:border-gray-700",
                            ].join(" ")}
                          >
                            <span className="font-mono text-xs font-semibold text-gray-800 dark:text-gray-200 truncate mr-2">
                              {perm.name}
                            </span>
                            <button
                              type="button"
                              disabled={isPending}
                              className={[
                                "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-all duration-200 ease-out focus:outline-hidden pointer-events-none",
                                active ? "bg-brand-500 shadow-xs shadow-brand-500/30" : "bg-gray-200 dark:bg-gray-700",
                                isPending ? "opacity-50" : "",
                              ].join(" ")}
                              role="switch"
                              aria-checked={active}
                            >
                              <span
                                className={[
                                  "inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out",
                                  active ? "translate-x-4" : "translate-x-0",
                                ].join(" ")}
                              />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer Info & Legend */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-theme-xs text-gray-400 dark:text-gray-500 pt-1">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-brand-500">
              <svg className="text-white" width="8" height="8" viewBox="0 0 12 12" fill="none">
                <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            Granted
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700" />
            Revoked
          </span>
        </div>
        <span className="italic font-medium">
          System Administrator has full access by default. Changes save in real time.
        </span>
      </div>

      {/* Add Permission Modal (Responsive) */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} className="w-[95vw] max-w-[460px] p-5 sm:p-6 mx-auto">
        <h3 className="mb-4 text-lg font-bold text-gray-800 dark:text-white/90">
          Add New Permission
        </h3>
        {addFormError && (
          <div className="mb-4 rounded-lg bg-error-50 px-4 py-3 text-sm text-error-600 dark:bg-error-950/30 dark:text-error-400">
            {addFormError}
          </div>
        )}
        <form onSubmit={handleCreatePermission}>
          <div className="flex flex-col gap-4">
            <div>
              <Label>Permission Name <span className="text-error-500">*</span></Label>
              <Input
                type="text"
                value={newPermName}
                onChange={(e) => setNewPermName(e.target.value)}
                placeholder="e.g. export-reports or publish"
              />
              <p className="mt-1.5 text-xs text-gray-400">
                Lowercase identifier, e.g. <code>download-media</code>, <code>manage-finance</code>
              </p>
            </div>
            <div className="mt-2 flex justify-end gap-2.5">
              <Button variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)} type="button">
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={addingPerm}>
                {addingPerm ? "Creating..." : "Add Permission"}
              </Button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
