# TailAdmin Sign In Page with Dynamic Branding Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Modernize the `/signin` authentication page to match the official TailAdmin demo styling, removing the "Back to dashboard" link, supporting a single "Sign in with Google" button, and dynamically displaying the agency branding from `useSettings()`.

**Architecture:** Update Next.js App Router client components `SignInForm.tsx`, `signin/page.tsx`, and `(auth)/layout.tsx` to consume `useSettings()` and `useAuth()`.

**Tech Stack:** Next.js 16 (App Router), React 19, Tailwind CSS, TypeScript, Axios apiClient.

## Global Constraints
- Strictly match TailAdmin design tokens (`rounded-xl`, `border-gray-200`, `dark:border-gray-800`, `bg-brand-500`, `shadow-theme-xs`).
- "Back to dashboard" link must be completely removed from `/signin`.
- Social auth must display only "Sign in with Google" (no Twitter/X button).
- Agency brand title and logo in the hero panel must be dynamic from `settings.agency_name || "LOCO TRACK"` and `/images/logo/loco.png`.

---

### Task 1: Update SignInForm.tsx and signin/page.tsx

**Files:**
- Modify: `free-nextjs-admin-dashboard/src/components/auth/SignInForm.tsx`
- Modify: `free-nextjs-admin-dashboard/src/app/(full-width-pages)/(auth)/signin/page.tsx`

**Interfaces:**
- Consumes: `useAuth()` from `@/hooks/useAuth`, `useSettings()` from `@/hooks/useSettings`

- [ ] **Step 1: Update `SignInForm.tsx`**
Remove "Back to dashboard" link, replace two-column social buttons with a single full-width "Sign in with Google" button, ensure proper TailAdmin form styles, and connect credentials submit handler.

```tsx
"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import Alert from "@/components/ui/alert/Alert";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import { useAuth } from "@/hooks/useAuth";
import { useSettings } from "@/hooks/useSettings";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string[] }>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { login } = useAuth();
  const { settings } = useSettings();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    setGeneralError(null);

    try {
      await login({ identifier, password });
      router.push("/dashboard");
    } catch (error: any) {
      if (error.response?.status === 422 && error.response.data?.errors) {
        setErrors(error.response.data.errors);
      } else if (error.response?.status === 401) {
        setGeneralError("Username / Email atau Password salah.");
      } else {
        setGeneralError(
          error.response?.data?.message || "Terjadi kesalahan saat masuk ke sistem."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full justify-center">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto px-6 py-10 sm:px-0">
        <div>
          {/* Heading */}
          <div className="mb-6 sm:mb-8 text-center sm:text-left">
            <h1 className="mb-2 font-bold text-gray-900 text-title-sm dark:text-white sm:text-title-md tracking-tight">
              Sign In
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Masuk ke workspace <span className="font-semibold text-gray-700 dark:text-gray-200">{settings.agency_name || "LOCO TRACK"}</span>
            </p>
          </div>

          {/* Single Full-Width Google Social button */}
          <div className="mb-6">
            <button
              type="button"
              className="inline-flex w-full items-center justify-center gap-3 py-3 text-sm font-medium text-gray-700 transition-colors bg-gray-100/80 rounded-xl px-7 hover:bg-gray-200/80 hover:text-gray-900 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10 border border-gray-200/60 dark:border-gray-800 shadow-theme-xs"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.7511 10.1944C18.7511 9.47495 18.6915 8.94995 18.5626 8.40552H10.1797V11.6527H15.1003C15.0011 12.4597 14.4654 13.675 13.2749 14.4916L13.2582 14.6003L15.9087 16.6126L16.0924 16.6305C17.7788 15.1041 18.7511 12.8583 18.7511 10.1944Z" fill="#4285F4"/>
                <path d="M10.1788 18.75C12.5895 18.75 14.6133 17.9722 16.0915 16.6305L13.274 14.4916C12.5201 15.0068 11.5081 15.3666 10.1788 15.3666C7.81773 15.3666 5.81379 13.8402 5.09944 11.7305L4.99473 11.7392L2.23868 13.8295L2.20264 13.9277C3.67087 16.786 6.68674 18.75 10.1788 18.75Z" fill="#34A853"/>
                <path d="M5.10014 11.7305C4.91165 11.186 4.80257 10.6027 4.80257 9.99992C4.80257 9.3971 4.91165 8.81379 5.09022 8.26935L5.08523 8.1534L2.29464 6.02954L2.20333 6.0721C1.5982 7.25823 1.25098 8.5902 1.25098 9.99992C1.25098 11.4096 1.5982 12.7415 2.20333 13.9277L5.10014 11.7305Z" fill="#FBBC05"/>
                <path d="M10.1789 4.63331C11.8554 4.63331 12.9864 5.34303 13.6312 5.93612L16.1511 3.525C14.6035 2.11528 12.5895 1.25 10.1789 1.25C6.68676 1.25 3.67088 3.21387 2.20264 6.07218L5.08953 8.26943C5.81381 6.15972 7.81776 4.63331 10.1789 4.63331Z" fill="#EB4335"/>
              </svg>
              Sign in with Google
            </button>
          </div>

          {/* Divider */}
          <div className="relative py-3 sm:py-4 mb-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="px-4 py-1 text-gray-400 bg-white dark:bg-gray-900 tracking-wider font-semibold">
                Or sign in with email
              </span>
            </div>
          </div>

          {/* Error alert */}
          {generalError && (
            <div className="mb-5">
              <Alert variant="error" title="Sign In Gagal" message={generalError} />
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="space-y-5">
              <div>
                <Label>
                  Username atau Email <span className="text-error-500">*</span>
                </Label>
                <Input
                  placeholder="admin@lococreative.com"
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  error={!!errors.identifier}
                  hint={errors.identifier?.[0]}
                />
              </div>
              <div>
                <Label>
                  Password <span className="text-error-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Masukkan password Anda"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    error={!!errors.password}
                    hint={errors.password?.[0]}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    {showPassword ? (
                      <EyeIcon className="fill-current w-5 h-5" />
                    ) : (
                      <EyeCloseIcon className="fill-current w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Checkbox checked={isChecked} onChange={setIsChecked} />
                  <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                    Ingat saya
                  </span>
                </div>
                <Link
                  href="/reset-password"
                  className="text-sm font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Lupa password?
                </Link>
              </div>
              <div>
                <Button
                  type="submit"
                  className="w-full py-3.5 text-sm font-semibold rounded-xl bg-brand-500 hover:bg-brand-600 text-white shadow-theme-xs transition-colors"
                  size="md"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Memproses..." : "Sign In"}
                </Button>
              </div>
            </div>
          </form>

          <div className="mt-6 text-center sm:text-start">
            <p className="text-sm font-normal text-gray-600 dark:text-gray-400">
              Belum memiliki akun?{" "}
              <Link
                href="/signup"
                className="font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400"
              >
                Daftar Akun
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Update `signin/page.tsx` metadata**
```tsx
import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | LOCO TRACK",
  description: "Sign in to access your creative agency dashboard and production workspace.",
};

