# Notification System Documentation

## Overview

The KawanStudy notification system provides a comprehensive notification management solution with real-time updates, multiple notification types, filtering capabilities, and advanced user preferences.

## Features

### 🔔 Core Functionality

- **Real-time Notifications**: Instant notification delivery with visual indicators
- **Multiple Types**: Support for 7 different notification types with custom styling
- **Read/Unread States**: Track notification status with visual indicators
- **Bulk Operations**: Select multiple notifications for batch actions
- **Persistence**: Auto-save to localStorage with data integrity

### 📱 User Interface

- **Notification Popup**: Quick access dropdown with filter tabs
- **Full Notifications Page**: Comprehensive notification management
- **Settings Page**: Complete preference customization
- **Responsive Design**: Optimized for mobile and desktop

### ⚙️ Advanced Features

- **Quiet Hours**: Scheduled notification suppression
- **Priority Levels**: High, medium, low priority notifications
- **Time-based Filtering**: Filter by today, week, month
- **Search Functionality**: Full-text search across titles and messages
- **Export/Import**: JSON-based data portability

## Components

### 1. Notification Types (`types/notification.ts`)

```typescript
interface Notification {
  id: string;
  type: keyof typeof NOTIFICATION_TYPES;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  priority: "low" | "medium" | "high";
  link?: string;
  metadata?: NotificationMetadata;
}

interface NotificationSettings {
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
```

**Supported Notification Types:**

- 📩 `message` - Direct messages and communications
- 📚 `study_session` - Study session reminders and updates
- 📅 `exam_reminder` - Exam schedules and deadlines
- 👥 `group_invite` - Study group invitations
- 🏆 `achievement` - Study milestones and badges
- ⚙️ `system` - System updates and maintenance
- 📋 `schedule_update` - Schedule changes and conflicts

### 2. Notification Hook (`hooks/use-notifications.ts`)

The `useNotifications` hook provides comprehensive state management:

```typescript
const {
  notifications, // All notifications array
  unreadCount, // Number of unread notifications
  settings, // User notification preferences
  isLoading, // Loading state
  markAsRead, // Mark single notification as read
  markAllAsRead, // Mark all notifications as read
  deleteNotification, // Delete single notification
  clearAllNotifications, // Delete all notifications
  updateSettings, // Update notification preferences
  simulateNewNotification, // Generate test notification
} = useNotifications();
```

**Key Features:**

- **Automatic Persistence**: Saves to localStorage on every change
- **Mock Data Generation**: Creates sample notifications for development
- **Real-time Simulation**: Generates new notifications periodically
- **Settings Management**: Handles user preferences with validation

### 3. Notification Popup (`components/dashboard/notification-popup.tsx`)

A dropdown component for quick notification access:

**Features:**

- **Unread Badge**: Shows count of unread notifications
- **Filter Tabs**: Switch between "All" and "Unread" views
- **Quick Actions**: Mark as read, delete, settings access
- **Responsive Design**: Adapts to screen size with mobile optimization
- **Rich Metadata**: Shows priority, timestamps, and categories

**Usage:**

```tsx
import NotificationPopup from "@/components/dashboard/notification-popup";

<NotificationPopup />;
```

### 4. Notifications Page (`app/(protected-routes)/notifications/page.tsx`)

Full-featured notification management interface:

**Features:**

- **Advanced Filtering**: Search, type, status, and date filters
- **Bulk Operations**: Select and perform actions on multiple notifications
- **Grouped Display**: Organize notifications by date (Today, Yesterday, etc.)
- **Detailed Metadata**: Show all notification information
- **Statistics Overview**: Display counts and metrics

### 5. Settings Page (`app/(protected-routes)/dashboard/settings/notifications/page.tsx`)

Comprehensive notification preferences management:

**Features:**

- **Notification Preferences**: Enable/disable specific notification types
- **Quiet Hours**: Set times to suppress notifications
- **Sound Settings**: Control notification audio
- **Statistics**: View notification activity by type
- **Data Management**: Clear all notifications, test functionality

## Usage Examples

### Basic Implementation

```tsx
// Add to your layout or dashboard
import NotificationPopup from "@/components/dashboard/notification-popup";

function Layout({ children }) {
  return (
    <div>
      <header>
        <nav>
          {/* Other nav items */}
          <NotificationPopup />
        </nav>
      </header>
      {children}
    </div>
  );
}
```

### Creating Custom Notifications

```tsx
import { useNotifications } from "@/hooks/use-notifications";

function StudyReminder() {
  const { addNotification } = useNotifications();

  const createStudyReminder = () => {
    addNotification({
      type: "study_session",
      title: "Study Session Starting Soon",
      message: "Your calculus study session begins in 15 minutes",
      priority: "high",
      metadata: {
        course: "Calculus I",
        category: "reminder",
      },
    });
  };

  return <button onClick={createStudyReminder}>Set Study Reminder</button>;
}
```

### Advanced Filtering

```tsx
import { useNotifications } from "@/hooks/use-notifications";

function CustomNotificationView() {
  const { notifications } = useNotifications();

  // Filter high-priority unread notifications
  const urgentNotifications = notifications.filter(
    (n) => !n.isRead && n.priority === "high"
  );

  // Filter by type
  const examReminders = notifications.filter((n) => n.type === "exam_reminder");

  return (
    <div>
      {urgentNotifications.map((notification) => (
        <div key={notification.id}>{notification.title}</div>
      ))}
    </div>
  );
}
```

