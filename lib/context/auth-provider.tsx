"use client";

import React, { createContext, useContext, useState } from "react";

type Claims = { email?: string; [key: string]: any } | null;

type AuthContextValue = {
  claims: Claims;
  isAuthenticated: boolean;
  setClaims: (c: Claims) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export default function AuthProvider({
  children,
  initialClaims,
}: {
  children: React.ReactNode;
  initialClaims: Claims;
}) {
  const [claims, setClaims] = useState<Claims>(initialClaims ?? null);
  const value: AuthContextValue = {
    claims,
    isAuthenticated: !!claims,
    setClaims,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
