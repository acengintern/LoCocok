import React from "react";
import RolesPermissionsPage from "../roles/RolesPermissionsPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Permission Matrix | Administration",
  description: "Manage roles and fine-grained permissions matrix",
};

export default function PermissionsPage() {
  return <RolesPermissionsPage initialTab="permissions" />;
}

