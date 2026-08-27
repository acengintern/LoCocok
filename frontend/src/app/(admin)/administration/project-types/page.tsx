import React from "react";
import MasterDataHubClient from "../master-data/MasterDataHubClient";

export const metadata = {
  title: "Project Types | Administration",
};

export default function ProjectTypesPage() {
  return (
    <div className="p-4 md:p-6">
      <MasterDataHubClient initialTab="project-types" />
    </div>
  );
}

