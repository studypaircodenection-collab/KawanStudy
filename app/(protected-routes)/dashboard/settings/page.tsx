"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  User,
  Bell,
  Shield,
  BookOpen,
  Settings as SettingsIcon,
} from "lucide-react";

import NotificationSetting from "@/components/settings/notification-setting";
import ProfileSetting from "@/components/settings/profile-setting";
import StudySetting from "@/components/settings/study-setting";
import PrivacySetting from "@/components/settings/privacy-setting";
import AccountSetting from "@/components/settings/account-setting";

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("profile");

  const settingsTabs = [
    { id: "profile", label: "Profile", icon: User },
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
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <SettingsIcon className="h-8 w-8" />
            Settings
          </h1>
          <p className="text-gray-600">
            Manage your account settings and preferences
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Settings</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <nav className="space-y-1">
                {settingsTabs.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                      activeTab === id
                        ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                        : "text-gray-700 hover:bg-gray-50"
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
