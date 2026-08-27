import SignUpForm from "@/components/auth/SignUpForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up | LOCO TRACK - Creative Agency Management",
  description: "Create your LOCO TRACK agency workspace account",
};

export default function SignUp() {
  return <SignUpForm />;
}
