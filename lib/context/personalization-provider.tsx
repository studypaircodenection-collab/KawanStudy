"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useTheme as useNextTheme } from "next-themes";

interface ThemeSettings {
  theme: "light" | "dark" | "system";
  accentColor: string;
  fontSize: "small" | "medium" | "large";
  compactMode: boolean;
  animations: boolean;
  highContrast: boolean;
  sidebarCollapsed: boolean;
  showAvatars: boolean;
}

interface PersonalizationContextType {
  settings: ThemeSettings;
  updateSettings: (newSettings: Partial<ThemeSettings>) => void;
  resetToDefaults: () => void;
  mounted: boolean;
}

const defaultSettings: ThemeSettings = {
  theme: "system",
  accentColor: "blue",
  fontSize: "medium",
  compactMode: false,
  animations: true,
  highContrast: false,
  sidebarCollapsed: false,
  showAvatars: true,
};

const PersonalizationContext = createContext<PersonalizationContextType>({
  settings: defaultSettings,
  updateSettings: () => {},
  resetToDefaults: () => {},
  mounted: false,
});

export function PersonalizationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, setSettings] = useState<ThemeSettings>(defaultSettings);
  const [mounted, setMounted] = useState(false);
  const { setTheme, resolvedTheme } = useNextTheme();

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem("personalization-settings");
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        const mergedSettings = { ...defaultSettings, ...parsed };
        setSettings(mergedSettings);

        console.log("Loaded settings:", mergedSettings);

        // Sync with next-themes after a brief delay to ensure it's mounted
        setTimeout(() => {
          setTheme(mergedSettings.theme);
        }, 100);
      } catch (error) {
        console.error("Failed to parse personalization settings:", error);
      }
    } else {
      // No saved settings, set default theme
      setTimeout(() => {
        setTheme(defaultSettings.theme);
      }, 100);
    }
    setMounted(true);
  }, [setTheme]);

  // Apply non-theme settings to DOM
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;

    console.log("Applying settings to DOM:", settings);
    console.log("Current resolved theme:", resolvedTheme);

    // Remove existing classes
    root.classList.remove("compact-mode", "high-contrast", "no-animations");

    // Apply accent color attribute
    root.setAttribute("data-accent", settings.accentColor);

    // Apply font size
    const fontSizeMap = {
      small: "14px",
      medium: "16px",
      large: "18px",
    };
    root.style.setProperty("--base-font-size", fontSizeMap[settings.fontSize]);

    // Apply other settings
    if (settings.compactMode) {
      root.classList.add("compact-mode");
    }

    if (settings.highContrast) {
      root.classList.add("high-contrast");
    }

    if (!settings.animations) {
      root.classList.add("no-animations");
    }

    console.log("DOM updated with accent color:", settings.accentColor);
    console.log("Root element classes:", root.className);
    console.log("Root data-accent:", root.getAttribute("data-accent"));
  }, [settings, mounted, resolvedTheme]); // Sync theme changes with next-themes
  useEffect(() => {
    if (mounted && settings.theme) {
      setTheme(settings.theme);
    }
  }, [settings.theme, mounted, setTheme]);

  const updateSettings = (newSettings: Partial<ThemeSettings>) => {
    const updated = { ...settings, ...newSettings };
    console.log("Updating settings:", newSettings, "New state:", updated);

    setSettings(updated);
    localStorage.setItem("personalization-settings", JSON.stringify(updated));

    // If theme changed, sync with next-themes
    if (newSettings.theme) {
      console.log("Setting theme to:", newSettings.theme);
      setTheme(newSettings.theme);
    }
  };

  const resetToDefaults = () => {
    setSettings(defaultSettings);
    localStorage.setItem(
      "personalization-settings",
      JSON.stringify(defaultSettings)
    );
    setTheme(defaultSettings.theme);
  };

  return (
    <PersonalizationContext.Provider
      value={{
        settings,
        updateSettings,
        resetToDefaults,
        mounted,
      }}
    >
      {children}
    </PersonalizationContext.Provider>
  );
}

export function usePersonalization() {
  const context = useContext(PersonalizationContext);
  if (!context) {
    throw new Error(
      "usePersonalization must be used within PersonalizationProvider"
    );
  }
  return context;
}

export type { ThemeSettings };
