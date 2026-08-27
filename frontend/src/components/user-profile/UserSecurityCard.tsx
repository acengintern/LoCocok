"use client";
import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/context/ToastContext";
import { apiClient } from "@/lib/api/client";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";

export default function UserSecurityCard() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const isGoogleLinked = Boolean(user?.google_id || user?.email_verified_at);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (newPassword.length < 8) {
      setErrorMessage("New password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("New password and confirmation do not match.");
      return;
    }

    setLoading(true);

    try {
      await apiClient.put("/users/me/password", {
        current_password: currentPassword || undefined,
        password: newPassword,
        password_confirmation: confirmPassword,
      });

      setSuccessMessage("Your password has been changed successfully.");
      showToast({
        variant: "success",
        title: "Password Updated",
        message: "Your account password has been changed successfully.",
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.current_password?.[0] ||
        err?.response?.data?.errors?.password?.[0] ||
        "Failed to change password. Please check your current password.";
      setErrorMessage(msg);
      showToast({
        variant: "error",
        title: "Password Change Failed",
        message: msg,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-5 border border-gray-200 rounded-2xl bg-white dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Security & Authentication
        </h4>
        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
          Manage your connected accounts and password credentials
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left Column: Google OAuth Status */}
        <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-5 dark:border-gray-800 dark:bg-white/[0.02] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3">
              {/* Google Logo SVG */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white shadow-xs dark:border-gray-700 dark:bg-gray-800">
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              </div>

              <div>
                <h5 className="text-sm font-semibold text-gray-800 dark:text-white/90">
                  Google Account Connection
                </h5>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Single Sign-On (SSO) authentication
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                <span className="text-xs text-gray-500 dark:text-gray-400">Connection Status</span>
                {isGoogleLinked ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Connected & Verified
                  </span>
                ) : (
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Not Linked
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                <span className="text-xs text-gray-500 dark:text-gray-400">Linked Account</span>
                <span className="text-xs font-medium text-gray-800 dark:text-white/90 truncate max-w-[200px]">
                  {user?.email || "—"}
                </span>
              </div>

              <div className="flex items-center justify-between py-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">Auth Method</span>
                <span className="text-xs font-medium text-gray-800 dark:text-white/90">
                  {isGoogleLinked ? "Google OAuth 2.0 + Password" : "Email & Password"}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-start gap-2.5 rounded-lg bg-brand-50/60 p-3.5 dark:bg-brand-500/5 border border-brand-100 dark:border-brand-500/10">
            <svg
              className="mt-0.5 h-4 w-4 shrink-0 text-brand-600 dark:text-brand-400 fill-current"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-xs text-brand-700 dark:text-brand-300 leading-relaxed">
              Anda dapat masuk secara aman menggunakan akun Google Workspace agensi Anda dengan autentikasi 1-klik instan.
            </p>
          </div>
        </div>

        {/* Right Column: Password Change Form */}
        <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-5 dark:border-gray-800 dark:bg-white/[0.02]">
          <h5 className="text-sm font-semibold text-gray-800 dark:text-white/90 mb-1">
            {isGoogleLinked ? "Atur Password Masuk Akun" : "Ubah Password Akun"}
          </h5>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            {isGoogleLinked
              ? "Akun Anda terhubung dengan Google SSO. Anda dapat langsung membuat atau memperbarui password baru di bawah ini untuk opsi login manual."
              : "Pastikan akun Anda menggunakan kombinasi password yang kuat dan aman."}
          </p>

          {errorMessage && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-600 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-600 dark:border-emerald-900/50 dark:bg-emerald-900/20 dark:text-emerald-400">
              {successMessage}
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            {!isGoogleLinked && (
              <div>
                <Label htmlFor="current_password">Password Saat Ini *</Label>
                <Input
                  id="current_password"
                  type="password"
                  placeholder="Masukkan password lama Anda"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
            )}

            <div>
              <Label htmlFor="new_password">Password Baru *</Label>
              <Input
                id="new_password"
                type="password"
                placeholder="Minimal 8 karakter"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="confirm_password">Konfirmasi Password Baru *</Label>
              <Input
                id="confirm_password"
                type="password"
                placeholder="Ulangi password baru Anda"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                type="submit"
                size="md"
                className="w-full sm:w-auto px-6 py-2.5 text-sm"
                disabled={loading || !newPassword || !confirmPassword}
                startIcon={
                  <svg
                    className="h-4 w-4 fill-current"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                }
              >
                {loading ? "Menyimpan..." : "Update Password"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