export default function SignIn() {
  return <SignInForm />;
}
```

- [ ] **Step 3: Verify & Commit**
Run `npm run build` in `free-nextjs-admin-dashboard`.
Commit: `git commit -am "feat(auth): modernize SignInForm with TailAdmin design and single Google auth"`

---

### Task 2: Update AuthLayout (auth)/layout.tsx with Dynamic Agency Branding

**Files:**
- Modify: `free-nextjs-admin-dashboard/src/app/(full-width-pages)/(auth)/layout.tsx`

**Interfaces:**
- Consumes: `useSettings()` from `@/hooks/useSettings` (or client sub-component if needed)

- [ ] **Step 1: Create client Hero Branding component or update layout**
Create `src/components/auth/AuthHeroBanner.tsx`:
```tsx
"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import GridShape from "@/components/common/GridShape";
import { useSettings } from "@/hooks/useSettings";

export default function AuthHeroBanner() {
  const { settings } = useSettings();

  return (
    <div className="lg:w-1/2 w-full h-full bg-brand-950 dark:bg-white/5 lg:grid items-center hidden relative overflow-hidden">
      <div className="relative items-center justify-center flex z-1 px-8">
        <GridShape />
        <div className="flex flex-col items-center max-w-sm text-center">
          <Link href="/" className="flex flex-col items-center gap-3.5 mb-6 group">
            <div className="w-16 h-16 rounded-2xl bg-white/10 p-2 border border-white/20 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Image
                width={56}
                height={56}
                className="w-full h-full object-contain"
                src="/images/logo/loco.png"
                alt="Logo"
                priority
              />
            </div>
            <span className="font-extrabold text-3xl tracking-tight text-white leading-none">
              {settings.agency_name || "LOCO TRACK"}
            </span>
          </Link>
          <p className="text-base font-medium text-gray-300 dark:text-white/70 leading-relaxed">
            Platform manajemen kampanye kreatif, approval aset, & pelacakan performa tim agensi Anda.
          </p>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Update `(auth)/layout.tsx`**
Mount `AuthHeroBanner` on the right side of `AuthLayout`.

- [ ] **Step 3: Verify & Commit**
Run `npm run build` in `free-nextjs-admin-dashboard`.
Commit: `git commit -am "feat(auth): integrate dynamic agency brand hero banner in AuthLayout"`
