import React from "react";
import MasterDataHubClient from "./MasterDataHubClient";

export const metadata = {
  title: "Master Data Hub | Administration",
};

export default function MasterDataHubPage() {
  return (
    <div className="p-4 md:p-6">
      <MasterDataHubClient />
    </div>
  );
}
