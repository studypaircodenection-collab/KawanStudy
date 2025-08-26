# 🔔 Hybrid Notification System Implementation Guide

A complete guide for implementing the optimistic-UI hybrid notification system in your application.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Database Setup](#database-setup)
4. [Backend Implementation](#backend-implementation)
5. [Frontend Implementation](#frontend-implementation)
6. [Integration Examples](#integration-examples)
7. [Customization](#customization)
8. [Testing](#testing)
9. [Production Considerations](#production-considerations)

## 🎯 Overview

This notification system provides:
- **Optimistic UI updates** for instant user feedback
- **Reliable backend synchronization** with auto-rollback
- **Real-time updates** via Supabase Realtime
- **Smart aggregation** and quiet hours support
- **Template-based notifications** for consistency
- **Full TypeScript support** with type safety

### Key Benefits
- ⚡ **Instant UI updates** - no waiting for API calls
- 🔄 **Auto-rollback** on failures
- 📱 **Mobile-friendly** with loading states
- 🔔 **Real-time delivery** across devices
- 🛡️ **Type-safe** implementation
- 🎨 **Customizable** UI components

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   UI Component  │    │   Custom Hook    │    │    Database     │
│                 │    │                  │    │                 │
│ - Optimistic UI │◄──►│ - State Mgmt     │◄──►│ - Notifications │
│ - Loading States│    │ - API Calls      │    │ - Settings      │
│ - Error Handling│    │ - Realtime Sub   │    │ - Templates     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Toast System  │    │   API Routes     │    │   Triggers      │
│                 │    │                  │    │                 │
│ - Success/Error │    │ - CRUD Ops       │    │ - Auto-create   │
│ - User Feedback │    │ - Validation     │    │ - Event-driven  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🗄️ Database Setup

### 1. Create Database Tables

```sql
-- notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  is_read BOOLEAN DEFAULT FALSE,
  actionable BOOLEAN DEFAULT FALSE,
  link TEXT,
  avatar TEXT,
  metadata JSONB DEFAULT '{}',
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- notification_settings table
CREATE TABLE notification_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  enable_push_notifications BOOLEAN DEFAULT TRUE,
  enable_email_notifications BOOLEAN DEFAULT TRUE,
  enable_study_reminders BOOLEAN DEFAULT TRUE,
  enable_group_invites BOOLEAN DEFAULT TRUE,
  enable_exam_reminders BOOLEAN DEFAULT TRUE,
  enable_achievement_notifications BOOLEAN DEFAULT TRUE,
  notification_sound BOOLEAN DEFAULT TRUE,
  quiet_hours_enabled BOOLEAN DEFAULT FALSE,
  quiet_hours_start TIME DEFAULT '22:00',
  quiet_hours_end TIME DEFAULT '08:00',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- notification_templates table
CREATE TABLE notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL UNIQUE,
  title_template TEXT NOT NULL,
  message_template TEXT NOT NULL,
  default_priority TEXT DEFAULT 'medium',
  actionable BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. Add Indexes

```sql
-- Performance indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_expires ON notifications(expires_at) WHERE expires_at IS NOT NULL;
```

### 3. Row Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own notifications" 
  ON notifications FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notifications" 
  ON notifications FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" 
  ON notifications FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications" 
  ON notifications FOR DELETE 
  USING (auth.uid() = user_id);

-- Settings policies
CREATE POLICY "Users can manage own settings" 
  ON notification_settings FOR ALL 
  USING (auth.uid() = user_id);
```

### 4. Database Functions

```sql
-- Function to get user notifications
CREATE OR REPLACE FUNCTION get_user_notifications(
  p_user_id UUID,
  p_limit INT DEFAULT 50,
  p_offset INT DEFAULT 0,
  p_unread_only BOOLEAN DEFAULT FALSE
)
RETURNS TABLE (
  id UUID,
  type TEXT,
  title TEXT,
  message TEXT,
  priority TEXT,
  is_read BOOLEAN,
  actionable BOOLEAN,
  link TEXT,
  avatar TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    n.id, n.type, n.title, n.message, n.priority,
    n.is_read, n.actionable, n.link, n.avatar, n.metadata, n.created_at
  FROM notifications n
  WHERE 
    n.user_id = p_user_id
    AND (NOT p_unread_only OR n.is_read = FALSE)
    AND (n.expires_at IS NULL OR n.expires_at > NOW())
  ORDER BY n.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark notifications as read
CREATE OR REPLACE FUNCTION mark_notifications_read(
  p_user_id UUID,
  p_notification_ids UUID[] DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  IF p_notification_ids IS NULL THEN
    -- Mark all notifications as read
    UPDATE notifications 
    SET is_read = TRUE, updated_at = NOW()
    WHERE user_id = p_user_id AND is_read = FALSE;
  ELSE
    -- Mark specific notifications as read
    UPDATE notifications 
    SET is_read = TRUE, updated_at = NOW()
    WHERE user_id = p_user_id AND id = ANY(p_notification_ids);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## 🔧 Backend Implementation

### 1. API Routes (`app/api/notifications/route.ts`)

```typescript
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/notifications
export async function GET(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const limit = parseInt(searchParams.get('limit') || '50');
  const offset = parseInt(searchParams.get('offset') || '0');
  const unreadOnly = searchParams.get('unread') === 'true';

  try {
    const { data, error } = await supabase.rpc('get_user_notifications', {
      p_user_id: user.id,
      p_limit: limit,
      p_offset: offset,
      p_unread_only: unreadOnly,
    });

    if (error) throw error;

    return NextResponse.json({ 
      notifications: data || [],
      hasMore: data?.length === limit 
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

// POST /api/notifications
export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { type, title, message, priority = 'medium', actionable = false, link, metadata } = body;

    // Validate required fields
    if (!type || !title || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: type, title, message' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: user.id,
        type,
        title,
        message,
        priority,
        actionable,
        link,
        metadata: metadata || {},
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ notification: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}

// PATCH /api/notifications
export async function PATCH(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action, notificationIds } = body;

    if (action === 'markAsRead') {
      const { error } = await supabase.rpc('mark_notifications_read', {
        p_user_id: user.id,
        p_notification_ids: notificationIds || null,
      });

      if (error) throw error;

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update notifications' },
      { status: 500 }
    );
  }
}

// DELETE /api/notifications
export async function DELETE(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const notificationId = searchParams.get('id');

  try {
    if (notificationId) {
      // Delete specific notification
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) throw error;
    } else {
      // Delete all notifications
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete notification(s)' },
      { status: 500 }
    );
  }
}
```

### 2. Notification Helper Service (`lib/services/notifications.ts`)

```typescript
import { createClient } from '@/lib/supabase/server';

export interface CreateNotificationParams {
  userId: string;
  type: string;
  title: string;
  message: string;
  priority?: 'low' | 'medium' | 'high';
  actionable?: boolean;
  link?: string;
  metadata?: Record<string, any>;
  expiresAt?: Date;
}

export class NotificationService {
  private supabase = createClient();

  async createNotification(params: CreateNotificationParams) {
    const {
      userId,
      type,
      title,
      message,
      priority = 'medium',
      actionable = false,
      link,
      metadata = {},
      expiresAt,
    } = params;

    try {
      const { data, error } = await this.supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type,
          title,
          message,
          priority,
          actionable,
          link,
          metadata,
          expires_at: expiresAt?.toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, notification: data };
    } catch (error) {
      console.error('Failed to create notification:', error);
      return { success: false, error };
    }
  }

  async createFromTemplate(
    userId: string,
    templateType: string,
    variables: Record<string, string>,
    options?: Partial<CreateNotificationParams>
  ) {
    try {
      // Get template
      const { data: template, error: templateError } = await this.supabase
        .from('notification_templates')
        .select('*')
        .eq('type', templateType)
        .single();

      if (templateError || !template) {
        throw new Error(`Template not found: ${templateType}`);
      }

      // Replace variables in title and message
      let title = template.title_template;
      let message = template.message_template;

      Object.entries(variables).forEach(([key, value]) => {
        const placeholder = `{{${key}}}`;
        title = title.replace(new RegExp(placeholder, 'g'), value);
        message = message.replace(new RegExp(placeholder, 'g'), value);
      });

      return await this.createNotification({
        userId,
        type: templateType,
        title,
        message,
        priority: template.default_priority,
        actionable: template.actionable,
        ...options,
      });
    } catch (error) {
      console.error('Failed to create notification from template:', error);
      return { success: false, error };
    }
  }

  async sendBulkNotifications(notifications: CreateNotificationParams[]) {
    try {
      const { data, error } = await this.supabase
        .from('notifications')
        .insert(
          notifications.map(n => ({
            user_id: n.userId,
            type: n.type,
            title: n.title,
            message: n.message,
            priority: n.priority || 'medium',
            actionable: n.actionable || false,
            link: n.link,
            metadata: n.metadata || {},
            expires_at: n.expiresAt?.toISOString(),
          }))
        )
        .select();

      if (error) throw error;
      return { success: true, notifications: data };
    } catch (error) {
      console.error('Failed to send bulk notifications:', error);
      return { success: false, error };
    }
  }
}

// Singleton instance
export const notificationService = new NotificationService();
```

## 🎨 Frontend Implementation

### 1. TypeScript Types (`types/notification.ts`)

```typescript
export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  timestamp: Date;
  link?: string;
  avatar?: string;
  priority: 'low' | 'medium' | 'high';
  actionable?: boolean;
  metadata?: Record<string, any>;
}

export interface NotificationSettings {
  enablePushNotifications: boolean;
  enableEmailNotifications: boolean;
  enableStudyReminders: boolean;
  enableGroupInvites: boolean;
  enableExamReminders: boolean;
  enableAchievementNotifications: boolean;
  notificationSound: boolean;
  quietHours: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  };
}

export const NOTIFICATION_TYPES = {
  message: {
    icon: '💬',
    color: '#3B82F6',
    label: 'Message',
  },
  achievement: {
    icon: '🏆',
    color: '#F59E0B',
    label: 'Achievement',
  },
  reminder: {
    icon: '⏰',
    color: '#EF4444',
    label: 'Reminder',
  },
  system: {
    icon: '⚙️',
    color: '#6B7280',
    label: 'System',
  },
  // Add your custom types here
} as const;
```

### 2. Custom Hook (`hooks/use-notifications.ts`)

```typescript
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Notification, NotificationSettings } from "@/types/notification";
import { createClient } from "@/lib/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";

const DEFAULT_SETTINGS: NotificationSettings = {
  enablePushNotifications: true,
  enableEmailNotifications: true,
  enableStudyReminders: true,
  enableGroupInvites: true,
  enableExamReminders: true,
  enableAchievementNotifications: true,
  notificationSound: true,
  quietHours: {
    enabled: false,
    startTime: "22:00",
    endTime: "08:00",
  },
};

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<Set<string>>(new Set());

  const supabase = createClient();
  const realtimeChannel = useRef<RealtimeChannel | null>(null);

  // Transform database notification to client notification
  const transformNotification = (dbNotification: any): Notification => ({
    id: dbNotification.id,
    type: dbNotification.type,
    title: dbNotification.title,
    message: dbNotification.message,
    isRead: dbNotification.is_read,
    timestamp: new Date(dbNotification.created_at),
    priority: dbNotification.priority,
    actionable: dbNotification.actionable,
    link: dbNotification.link,
    avatar: dbNotification.avatar,
    metadata: dbNotification.metadata,
  });

  // Load initial data
  const loadNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase.rpc("get_user_notifications", {
        p_user_id: (await supabase.auth.getUser()).data.user?.id,
        p_limit: 100,
        p_offset: 0,
      });

      if (error) throw error;

      const transformedNotifications = (data || []).map(transformNotification);
      setNotifications(transformedNotifications);
    } catch (err) {
      console.error("Error loading notifications:", err);
      setError("Failed to load notifications");
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  // Setup real-time subscription
  useEffect(() => {
    loadNotifications();

    const setupRealtimeSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      realtimeChannel.current = supabase
        .channel(`notifications:${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            if (payload.eventType === "INSERT") {
              const newNotification = transformNotification(payload.new);
              setNotifications((prev) => [newNotification, ...prev]);
              
              // Play notification sound if enabled
              if (settings.notificationSound) {
                // Add your sound logic here
              }
            } else if (payload.eventType === "UPDATE") {
              const updatedNotification = transformNotification(payload.new);
              setNotifications((prev) =>
                prev.map((n) =>
                  n.id === updatedNotification.id ? updatedNotification : n
                )
              );
            } else if (payload.eventType === "DELETE") {
              setNotifications((prev) =>
                prev.filter((n) => n.id !== payload.old.id)
              );
            }
          }
        )
        .subscribe();
    };

    setupRealtimeSubscription();

    return () => {
      if (realtimeChannel.current) {
        supabase.removeChannel(realtimeChannel.current);
      }
    };
  }, [supabase, loadNotifications, settings.notificationSound]);

  // Optimistic UI actions
  const markAsRead = useCallback(
    async (notificationId: string) => {
      // Set loading state
      setActionLoading(prev => new Set(prev).add(`mark-read-${notificationId}`));
      
      // Optimistic update
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );

      try {
        const { error } = await supabase.rpc("mark_notifications_read", {
          p_user_id: (await supabase.auth.getUser()).data.user?.id,
          p_notification_ids: [notificationId],
        });

        if (error) throw error;
      } catch (err) {
        console.error("Error marking notification as read:", err);
        // Revert optimistic update
        setNotifications((prev) =>
          prev.map((notification) =>
            notification.id === notificationId
              ? { ...notification, isRead: false }
              : notification
          )
        );
        throw err;
      } finally {
        setActionLoading(prev => {
          const newSet = new Set(prev);
          newSet.delete(`mark-read-${notificationId}`);
          return newSet;
        });
      }
    },
    [supabase]
  );

  const deleteNotification = useCallback(
    async (notificationId: string) => {
      // Set loading state
      setActionLoading(prev => new Set(prev).add(`delete-${notificationId}`));
      
      // Store original for rollback
      const originalNotification = notifications.find(n => n.id === notificationId);
      
      // Optimistic update
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));

      try {
        const { error } = await supabase
          .from("notifications")
          .delete()
          .eq("id", notificationId);

        if (error) throw error;
      } catch (err) {
        console.error("Error deleting notification:", err);
        // Revert optimistic update
        if (originalNotification) {
          setNotifications((prev) => [...prev, originalNotification].sort(
            (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          ));
        }
        throw err;
      } finally {
        setActionLoading(prev => {
          const newSet = new Set(prev);
          newSet.delete(`delete-${notificationId}`);
          return newSet;
        });
      }
    },
    [supabase, notifications]
  );

  const createNotification = useCallback(
    async (
      type: string,
      title: string,
      message: string,
      priority: "low" | "medium" | "high" = "medium",
      actionable: boolean = false,
      link?: string,
      metadata?: Record<string, any>
    ) => {
      try {
        const response = await fetch("/api/notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type,
            title,
            message,
            priority,
            actionable,
            link,
            metadata,
          }),
        });

        if (!response.ok) throw new Error("Failed to create notification");

        const { notification } = await response.json();
        return notification;
      } catch (err) {
        console.error("Error creating notification:", err);
        throw err;
      }
    },
    []
  );

  const getUnreadCount = useCallback(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  return {
    notifications,
    settings,
    isLoading,
    error,
    actionLoading,
    unreadCount: getUnreadCount(),
    markAsRead,
    deleteNotification,
    createNotification,
    // Helper functions
    isActionLoading: (action: string, id?: string) => {
      const key = id ? `${action}-${id}` : action;
      return actionLoading.has(key);
    },
    // Utility functions
    getNotificationsByType: (type: string) => 
      notifications.filter((n) => n.type === type),
    getRecentNotifications: (hours: number = 24) => {
      const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
      return notifications.filter((n) => n.timestamp > cutoff);
    },
  };
}
```

### 3. UI Component (`components/notifications/notification-popup.tsx`)

```typescript
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bell, Check, X, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNotifications } from "@/hooks/use-notifications";
import { toast } from "sonner";

export function NotificationPopup() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    deleteNotification,
    isActionLoading,
  } = useNotifications();

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id);
    } catch (error) {
      toast.error("Failed to mark notification as read");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNotification(id);
      toast.success("Notification deleted");
    } catch (error) {
      toast.error("Failed to delete notification");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-80" align="end">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-500">{unreadCount} new</p>
          )}
        </div>

        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No notifications yet
            </div>
          ) : (
            notifications.slice(0, 10).map((notification) => (
              <div
                key={notification.id}
                className={`p-3 border-b hover:bg-gray-50 ${
                  !notification.isRead ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className={`text-sm ${!notification.isRead ? 'font-semibold' : ''}`}>
                      {notification.title}
                    </h4>
                    <p className="text-xs text-gray-600 mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {notification.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-1 ml-2">
                    {!notification.isRead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkAsRead(notification.id)}
                        disabled={isActionLoading("mark-read", notification.id)}
                        className="h-7 w-7 p-0"
                      >
                        {isActionLoading("mark-read", notification.id) ? (
                          <div className="animate-spin rounded-full h-3 w-3 border-b border-gray-600" />
                        ) : (
                          <Check className="h-3 w-3" />
                        )}
                      </Button>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(notification.id)}
                      disabled={isActionLoading("delete", notification.id)}
                      className="h-7 w-7 p-0 text-red-600"
                    >
                      {isActionLoading("delete", notification.id) ? (
                        <div className="animate-spin rounded-full h-3 w-3 border-b border-red-600" />
                      ) : (
                        <X className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {notifications.length > 10 && (
          <div className="p-3 border-t">
            <Button variant="outline" className="w-full" size="sm">
              View all notifications
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

## 🔗 Integration Examples

### 1. Achievement System Integration

```typescript
// When user completes an achievement
export async function completeAchievement(userId: string, achievementId: string) {
  try {
    // Update achievement in database
    await updateUserAchievement(userId, achievementId);

    // Create notification
    await notificationService.createFromTemplate(
      userId,
      'achievement_unlocked',
      {
        achievementName: 'Study Streak Master',
        points: '100',
      },
      {
        priority: 'high',
        actionable: true,
        link: '/achievements',
      }
    );

    return { success: true };
  } catch (error) {
    console.error('Failed to complete achievement:', error);
    return { success: false, error };
  }
}
```

### 2. Friend Request Integration

```typescript
// When user sends friend request
export async function sendFriendRequest(senderId: string, receiverId: string) {
  try {
    // Create friend request in database
    await createFriendRequest(senderId, receiverId);

    // Get sender info
    const sender = await getUserProfile(senderId);

    // Notify receiver
    await notificationService.createNotification({
      userId: receiverId,
      type: 'friend_request',
      title: 'New Friend Request',
      message: `${sender.name} wants to be your study buddy!`,
      priority: 'medium',
      actionable: true,
      link: '/friends/requests',
      metadata: {
        senderId,
        senderName: sender.name,
        senderAvatar: sender.avatar,
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to send friend request:', error);
    return { success: false, error };
  }
}
```

### 3. Study Session Reminder

```typescript
// Scheduled reminder function
export async function sendStudyReminders() {
  const upcomingSessions = await getUpcomingStudySessions();

  const notifications = upcomingSessions.map(session => ({
    userId: session.userId,
    type: 'study_reminder',
    title: 'Study Session Starting Soon',
    message: `Your ${session.subject} session starts in 15 minutes`,
    priority: 'high' as const,
    actionable: true,
    link: '/study/sessions',
    metadata: {
      sessionId: session.id,
      subject: session.subject,
      startTime: session.startTime,
    },
  }));

  await notificationService.sendBulkNotifications(notifications);
}
```

## 🎨 Customization

### 1. Custom Notification Types

```typescript
// Add to your notification types
export const CUSTOM_NOTIFICATION_TYPES = {
  ...NOTIFICATION_TYPES,
  course_update: {
    icon: '📚',
    color: '#8B5CF6',
    label: 'Course Update',
  },
  assignment_due: {
    icon: '📝',
    color: '#DC2626',
    label: 'Assignment Due',
  },
  grade_posted: {
    icon: '⭐',
    color: '#059669',
    label: 'Grade Posted',
  },
};
```

### 2. Custom Templates

```sql
-- Add notification templates
INSERT INTO notification_templates (type, title_template, message_template, default_priority, actionable) VALUES
('course_update', 'Course Update: {{courseName}}', 'New content available in {{courseName}}: {{updateDetails}}', 'medium', true),
('assignment_due', 'Assignment Due Soon', 'Your {{assignmentName}} is due {{dueDate}}', 'high', true),
('grade_posted', 'New Grade Posted', 'Your grade for {{assignmentName}} is now available: {{grade}}', 'medium', true);
```

### 3. Custom UI Themes

```css
/* Custom notification themes */
.notification-popup {
  --notification-bg: #ffffff;
  --notification-border: #e5e7eb;
  --notification-text: #374151;
  --notification-accent: #3b82f6;
}

.notification-popup.dark {
  --notification-bg: #1f2937;
  --notification-border: #374151;
  --notification-text: #f9fafb;
  --notification-accent: #60a5fa;
}

.notification-item {
  background: var(--notification-bg);
  border-color: var(--notification-border);
  color: var(--notification-text);
}

.notification-item.unread {
  border-left: 3px solid var(--notification-accent);
}
```

## 🧪 Testing

### 1. Unit Tests

```typescript
// __tests__/notifications.test.ts
import { renderHook, act } from '@testing-library/react';
import { useNotifications } from '@/hooks/use-notifications';

describe('useNotifications', () => {
  it('should handle optimistic updates correctly', async () => {
    const { result } = renderHook(() => useNotifications());

    // Mock notification
    const mockNotification = {
      id: '1',
      title: 'Test',
      message: 'Test message',
      isRead: false,
      // ... other properties
    };

    // Add notification to state
    act(() => {
      result.current.setNotifications([mockNotification]);
    });

    // Test optimistic update
    await act(async () => {
      await result.current.markAsRead('1');
    });

    expect(result.current.notifications[0].isRead).toBe(true);
  });
});
```

### 2. Integration Tests

```typescript
// __tests__/notification-api.test.ts
import { POST } from '@/app/api/notifications/route';

describe('/api/notifications', () => {
  it('should create notification successfully', async () => {
    const request = new Request('http://localhost/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'test',
        title: 'Test Notification',
        message: 'Test message',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.notification).toBeDefined();
  });
});
```

### 3. E2E Tests

```typescript
// __tests__/e2e/notifications.spec.ts
import { test, expect } from '@playwright/test';

test('notification workflow', async ({ page }) => {
  await page.goto('/dashboard');

  // Click notification bell
  await page.click('[data-testid="notification-bell"]');

  // Check for notifications
  const dropdown = page.locator('[data-testid="notification-dropdown"]');
  await expect(dropdown).toBeVisible();

  // Mark notification as read
  await page.click('[data-testid="mark-read-btn"]');

  // Verify optimistic update
  const notification = page.locator('[data-testid="notification-item"]');
  await expect(notification).toHaveClass(/read/);
});
```

## 🚀 Production Considerations

### 1. Performance Optimization

```typescript
// Add pagination for large notification lists
const usePaginatedNotifications = (pageSize = 20) => {
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const loadMore = useCallback(async () => {
    const { notifications, hasMore: moreAvailable } = await fetchNotifications({
      limit: pageSize,
      offset: page * pageSize,
    });

    setNotifications(prev => [...prev, ...notifications]);
    setHasMore(moreAvailable);
    setPage(prev => prev + 1);
  }, [page, pageSize]);

  return { loadMore, hasMore };
};
```

### 2. Error Boundary

```typescript
// components/error-boundary.tsx
export class NotificationErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Notification error:', error, errorInfo);
    // Report to error tracking service
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-center">
          <h3>Something went wrong with notifications</h3>
          <button onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### 3. Monitoring & Analytics

```typescript
// lib/analytics/notifications.ts
export const trackNotificationEvent = (event: string, data: any) => {
  // Track notification events
  analytics.track('notification_' + event, {
    ...data,
    timestamp: new Date().toISOString(),
  });
};

// Usage
trackNotificationEvent('created', { type, priority });
trackNotificationEvent('marked_read', { notificationId });
trackNotificationEvent('deleted', { notificationId });
```

### 4. Rate Limiting

```typescript
// lib/rate-limit.ts
import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export async function rateLimit(userId: string, limit = 10, window = 3600) {
  const key = `notification_rate_limit:${userId}`;
  const current = await redis.incr(key);
  
  if (current === 1) {
    await redis.expire(key, window);
  }
  
  return current <= limit;
}
```

### 5. Cleanup Jobs

```typescript
// lib/cleanup/notifications.ts
export async function cleanupExpiredNotifications() {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('notifications')
    .delete()
    .lt('expires_at', new Date().toISOString());

  if (error) {
    console.error('Failed to cleanup expired notifications:', error);
  }
}

// Run cleanup job daily
export async function scheduleCleanup() {
  // Use your preferred job scheduler (cron, etc.)
  setInterval(cleanupExpiredNotifications, 24 * 60 * 60 * 1000);
}
```

## 📚 Additional Resources

- [Supabase Realtime Documentation](https://supabase.com/docs/guides/realtime)
- [React Query for Server State](https://tanstack.com/query/latest)
- [Optimistic Updates Best Practices](https://react-query.tanstack.com/guides/optimistic-updates)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## 📄 License

This notification system implementation is open source and available under the MIT License.

---

**Happy coding! 🚀 Your users will love the instant, responsive notification experience!**
