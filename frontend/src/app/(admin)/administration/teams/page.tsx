import React from "react";
import MasterDataHubClient from "../master-data/MasterDataHubClient";

export const metadata = {
  title: "Teams | Administration",
};

export default function TeamsPage() {
  return (
    <div className="p-4 md:p-6">
      <MasterDataHubClient initialTab="teams" />
    </div>
  );
}

