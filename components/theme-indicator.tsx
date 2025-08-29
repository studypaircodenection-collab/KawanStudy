"use client";

import { useTheme } from "@/hooks/use-theme";
import { Sun, Moon, Monitor } from "lucide-react";

export function ThemeIndicator() {
  const { settings, mounted, resolvedTheme } = useTheme();

  if (!mounted) return null;

  const getThemeIcon = () => {
    if (settings.theme === "system") {
      return resolvedTheme === "dark" ? (
        <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      );
    }
    switch (settings.theme) {
      case "light":
        return <Sun className="h-4 w-4" />;
      case "dark":
        return <Moon className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const getThemeLabel = () => {
    if (settings.theme === "system") {
      return `System (${resolvedTheme})`;
    }
    return settings.theme.charAt(0).toUpperCase() + settings.theme.slice(1);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-background border rounded-lg p-3 shadow-lg">
      <div className="flex items-center gap-2 text-sm">
        {getThemeIcon()}
        <span>{getThemeLabel()} Theme</span>
        <div
          className={`w-3 h-3 rounded-full ${
            settings.accentColor === "blue"
              ? "bg-blue-500"
              : settings.accentColor === "green"
              ? "bg-green-500"
              : settings.accentColor === "purple"
              ? "bg-purple-500"
              : settings.accentColor === "pink"
              ? "bg-pink-500"
              : settings.accentColor === "orange"
              ? "bg-orange-500"
              : settings.accentColor === "red"
              ? "bg-red-500"
              : settings.accentColor === "indigo"
              ? "bg-indigo-500"
              : settings.accentColor === "teal"
              ? "bg-teal-500"
              : "bg-blue-500"
          }`}
        />
      </div>
    </div>
  );
}
