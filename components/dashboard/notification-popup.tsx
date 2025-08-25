"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  BellIcon,
  MoreHorizontal,
  Check,
  CheckCheck,
  X,
  Settings,
  Clock,
  ExternalLink,
  AlertCircle,
  MessageSquare,
  Calendar,
  Users,
  Trophy,
  SettingsIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";
import { useNotifications } from "@/hooks/use-notifications";
import { Notification, NOTIFICATION_TYPES } from "@/types/notification";
import { cn } from "@/lib/utils";

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

const getTimeAgo = (timestamp: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor(
    (now.getTime() - timestamp.getTime()) / 1000
  );

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800)
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return timestamp.toLocaleDateString();
};

const getNotificationIcon = (type: Notification["type"]) => {
  const iconMap = {
    message: MessageSquare,
    study_session: Calendar,
    exam_reminder: AlertCircle,
    group_invite: Users,
    achievement: Trophy,
    system: SettingsIcon,
    schedule_update: Calendar,
  };

  const IconComponent = iconMap[type];
  return <IconComponent className="h-4 w-4" />;
};

const NotificationItem = ({
  notification,
  onMarkAsRead,
  onDelete,
}: NotificationItemProps) => {
  const typeInfo = NOTIFICATION_TYPES[notification.type];

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onMarkAsRead(notification.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(notification.id);
  };

  const content = (
    <div
      className={cn(
        "flex items-start gap-3 p-3 hover:bg-gray-50 transition-colors border-l-2",
        notification.isRead
          ? "opacity-70 border-l-transparent"
          : "border-l-blue-500",
        notification.priority === "high" && !notification.isRead
          ? "bg-red-50 border-l-red-500"
          : "",
        notification.priority === "medium" && !notification.isRead
          ? "bg-yellow-50 border-l-yellow-500"
          : ""
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white",
          notification.isRead ? "bg-gray-400" : ""
        )}
        style={{
          backgroundColor: notification.isRead ? undefined : typeInfo.color,
        }}
      >
        {getNotificationIcon(notification.type)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h4
              className={cn(
                "text-sm truncate",
                notification.isRead
                  ? "text-gray-600"
                  : "font-semibold text-gray-900"
              )}
            >
              {notification.title}
            </h4>
            <p
              className={cn(
                "text-xs mt-1 line-clamp-2",
                notification.isRead ? "text-gray-500" : "text-gray-700"
              )}
            >
              {notification.message}
            </p>

            {/* Metadata */}
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="h-3 w-3" />
                {getTimeAgo(notification.timestamp)}
              </div>

              {notification.metadata?.senderName && (
                <Badge variant="outline" className="text-xs">
                  {notification.metadata.senderName}
                </Badge>
              )}

              {notification.priority === "high" && !notification.isRead && (
                <Badge variant="destructive" className="text-xs">
                  Urgent
                </Badge>
              )}

              {notification.actionable && !notification.isRead && (
                <Badge variant="secondary" className="text-xs">
                  Action Required
                </Badge>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {!notification.isRead && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={handleMarkAsRead}
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Mark as read</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {!notification.isRead && (
                  <DropdownMenuItem onClick={handleMarkAsRead}>
                    <Check className="h-4 w-4 mr-2" />
                    Mark as read
                  </DropdownMenuItem>
                )}
                {notification.link && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href={notification.link}>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}

                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-red-600"
                  variant="destructive"
                >
                  <X className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );

  if (notification.link) {
    return (
      <Link href={notification.link} className="block">
        {content}
      </Link>
    );
  }

  return content;
};

const NotificationPopup = () => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    simulateNewNotification,
    isLoading,
  } = useNotifications();

  const [filter, setFilter] = useState<"all" | "unread">("all");

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "unread") return !notification.isRead;
    return true;
  });

  const hasNotifications = notifications.length > 0;
  const hasUnread = unreadCount > 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={`Notifications${
            hasUnread ? ` (${unreadCount} unread)` : ""
          }`}
        >
          <BellIcon className="h-5 w-5" />
          {hasUnread && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-80 max-w-[90vw]" align="end">
        {/* Header */}
        <div className="flex items-center justify-between p-4 pb-2">
          <DropdownMenuLabel className="text-base font-semibold p-0">
            Notifications
            {hasUnread && (
              <Badge variant="secondary" className="ml-2">
                {unreadCount} new
              </Badge>
            )}
          </DropdownMenuLabel>

          <div className="flex items-center gap-1">
            {/* Demo button - remove in production */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={simulateNewNotification}
                    className="h-7 w-7 p-0 text-blue-600"
                  >
                    +
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Add test notification</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {hasUnread && (
                  <>
                    <DropdownMenuItem onClick={markAllAsRead}>
                      <CheckCheck className="h-4 w-4 mr-2" />
                      Mark all as read
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                {hasNotifications && (
                  <>
                    <DropdownMenuItem
                      onClick={clearAllNotifications}
                      className="text-red-600"
                      variant="destructive"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Clear all
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings/notifications">
                    <Settings className="h-4 w-4 mr-2" />
                    Notification settings
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Filter Tabs */}
        {hasNotifications && (
          <div className="px-4 pb-2">
            <div className="flex gap-1 bg-gray-100 rounded-md p-1">
              <Button
                variant={filter === "all" ? "default" : "ghost"}
                size="sm"
                onClick={() => setFilter("all")}
                className="flex-1 h-7 text-xs"
              >
                All ({notifications.length})
              </Button>
              <Button
                variant={filter === "unread" ? "default" : "ghost"}
                size="sm"
                onClick={() => setFilter("unread")}
                className="flex-1 h-7 text-xs"
              >
                Unread ({unreadCount})
              </Button>
            </div>
          </div>
        )}

        <Separator />

        {/* Notifications List */}
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-500">Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-8 text-center">
            <BellIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">
              {filter === "unread"
                ? "No unread notifications"
                : "No notifications yet"}
            </p>
            {filter === "all" && (
              <p className="text-xs text-gray-400 mt-1">
                You'll see study reminders, messages, and updates here
              </p>
            )}
          </div>
        ) : (
          <ScrollArea className="h-64">
            <div className="divide-y">
              {filteredNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={markAsRead}
                  onDelete={deleteNotification}
                />
              ))}
            </div>
          </ScrollArea>
        )}

        {/* Footer */}
        {hasNotifications && (
          <>
            <Separator />
            <div className="p-3">
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link href="/dashboard/notifications">
                  View all notifications
                </Link>
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationPopup;
