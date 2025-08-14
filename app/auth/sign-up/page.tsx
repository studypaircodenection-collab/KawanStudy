import { SignUpForm } from "@/components/auth/sign-up-form";
import Link from "next/link";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo";
import { Metadata } from "next";

export const metadata: Metadata = generateSEOMetadata({
  title: "Sign Up - App Template",
  description: "Create your account to get started with our powerful platform.",
  canonical: "/auth/sign-up",
  noIndex: true, // Don't index auth pages
});

export default function SignUp() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <SignUpForm />
      </div>
    </div>
  );
}
