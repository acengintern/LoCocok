import React from "react";
import type { Metadata } from "next";
import NotificationsClient from "./NotificationsClient";

export const metadata: Metadata = {
  title: "Notifications | LOCO TRACK",
  description: "Manage your system notifications and campaign alerts",
};

export default function NotificationsPage() {
  return <NotificationsClient />;
}
