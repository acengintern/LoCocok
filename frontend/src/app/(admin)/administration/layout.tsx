"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter, usePathname } from "next/navigation";

export default function AdministrationLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/signin");
        return;
      }
      
      const isClientRoute = pathname.startsWith("/administration/clients");
      const isSystemAdmin = user.roles?.some((role: any) => {
        if (typeof role === "string") return role === "System Administrator";
        return role?.name === "System Administrator";
      });

      // Clients route is accessible by authenticated operations staff (AE, SMS, PM, etc.),
      // other administrative sections require System Administrator role.
      if (!isSystemAdmin && !isClientRoute) {
        router.push("/dashboard");
      } else {
        setIsAuthorized(true);
      }
    }
  }, [user, loading, router, pathname]);

  if (loading || !isAuthorized) {
    return (
      <div className="flex justify-center items-center p-12 min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return <>{children}</>;
}
