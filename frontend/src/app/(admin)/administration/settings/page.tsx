import React from "react";
import SettingsClient from "./SettingsClient";

export const metadata = {
  title: "System Settings | Administration",
};

export default function SettingsPage() {
  return (
    <div className="p-4 md:p-6">
      <SettingsClient />
    </div>
  );
}
