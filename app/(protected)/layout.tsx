import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AuthProvider from "@/lib/context/auth-provider";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  const claims = data.claims;

  return <AuthProvider initialClaims={claims}>{children}</AuthProvider>;
}
