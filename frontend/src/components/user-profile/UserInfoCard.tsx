"use client";
import React, { useState, useEffect } from "react";
import { useModal } from "../../hooks/useModal";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/context/ToastContext";
import { apiClient } from "@/lib/api/client";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";

export default function UserInfoCard() {
  const { isOpen, openModal, closeModal } = useModal();
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    division: "",
    bio: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
        division: user.division || "",
        bio: user.bio || "",
      });
    }
  }, [user, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMsg("Full name is required.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      await apiClient.put("/users/me/profile", {
        name: formData.name.trim(),
        phone: formData.phone.trim() || null,
        bio: formData.bio.trim() || null,
      });

      await refreshUser();
      showToast({
        variant: "success",
        title: "Profile Updated",
        message: "Your personal details have been saved successfully.",
      });
      closeModal();
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        "Failed to update profile. Please try again.";
      setErrorMsg(message);
      showToast({
        variant: "error",
        title: "Update Failed",
        message,
      });
    } finally {
      setLoading(false);
    }
  };

  const isGoogleLinked = Boolean(user?.google_id || user?.email_verified_at);

  return (
    <div
      id="personal-info-card"
      className="p-5 border border-gray-200 rounded-2xl bg-white dark:border-gray-800 dark:bg-white/[0.03] lg:p-6"
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="w-full">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Personal Information
              </h4>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                Agency employee profile & contact details
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Full Name */}
            <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-white/[0.02]">
              <p className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                Full Name
              </p>
              <p className="text-sm font-semibold text-gray-800 dark:text-white/90">
                {user?.name || "—"}
              </p>
            </div>

            {/* Username */}
            <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-white/[0.02]">
              <p className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                Username
              </p>
              <p className="text-sm font-semibold text-gray-800 dark:text-white/90">
                {user?.username ? `@${user.username}` : "—"}
              </p>
            </div>

            {/* Email */}
            <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-white/[0.02]">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Email Address
                </p>
                {isGoogleLinked && (
                  <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                    Google Linked
                  </span>
                )}
              </div>
              <p className="text-sm font-semibold text-gray-800 dark:text-white/90 truncate">
                {user?.email || "—"}
              </p>
            </div>

            {/* Phone / WhatsApp */}
            <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-white/[0.02]">
              <p className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                Phone / WhatsApp
              </p>
              <p className="text-sm font-semibold text-gray-800 dark:text-white/90">
                {user?.phone || "—"}
              </p>
            </div>

            {/* Division */}
            <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-white/[0.02]">
              <p className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                Division / Department
              </p>
              <p className="text-sm font-semibold text-gray-800 dark:text-white/90">
                {user?.division || "General Operations"}
              </p>
            </div>

            {/* Account Status */}
            <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-white/[0.02]">
              <p className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                Account Status
              </p>
              <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                {user?.status?.toUpperCase() || "ACTIVE"}
              </p>
            </div>

            {/* Bio - Spans full width */}
            <div className="col-span-1 sm:col-span-2 lg:col-span-3 rounded-xl border border-gray-100 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-white/[0.02]">
              <p className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                Bio / About
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {user?.bio || "No biography provided."}
              </p>
            </div>
          </div>
        </div>

        {/* Edit Button */}
        <div className="shrink-0">
          <button
            onClick={openModal}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto transition-colors cursor-pointer"
          >
            <svg
              className="fill-current"
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
                fill=""
              />
            </svg>
            Edit
          </button>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[650px] m-4">
        <div className="relative w-full max-w-[650px] rounded-3xl bg-white p-6 dark:bg-gray-900 lg:p-8">
          <div className="mb-6">
            <h4 className="text-xl font-bold text-gray-800 dark:text-white/90">
              Edit Personal Information
            </h4>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Update your agency profile and contact information.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Your full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone / WhatsApp</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="text"
                  placeholder="+62 812-xxxx-xxxx"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div>
                <Label htmlFor="division">Division / Department</Label>
                <div className="relative">
                  <Input
                    id="division"
                    name="division"
                    type="text"
                    value={user?.division || "General Operations"}
                    disabled
                    className="cursor-not-allowed bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                  />
                  <span className="mt-1 block text-[11px] text-gray-400 dark:text-gray-500">
                    Dikelola & diatur oleh Administrator
                  </span>
                </div>
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="bio">Bio / About</Label>
                <textarea
                  id="bio"
                  name="bio"
                  rows={3}
                  placeholder="Brief description about your role or specialization..."
                  value={formData.bio}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
              <Button
                size="md"
                variant="outline"
                className="px-5 py-2.5 text-sm"
                onClick={closeModal}
                disabled={loading}
                startIcon={
                  <svg
                    className="h-4 w-4 fill-none stroke-current stroke-2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                }
              >
                Cancel
              </Button>
              <Button
                size="md"
                type="submit"
                className="px-6 py-2.5 text-sm"
                disabled={loading}
                startIcon={
                  <svg
                    className="h-4 w-4 fill-none stroke-current stroke-2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                }
              >
                {loading ? "Menyimpan..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