## Installation & Setup

### 1. Install Dependencies

```bash
npm install date-fns sonner
```

### 2. Add Required UI Components

Ensure these shadcn/ui components are installed:

- `button`
- `badge`
- `card`
- `dropdown-menu`
- `input`
- `label`
- `select`
- `switch`
- `separator`
- `scroll-area`
- `tooltip`

### 3. Copy Component Files

Copy these files to your project:

- `types/notification.ts`
- `hooks/use-notifications.ts`
- `components/dashboard/notification-popup.tsx`
- `app/(protected-routes)/notifications/page.tsx`
- `app/(protected-routes)/dashboard/settings/notifications/page.tsx`

### 4. Configure Routes

Add these routes to your application:

- `/notifications` - Full notifications page
- `/dashboard/settings/notifications` - Settings page

## Customization

### Styling Notification Types

Modify `NOTIFICATION_TYPES` in `types/notification.ts`:

```typescript
export const NOTIFICATION_TYPES = {
  custom_type: {
    label: "Custom Notifications",
    color: "#FF6B6B",
    icon: "🔥",
  },
};
```

### Adding New Notification Fields

Extend the `NotificationMetadata` interface:

```typescript
interface NotificationMetadata {
  course?: string;
  category?: string;
  sender?: string; // New field
  attachments?: string[]; // New field
  actionRequired?: boolean; // New field
}
```

### Custom Notification Templates

Create notification templates for consistency:

```typescript
const createExamReminder = (examName: string, date: string) => ({
  type: "exam_reminder" as const,
  title: `Exam Reminder: ${examName}`,
  message: `Your ${examName} exam is scheduled for ${date}`,
  priority: "high" as const,
  metadata: {
    category: "exam",
    course: examName,
  },
});
```

## Performance Considerations

### Memory Management

- Notifications are persisted in localStorage
- Consider implementing cleanup for old notifications
- Limit the number of stored notifications (e.g., 1000 max)

### Real-time Updates

- Current implementation uses mock data and localStorage
- For production, integrate with WebSocket or Server-Sent Events
- Consider notification queuing for high-frequency updates

### Mobile Optimization

- Components are responsive by default
- Touch-friendly interaction areas
- Optimized for small screens

## Future Enhancements

### Planned Features

1. **WebSocket Integration**: Real-time notifications from server
2. **Push Notifications**: Browser push notification API
3. **Email Notifications**: Server-side email delivery
4. **Notification Templates**: Pre-built notification formats
5. **Analytics Dashboard**: Notification engagement metrics
6. **Advanced Filtering**: Custom filter creation and saving
7. **Notification Scheduling**: Delay and schedule notifications
8. **Rich Media**: Support for images and attachments

### Integration Ideas

- **Calendar Integration**: Sync with study schedule
- **Collaboration Tools**: Team and group notifications
- **Academic Systems**: Integration with LMS platforms
- **Mobile App**: React Native companion
- **Browser Extension**: Cross-platform notifications

## Troubleshooting

### Common Issues

**Notifications Not Persisting**

- Check localStorage availability
- Verify JSON serialization/deserialization
- Check for storage quota limits

**TypeScript Errors**

- Ensure all notification types are properly typed
- Check interface implementations
- Verify generic type constraints

**Performance Issues**

- Implement virtual scrolling for large notification lists
- Consider pagination for notification history
- Optimize re-renders with React.memo

**Mobile Display Issues**

- Test on various screen sizes
- Verify touch interactions
- Check responsive breakpoints

## API Reference

### Notification Hook Methods

| Method                    | Parameters                         | Description                    |
| ------------------------- | ---------------------------------- | ------------------------------ |
| `markAsRead`              | `(id: string)`                     | Mark notification as read      |
| `markAllAsRead`           | `()`                               | Mark all notifications as read |
| `deleteNotification`      | `(id: string)`                     | Delete single notification     |
| `clearAllNotifications`   | `()`                               | Delete all notifications       |
| `updateSettings`          | `(settings: NotificationSettings)` | Update user preferences        |
| `simulateNewNotification` | `()`                               | Create test notification       |

### Notification Properties

| Property    | Type                          | Description           |
| ----------- | ----------------------------- | --------------------- |
| `id`        | `string`                      | Unique identifier     |
| `type`      | `NotificationType`            | Notification category |
| `title`     | `string`                      | Notification headline |
| `message`   | `string`                      | Notification content  |
| `timestamp` | `string`                      | ISO date string       |
| `isRead`    | `boolean`                     | Read status           |
| `priority`  | `'low' \| 'medium' \| 'high'` | Importance level      |
| `link`      | `string?`                     | Optional action URL   |
| `metadata`  | `NotificationMetadata?`       | Additional data       |

---

## Contributing

When contributing to the notification system:

1. **Follow TypeScript Conventions**: Strict typing for all interfaces
2. **Test Responsiveness**: Verify mobile and desktop layouts
3. **Update Documentation**: Keep this README current
4. **Performance Testing**: Check with large notification datasets
5. **Accessibility**: Ensure ARIA labels and keyboard navigation

For questions or contributions, please refer to the main project documentation.
