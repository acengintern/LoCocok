import React from "react";
import ClientDetailClient from "./ClientDetailClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Client Detail | LOCO TRACK",
  description: "Client account details and contact directory",
};

export default function Page({ params }: { params: { id: string } }) {
  return (
    <div className="flex flex-col gap-6">
      <ClientDetailClient clientId={params.id} />
    </div>
  );
}
