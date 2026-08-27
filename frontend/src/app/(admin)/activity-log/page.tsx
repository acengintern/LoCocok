import React from "react";
import ActivityLogClient from "./ActivityLogClient";

export const metadata = {
  title: "Activity Audit Log | Administration",
};

export default function ActivityLogPage() {
  return (
    <div className="p-4 md:p-6">
      <ActivityLogClient />
    </div>
  );
}
