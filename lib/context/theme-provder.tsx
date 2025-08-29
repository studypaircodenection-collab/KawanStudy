"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { PersonalizationProvider } from "./personalization-provider";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      <PersonalizationProvider>{children}</PersonalizationProvider>
    </NextThemesProvider>
  );
}
