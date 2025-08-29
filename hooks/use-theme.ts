import { usePersonalization } from "@/lib/context/personalization-provider";
import { useTheme as useNextTheme } from "next-themes";

export function useTheme() {
  const personalization = usePersonalization();
  const nextTheme = useNextTheme();

  return {
    ...personalization,
    // Also expose next-themes functionality
    resolvedTheme: nextTheme.resolvedTheme,
    systemTheme: nextTheme.systemTheme,
    themes: nextTheme.themes,
  };
}

export type { ThemeSettings } from "@/lib/context/personalization-provider";
