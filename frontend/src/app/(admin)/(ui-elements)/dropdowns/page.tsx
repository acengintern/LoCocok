import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";
import DropdownExamples from "./DropdownExamples";

export const metadata: Metadata = {
  title: "Dropdowns | LOCO TRACK",
  description: "Dropdown menu UI components - LOCO TRACK",
};

export default function DropdownsPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Dropdowns" />
      <DropdownExamples />
    </div>
  );
}
