"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface Claims {
  email?: string;
  sub?: string;
  aud?: string;
  iat?: number;
  exp?: number;
  role?: string;
  session_id?: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
    role?: string;
    [key: string]: string | number | boolean | null | undefined;
  };
  app_metadata?: {
    provider?: string;
    providers?: string[];
    [key: string]: string | number | boolean | string[] | null | undefined;
  };
  created_at?: string;
  updated_at?: string;
  [key: string]: string | number | boolean | object | null | undefined;
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
