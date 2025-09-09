"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface Claims {
  sub: string;
  email: string;
  full_name?: string | "N/A";
  username?: string | "N/A";
  phone?: string | "N/A";
  bio?: string | "N/A";
  location?: string | "N/A";
  avatar_url?: string | "N/A";
  header_image_url?: string | "N/A";
  linkedin_url?: string | "N/A";
  github_url?: string | "N/A";
  instagram_url?: string | "N/A";
  tiktok_url?: string | "N/A";
  website_url?: string | "N/A";
  academic?: {
    university?: string | "N/A";
    major?: string | "N/A";
    year_of_study?: string | "N/A";
  };
  role: string | "N/A";
  created_at?: string | "N/A";
  updated_at?: string | "N/A";
}

type AuthContextValue = {
  claims: Claims | null;
  isAuthenticated: boolean;
  setClaims: (c: Claims | null) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export default function AuthProvider({
  children,
  initialClaims = null,
}: {
  children: React.ReactNode;
  initialClaims?: Claims | null;
}) {
  const [claims, setClaims] = useState<Claims | null>(initialClaims);

  // Load claims from sessionStorage on mount
  useEffect(() => {
    // Skip sessionStorage loading if we already have initialClaims
    if (initialClaims !== null) return;

    const savedClaims = sessionStorage.getItem("user-claims");
    if (savedClaims) {
      try {
        const parsedClaims = JSON.parse(savedClaims);
        setClaims(parsedClaims);
      } catch (error) {
        console.error("Failed to parse saved claims:", error);
        sessionStorage.removeItem("user-claims");
      }
    }
  }, [initialClaims]);

  // Save claims to sessionStorage whenever they change
  const updateClaims = (newClaims: Claims | null) => {
    setClaims(newClaims);
    if (newClaims && Object.keys(newClaims).length > 0) {
      sessionStorage.setItem("user-claims", JSON.stringify(newClaims));
    } else {
      sessionStorage.removeItem("user-claims");
    }
  };

  const value: AuthContextValue = {
    claims: claims,
    isAuthenticated: !!claims && Object.keys(claims).length > 0,
    setClaims: updateClaims,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
