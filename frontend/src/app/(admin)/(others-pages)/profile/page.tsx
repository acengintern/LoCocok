import UserInfoCard from "@/components/user-profile/UserInfoCard";
import UserMetaCard from "@/components/user-profile/UserMetaCard";
import UserSecurityCard from "@/components/user-profile/UserSecurityCard";
import UserStatsCard from "@/components/user-profile/UserStatsCard";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "User Profile | Loco Track",
  description:
    "Agency employee profile, workload statistics, and security settings",
};

export default function Profile() {
  return (
    <div className="space-y-6">
      <UserMetaCard />
      <UserStatsCard />
      <UserInfoCard />
      <UserSecurityCard />
    </div>
  );
}
