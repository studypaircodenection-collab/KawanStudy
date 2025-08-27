"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/auth-provider";

export default function page() {
  const { claims } = useAuth();

  const router = useRouter();

  if (!claims) {
    router.push("/auth/login");
  } else {
    router.push(`/dashboard/profile/${claims?.username}`);
  }

  return null;
}
