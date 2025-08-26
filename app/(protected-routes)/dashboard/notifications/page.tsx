"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import {
  Bell,
  Calendar,
  Trash2,
  Eye,
  CheckCheck,
  Clock,
  MoreVertical,
  AlertCircle,
} from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications-db";
import { Notification, NOTIFICATION_TYPES } from "@/types/notification";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface NotificationFilters {
  search: string;
  type: string;
  status: "all" | "read" | "unread";
  dateRange: "all" | "today" | "week" | "month";
}

export default function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    isLoading,
    error,
  } = useNotifications();

  const [filters, setFilters] = useState<NotificationFilters>({
    search: "",
    type: "all",
    status: "all",
    dateRange: "all",
  });

  const [selectedNotifications, setSelectedNotifications] = useState<string[]>(
    []
  );

  const filteredNotifications = useMemo(() => {
    return notifications.filter((notification) => {
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        if (
          !notification.title.toLowerCase().includes(searchTerm) &&
          !notification.message.toLowerCase().includes(searchTerm)
        ) {
          return false;
        }
      }

      // Type filter
      if (filters.type !== "all" && notification.type !== filters.type) {
        return false;
      }

      // Status filter
      if (filters.status === "read" && !notification.isRead) return false;
      if (filters.status === "unread" && notification.isRead) return false;

      // Date range filter
      if (filters.dateRange !== "all") {
        const now = new Date();
        const notificationDate = new Date(notification.timestamp);
        const diffTime = now.getTime() - notificationDate.getTime();
        const diffDays = diffTime / (1000 * 60 * 60 * 24);

        switch (filters.dateRange) {
          case "today":
            if (diffDays > 1) return false;
            break;
          case "week":
            if (diffDays > 7) return false;
            break;
          case "month":
            if (diffDays > 30) return false;
            break;
        }
      }

      return true;
    });
  }, [notifications, filters]);

  const toggleNotificationSelection = (id: string) => {
    setSelectedNotifications((prev) =>
      prev.includes(id) ? prev.filter((nId) => nId !== id) : [...prev, id]
    );
  };

  const selectAllVisible = () => {
    setSelectedNotifications(filteredNotifications.map((n) => n.id));
  };

  const deselectAll = () => {
    setSelectedNotifications([]);
  };

  const handleBulkMarkAsRead = () => {
    selectedNotifications.forEach((id) => {
      const notification = notifications.find((n) => n.id === id);
      if (notification && !notification.isRead) {
        markAsRead(id);
      }
    });
    setSelectedNotifications([]);
    toast.success(
      `Marked ${selectedNotifications.length} notifications as read`
    );
  };

  const handleBulkDelete = () => {
    if (
      confirm(
        `Delete ${selectedNotifications.length} notifications? This action cannot be undone.`
      )
    ) {
      selectedNotifications.forEach((id) => deleteNotification(id));
      setSelectedNotifications([]);
      toast.success(`Deleted ${selectedNotifications.length} notifications`);
    }
  };

  const getNotificationTypeInfo = (type: string) => {
    return (
      NOTIFICATION_TYPES[type as keyof typeof NOTIFICATION_TYPES] || {
        label: type,
        color: "#6B7280",
        icon: "🔔",
      }
    );
  };

  const groupedByDate = useMemo(() => {
    const groups: { [key: string]: Notification[] } = {};

    filteredNotifications.forEach((notification) => {
      const date = new Date(notification.timestamp);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let groupKey: string;
      if (date.toDateString() === today.toDateString()) {
        groupKey = "Today";
      } else if (date.toDateString() === yesterday.toDateString()) {
        groupKey = "Yesterday";
      } else {
        groupKey = date.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(notification);
    });

    return groups;
  }, [filteredNotifications]);

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Separator orientation="vertical" className="h-6" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Bell className="h-8 w-8" />
              Notifications
            </h1>
          </div>
        </div>

        <Button
          disabled={unreadCount === 0}
          variant="outline"
          onClick={markAllAsRead}
        >
          <CheckCheck className="h-4 w-4 mr-2" />
          Mark All Read
        </Button>
      </div>

      {/* Bulk Actions */}
      {selectedNotifications.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCheck className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-900">
                  {selectedNotifications.length} notifications selected
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={selectAllVisible}>
                  Select All Visible
                </Button>
                <Button variant="outline" size="sm" onClick={deselectAll}>
                  Deselect All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkMarkAsRead}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Mark as Read
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notifications List */}
      {isLoading ? (
        <Card>
          <CardContent className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading notifications...</p>
          </CardContent>
        </Card>
      ) : error ? (
        <Card className="border-red-200">
          <CardContent className="text-center">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-600 mb-2">
              Failed to load notifications
            </h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </CardContent>
        </Card>
      ) : filteredNotifications.length === 0 ? (
        <Card>
          <CardContent className="text-center">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No notifications found
            </h3>
            <p className="text-gray-500">
              {filters.search ||
              filters.type !== "all" ||
              filters.status !== "all" ||
              filters.dateRange !== "all"
                ? "Try adjusting your filters to see more notifications."
                : "You don't have any notifications yet."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedByDate).map(
            ([dateGroup, groupNotifications]) => (
              <Card key={dateGroup}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    {dateGroup}
                    <Badge variant="secondary">
                      {groupNotifications.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {groupNotifications.map((notification) => {
                      const typeInfo = getNotificationTypeInfo(
                        notification.type
                      );
                      const isSelected = selectedNotifications.includes(
                        notification.id
                      );

                      return (
                        <div
                          key={notification.id}
                          className={`p-4 transition-colors ${
                            isSelected
                              ? "bg-blue-50 border-l-4 border-l-blue-500"
                              : ""
                          } ${!notification.isRead ? "bg-gray-50" : ""}`}
                        >
                          <div className="flex items-start gap-4">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() =>
                                toggleNotificationSelection(notification.id)
                              }
                              className="mt-1"
                            />

                            <div
                              className="w-3 h-3 rounded-full mt-2 flex-shrink-0"
                              style={{ backgroundColor: typeInfo.color }}
                            />

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3
                                      className={`font-medium ${
                                        !notification.isRead
                                          ? "text-gray-900"
                                          : "text-gray-700"
                                      }`}
                                    >
                                      {notification.title}
                                    </h3>
                                    {!notification.isRead && (
                                      <Badge
                                        variant="destructive"
                                        className="text-xs"
                                      >
                                        New
                                      </Badge>
                                    )}
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {typeInfo.icon} {typeInfo.label}
                                    </Badge>
                                    {notification.priority === "high" && (
                                      <Badge
                                        variant="destructive"
                                        className="text-xs"
                                      >
                                        High Priority
                                      </Badge>
                                    )}
                                  </div>

                                  <p
                                    className={`text-sm mb-2 ${
                                      !notification.isRead
                                        ? "text-gray-800"
                                        : "text-gray-600"
                                    }`}
                                  >
                                    {notification.message}
                                  </p>

                                  <div className="flex items-center gap-3 text-xs text-gray-500">
                                    <span className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {formatDistanceToNow(
                                        new Date(notification.timestamp),
                                        { addSuffix: true }
                                      )}
                                    </span>
                                    {notification.metadata?.category && (
                                      <span>
                                        Category:{" "}
                                        {notification.metadata.category}
                                      </span>
                                    )}
                                    {notification.metadata?.course && (
                                      <span>
                                        Course: {notification.metadata.course}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0"
                                    >
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    {!notification.isRead && (
                                      <DropdownMenuItem
                                        onClick={() =>
                                          markAsRead(notification.id)
                                        }
                                      >
                                        <Eye className="h-4 w-4 mr-2" />
                                        Mark as read
                                      </DropdownMenuItem>
                                    )}
                                    {notification.link && (
                                      <>
                                        <DropdownMenuItem asChild>
                                          <Link href={notification.link}>
                                            View Details
                                          </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                      </>
                                    )}

                                    <DropdownMenuItem
                                      onClick={() =>
                                        deleteNotification(notification.id)
                                      }
                                      className="text-red-600"
                                      variant="destructive"
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )
          )}
        </div>
      )}
      {notifications.length > 0 ? (
        <Button
          variant="destructive"
          onClick={() => {
            if (
              confirm("Delete all notifications? This action cannot be undone.")
            ) {
              clearAllNotifications();
              toast.success("All notifications deleted");
            }
          }}
        >
          <Trash2 className="h-4 w-4" />
          Clear All Notifications
        </Button>
      ) : null}
    </div>
  );
}
