"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  User,
  Bell,
  Shield,
  BookOpen,
  Settings as SettingsIcon,
  Palette,
} from "lucide-react";
import { Text } from "@/components/ui/typography";
import NotificationSetting from "@/components/settings/notification-setting";
import ProfileSetting from "@/components/settings/profile-setting";
import StudySetting from "@/components/settings/study-setting";
import PrivacySetting from "@/components/settings/privacy-setting";
import AccountSetting from "@/components/settings/account-setting";
import PersonalizationSetting from "@/components/settings/personalization-setting";

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("profile");

  const settingsTabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "personalization", label: "Personalization", icon: Palette },
    { id: "study", label: "Study", icon: BookOpen },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "privacy", label: "Privacy", icon: Shield },
    { id: "account", label: "Account", icon: SettingsIcon },
  ];

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <Text as="h2" className="flex items-center gap-3">
            <SettingsIcon className="h-8 w-8" />
            Settings
          </Text>
          <Text as="p" styleVariant="muted">
            Manage your account settings and preferences
          </Text>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <Card className="p-0 overflow-hidden">
            <CardContent className="p-0">
              <nav className="space-y-1">
                {settingsTabs.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                      activeTab === id
                        ? "border-r-2 bg-primary/10  text-primary border-primary"
                        : "text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Profile Settings */}
          {activeTab === "profile" && <ProfileSetting />}

          {/* Personalization Settings */}
          {activeTab === "personalization" && <PersonalizationSetting />}

          {/* Study Settings */}
          {activeTab === "study" && <StudySetting />}

          {/* Notifications Settings */}
          {activeTab === "notifications" && <NotificationSetting />}

          {/* Privacy Settings */}
          {activeTab === "privacy" && <PrivacySetting />}

          {/* Account Settings */}
          {activeTab === "account" && <AccountSetting />}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
