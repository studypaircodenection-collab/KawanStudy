import { ProtectedLayoutContent } from "@/components/auth/protected-layout-content";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedLayoutContent>{children}</ProtectedLayoutContent>;
}
