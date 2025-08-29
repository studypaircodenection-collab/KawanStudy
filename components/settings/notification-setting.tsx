"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Bell, Calendar, Users, Trophy } from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications-db";
import { NOTIFICATION_TYPES } from "@/types/notification";
import { toast } from "sonner";

export default function NotificationSetting() {
  const { notifications, settings, updateSettings, error, isLoading } =
    useNotifications();

  const [localSettings, setLocalSettings] = useState(settings);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const updateLocalSetting = <K extends keyof typeof localSettings>(
    key: K,
    value: (typeof localSettings)[K]
  ) => {
    setLocalSettings((prev) => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  };

  const saveSettings = () => {
    updateSettings(localSettings);
    setHasUnsavedChanges(false);
    toast.success("Notification settings saved successfully!");
  };

  const resetSettings = () => {
    setLocalSettings(settings);
    setHasUnsavedChanges(false);
  };

  const notificationTypeStats = Object.entries(NOTIFICATION_TYPES).map(
    ([type, info]) => {
      const count = notifications.filter((n) => n.type === type).length;
      const unreadCount = notifications.filter(
        (n) => n.type === type && !n.isRead
      ).length;
      return { type, info, count, unreadCount };
    }
  );

  return (
    <div className="container mx-auto max-w-4xl ">
      {/* Loading State */}
      {isLoading && (
        <Card className="mb-6">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-sm text-gray-500">
              Loading notification settings...
            </p>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card className="mb-6 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-red-600">
              <Bell className="h-5 w-5" />
              <div>
                <h3 className="font-medium">
                  Failed to load notification settings
                </h3>
                <p className="text-sm text-red-500 mt-1">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notification Preferences */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>
            Choose which types of notifications you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Notification Types */}
          <div className="space-y-4">
            <h3 className="font-medium ">Notification Types</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div>
                    <Label htmlFor="study-reminders">Study Reminders</Label>
                    <p className="text-sm text-gray-500">
                      Upcoming study sessions and exams
                    </p>
                  </div>
                </div>
                <Switch
                  id="study-reminders"
                  checked={localSettings.enableStudyReminders}
                  onCheckedChange={(checked) =>
                    updateLocalSetting("enableStudyReminders", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4 text-gray-500" />
                  <div>
                    <Label htmlFor="group-invites">Group Invitations</Label>
                    <p className="text-sm text-gray-500">
                      Study group invites and updates
                    </p>
                  </div>
                </div>
                <Switch
                  id="group-invites"
                  checked={localSettings.enableGroupInvites}
                  onCheckedChange={(checked) =>
                    updateLocalSetting("enableGroupInvites", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div>
                    <Label htmlFor="exam-reminders">Exam Reminders</Label>
                    <p className="text-sm text-gray-500">
                      Important exam notifications
                    </p>
                  </div>
                </div>
                <Switch
                  id="exam-reminders"
                  checked={localSettings.enableExamReminders}
                  onCheckedChange={(checked) =>
                    updateLocalSetting("enableExamReminders", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Trophy className="h-4 w-4 text-gray-500" />
                  <div>
                    <Label htmlFor="achievements">Achievements</Label>
                    <p className="text-sm text-gray-500">
                      Study milestones and badges
                    </p>
                  </div>
                </div>
                <Switch
                  id="achievements"
                  checked={localSettings.enableAchievementNotifications}
                  onCheckedChange={(checked) =>
                    updateLocalSetting(
                      "enableAchievementNotifications",
                      checked
                    )
                  }
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge className="h-5 w-5" />
            Notification Statistics
          </CardTitle>
          <CardDescription>
            Overview of your notification activity by type
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notificationTypeStats.map(({ type, info, count, unreadCount }) => (
              <div
                key={type}
                className="flex items-center justify-between p-3 bg-background rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: info.color }}
                  />
                  <div>
                    <span className="font-medium">{info.label}</span>
                    <p className="text-sm text-gray-500">
                      {info.icon} {type.replace("_", " ")}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{count} total</div>
                  {unreadCount > 0 && (
                    <div className="text-sm text-red-600">
                      {unreadCount} unread
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Save Changes */}
      {hasUnsavedChanges && (
        <div className="sticky bottom-6 mt-6 bg-white border border-gray-200 rounded-lg p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">You have unsaved changes</h4>
              <p className="text-sm text-gray-600">
                Save your notification preferences to apply changes
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={resetSettings}>
                Cancel
              </Button>
              <Button onClick={saveSettings}>Save Changes</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
