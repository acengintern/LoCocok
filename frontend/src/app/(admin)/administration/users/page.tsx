import React from "react";
import UsersClient from "./UsersClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "User Accounts | LOCO TRACK",
  description: "User account management and role assignments",
};

export default function Page() {
  return <UsersClient />;
}
