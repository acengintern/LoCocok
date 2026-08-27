import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Sign In | LOCO TRACK - Creative Agency Management",
  description: "Sign in to LOCO TRACK creative agency campaign management and performance tracking platform",
};

export default function SignIn() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col flex-1 lg:w-1/2 w-full justify-center items-center p-8">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
        </div>
      }
    >
      <SignInForm />
    </Suspense>
  );
}

