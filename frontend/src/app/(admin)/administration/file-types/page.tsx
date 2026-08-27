import React from "react";
import MasterDataHubClient from "../master-data/MasterDataHubClient";

export const metadata = {
  title: "File Types | Administration",
};

export default function FileTypesPage() {
  return (
    <div className="p-4 md:p-6">
      <MasterDataHubClient initialTab="file-types" />
    </div>
  );
}

