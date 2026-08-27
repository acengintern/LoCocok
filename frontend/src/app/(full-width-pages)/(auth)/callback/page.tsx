"use client";

import React, { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/lib/api/client";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const hasExecutedRef = useRef(false);

  useEffect(() => {
    if (hasExecutedRef.current) return;
    hasExecutedRef.current = true;

    let isMounted = true;

    const handleCallback = async () => {
      const code = searchParams.get("code");
      const tokenParam = searchParams.get("token");
      const error = searchParams.get("error");

      if (error) {
        router.replace(`/signin?error=${encodeURIComponent(error)}`);
        return;
      }

      if (!code && !tokenParam) {
        router.replace("/signin?error=oauth_failed");
        return;
      }

      try {
        let token = tokenParam;

        // If secure one-time exchange code is provided, exchange it via API
        if (code) {
          const exchangeRes = await apiClient.post("/auth/google/exchange", { code });
          token = exchangeRes.data?.token;
        }

        if (!token) {
          throw new Error("No token received");
        }

        if (typeof window !== "undefined") {
          localStorage.setItem("auth_token", token);
          sessionStorage.setItem("oauth_just_logged_in", "true");
        }

        await refreshUser();

        if (typeof window !== "undefined") {
          window.location.href = "/dashboard";
        }
      } catch (err: any) {
        console.error("Failed to complete OAuth callback:", err);
        if (isMounted) {
          const serverMsg = err.response?.data?.message;
          setErrorMessage(
            serverMsg || "Gagal menyelesaikan login Google. Mengalihkan ke halaman login..."
          );
          setTimeout(() => {
            if (typeof window !== "undefined") {
              window.location.href = "/signin?error=oauth_failed";
            }
          }, 1500);
        }
      }
    };

    handleCallback();

    return () => {
      isMounted = false;
    };
  }, [router, searchParams, refreshUser]);

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full justify-center items-center px-4 py-8">
      <div className="flex flex-col items-center max-w-sm text-center">
        <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-solid border-brand-500 border-t-transparent"></div>
        <h2 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">
          Memproses Autentikasi Google
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {errorMessage ||
            "Mohon tunggu sebentar, kami sedang memverifikasi akun Anda..."}
        </p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col flex-1 lg:w-1/2 w-full justify-center items-center px-4 py-8">
          <div className="flex flex-col items-center max-w-sm text-center">
            <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-solid border-brand-500 border-t-transparent"></div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Memuat...</p>
          </div>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
