import React from "react";
import MasterDataHubClient from "../master-data/MasterDataHubClient";

export const metadata = {
  title: "Task Types | Administration",
};

export default function TaskTypesPage() {
  return (
    <div className="p-4 md:p-6">
      <MasterDataHubClient initialTab="task-types" />
    </div>
  );
}

