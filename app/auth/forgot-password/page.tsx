import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import Link from "next/link";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo";
import { Metadata } from "next";

export const metadata: Metadata = generateSEOMetadata({
  title: "Reset Password - App Template",
  description: "Reset your password to regain access to your account.",
  canonical: "/auth/forgot-password",
  noIndex: true, // Don't index auth pages
});

export default function ForgotPassword() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
