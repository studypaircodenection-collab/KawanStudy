"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { useEquippedItems } from '@/hooks/use-equipped-items';

interface ThemeCustomization {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  themeName?: string;
}

interface ThemeCustomizationContextType {
  customization: ThemeCustomization;
  loading: boolean;
}

const ThemeCustomizationContext = createContext<ThemeCustomizationContextType>({
  customization: {},
  loading: true
});

export function ThemeCustomizationProvider({ 
  children, 
  userId 
}: { 
  children: React.ReactNode;
  userId?: string;
}) {
  const { getEquippedItemByType, loading } = useEquippedItems(userId);
  const [customization, setCustomization] = useState<ThemeCustomization>({});

  useEffect(() => {
    if (!loading && userId) {
      const theme = getEquippedItemByType('profile_theme');
      if (theme) {
        const themeData = {
          themeName: theme.item_data.value
        };
        
        setCustomization(themeData);
        
        // Apply theme-specific CSS custom properties
        const root = document.documentElement;
        
        switch (theme.item_data.value) {
          case 'dark':
            root.style.setProperty('--theme-primary', '#374151');
            root.style.setProperty('--theme-secondary', '#1f2937');
            break;
          case 'ocean':
            root.style.setProperty('--theme-primary', '#3b82f6');
            root.style.setProperty('--theme-secondary', '#1e40af');
            break;
          case 'forest':
            root.style.setProperty('--theme-primary', '#10b981');
            root.style.setProperty('--theme-secondary', '#059669');
            break;
          case 'sunset':
            root.style.setProperty('--theme-primary', '#f59e0b');
            root.style.setProperty('--theme-secondary', '#d97706');
            break;
          case 'galaxy':
            root.style.setProperty('--theme-primary', '#8b5cf6');
            root.style.setProperty('--theme-secondary', '#7c3aed');
            break;
        }
      } else {
        // Reset to default theme
        const root = document.documentElement;
        root.style.removeProperty('--theme-primary');
        root.style.removeProperty('--theme-secondary');
      }
    }
  }, [loading, userId, getEquippedItemByType]);

  return (
    <ThemeCustomizationContext.Provider value={{ customization, loading }}>
      {children}
    </ThemeCustomizationContext.Provider>
  );
}

export function useThemeCustomization() {
  return useContext(ThemeCustomizationContext);
}
