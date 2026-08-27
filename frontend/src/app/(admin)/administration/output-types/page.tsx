import React from "react";
import MasterDataHubClient from "../master-data/MasterDataHubClient";

export const metadata = {
  title: "Output Types | Administration",
};

export default function OutputTypesPage() {
  return (
    <div className="p-4 md:p-6">
      <MasterDataHubClient initialTab="output-types" />
    </div>
  );
}

