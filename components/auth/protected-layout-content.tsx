"use client";

import { useAuth } from "@/lib/context/auth-provider";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export function ProtectedLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { claims, setClaims, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      // Check if we already have claims in sessionStorage
      if (claims && Object.keys(claims).length > 0) {
        setIsLoading(false);
        return;
      }

      try {
        const supabase = createClient();

        // Get current session (fast check)
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session) {
          window.location.href = "/auth/login";
          return;
        }

        // Fetch detailed profile data
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
          // Use basic user data if profile fetch fails
          setClaims({
            sub: session.user.id,
            email: session.user.email || "",
            role: session.user.user_metadata?.role || "user",
          });
        } else {
          // Set complete user data with profile
          setClaims({
            sub: session.user.id,
            email: session.user.email || "",
            full_name: profile.full_name || "",
            username: profile.username || "",
            avatar_url: profile.avatar_url || "",
            role: session.user.user_metadata?.role || "user",
            created_at: profile.created_at,
            updated_at: profile.updated_at,
          });
        }
      } catch (error) {
        console.error("Error loading user data:", error);
        window.location.href = "/auth/login";
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [claims, setClaims]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Redirecting to login...</div>
      </div>
    );
  }

  return <>{children}</>;
}
