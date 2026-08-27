import React from "react";
import RolesPermissionsPage from "./RolesPermissionsPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Roles & Permissions | Administration",
  description: "Manage roles and permissions",
};

export default function Page() {
  return <RolesPermissionsPage />;
}
