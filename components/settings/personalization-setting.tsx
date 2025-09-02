"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Palette,
  Monitor,
  Sun,
  Moon,
  Eye,
  Layout,
  Zap,
  Check,
} from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

const PersonalizationSetting = () => {
  const { settings, updateSettings, resetToDefaults, mounted } = useTheme();
  const [hasChanges, setHasChanges] = useState(false);

  // Predefined theme colors
  const themeColors = [
    { name: "Blue", value: "blue", color: "bg-blue-500" },
    { name: "Green", value: "green", color: "bg-green-500" },
    { name: "Purple", value: "purple", color: "bg-purple-500" },
    { name: "Pink", value: "pink", color: "bg-pink-500" },
    { name: "Orange", value: "orange", color: "bg-orange-500" },
    { name: "Red", value: "red", color: "bg-red-500" },
    { name: "Indigo", value: "indigo", color: "bg-indigo-500" },
    { name: "Teal", value: "teal", color: "bg-teal-500" },
  ];

  // Update setting and mark as changed
  const updateSetting = (key: string, value: any) => {
    updateSettings({ [key]: value });
    setHasChanges(true);
  };

  // Save settings
  const handleSaveSettings = () => {
    setHasChanges(false);
    // Settings are automatically saved via the hook
  };

  // Reset to defaults
  const handleResetToDefaults = () => {
    resetToDefaults();
    setHasChanges(true);
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Theme Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Theme Mode */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Theme Mode</Label>
            <div className="grid md:grid-cols-3 gap-3">
              <button
                onClick={() => updateSetting("theme", "light")}
                className={`p-4 border rounded-lg transition-colors ${
                  settings.theme === "light"
                    ? "border-primary bg-primary/10"
                    : "border"
                }`}
              >
                <Sun className="h-6 w-6 mx-auto mb-2" />
                <span className="text-sm font-medium">Light</span>
              </button>
              <button
                onClick={() => updateSetting("theme", "dark")}
                className={`p-4 border rounded-lg transition-colors ${
                  settings.theme === "dark"
                    ? "border-primary bg-primary/10"
                    : "border"
                }`}
              >
                <Moon className="h-6 w-6 mx-auto mb-2" />
                <span className="text-sm font-medium">Dark</span>
              </button>
              <button
                onClick={() => updateSetting("theme", "system")}
                className={`p-4 border rounded-lg transition-colors ${
                  settings.theme === "system"
                    ? "border-primary bg-primary/10"
                    : "border"
                }`}
              >
                <Monitor className="h-6 w-6 mx-auto mb-2" />
                <span className="text-sm font-medium">System</span>
              </button>
            </div>
          </div>

          <Separator />

          {/* Accent Color */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Accent Color</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {themeColors.map((color) => (
                <button
                  key={color.value}
                  onClick={() => updateSetting("accentColor", color.value)}
                  className={`p-3 border rounded-lg flex flex-col items-center gap-2 transition-colors ${
                    settings.accentColor === color.value
                      ? "border-primary bg-primary/10"
                      : "border"
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full ${color.color}`} />
                  <span className="text-xs font-medium">{color.name}</span>
                  <div className="rounded-full w-8 h-8 grid place-items-center bg-secondary border p-2">
                    {settings.accentColor === color.value && (
                      <Check className="size-4 text-primary" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Display Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Display Options
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Font Size */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base font-medium">Font Size</Label>
              <p className="text-sm text-muted-foreground">
                Adjust the base font size throughout the app
              </p>
            </div>
            <Select
              value={settings.fontSize}
              onValueChange={(value: "small" | "medium" | "large") =>
                updateSetting("fontSize", value)
              }
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="large">Large</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Animations */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base font-medium flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Animations
              </Label>
              <p className="text-sm text-muted-foreground">
                Enable smooth transitions and animations
              </p>
            </div>
            <Switch
              checked={settings.animations}
              onCheckedChange={(checked) =>
                updateSetting("animations", checked)
              }
            />
          </div>

          {/* High Contrast */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base font-medium">High Contrast</Label>
              <p className="text-sm text-muted-foreground">
                Increase contrast for better accessibility
              </p>
            </div>
            <Switch
              checked={settings.highContrast}
              onCheckedChange={(checked) =>
                updateSetting("highContrast", checked)
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Navigation Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layout className="h-5 w-5" />
            Navigation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base font-medium">Collapsed Sidebar</Label>
              <p className="text-sm text-muted-foreground">
                Keep the sidebar collapsed by default
              </p>
            </div>
            <Switch
              checked={settings.sidebarCollapsed}
              onCheckedChange={(checked) =>
                updateSetting("sidebarCollapsed", checked)
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-6 border-t">
        <Button
          variant="outline"
          onClick={handleResetToDefaults}
          className="flex items-center gap-2"
        >
          Reset to Defaults
        </Button>

        <div className="flex items-center gap-3">
          {hasChanges && (
            <Badge variant="secondary" className="text-orange-600">
              Unsaved changes
            </Badge>
          )}
          <Button
            onClick={handleSaveSettings}
            disabled={!hasChanges}
            className="flex items-center gap-2"
          >
            <Check className="h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PersonalizationSetting;
