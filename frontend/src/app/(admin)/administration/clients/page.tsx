import React from "react";
import ClientsClient from "./ClientsClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Clients | LOCO TRACK",
  description: "Client brand profiles and key contact directory",
};

export default function Page() {
  return <ClientsClient />;
}
