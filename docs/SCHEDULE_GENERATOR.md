# 📅 Kawanstudy Schedule Generator

A comprehensive, fully customizable schedule generator built with Next.js, TypeScript, and Tailwind CSS. This application allows students to create, manage, and visualize their academic schedules with advanced features like time conflict detection, data export/import, and detailed analytics.

## ✨ Features

### 🎯 Core Functionality

- **Add Schedule Entries**: Create detailed schedule entries with subjects, times, locations, instructors, and more
- **Time Conflict Detection**: Automatic detection and prevention of scheduling conflicts
- **Multiple View Types**: Table view, grid view, and statistical dashboard
- **Advanced Filtering**: Search and filter by day, type, subject, and more
- **Data Persistence**: Local storage with automatic save/load functionality

### 📊 Advanced Features

- **Export/Import**: JSON export and import for data backup and sharing
- **Statistics Dashboard**: Comprehensive analytics with charts and insights
- **Color Coding**: Customizable color schemes for different activity types
- **Recurring Events**: Support for weekly, bi-weekly, and monthly recurring entries
- **Responsive Design**: Fully responsive across all device sizes

### 🎨 Customization Options

- **Custom Colors**: Individual color selection for each entry type
- **Time Formats**: 12-hour or 24-hour time format support
- **Flexible Schedule**: Configurable start/end hours and weekend display
- **Entry Types**: Classes, study sessions, exams, meetings, and custom types

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn package manager

### Installation

```bash
# Clone the repository
git clone <your-repo-url>

# Navigate to project directory
cd studypair

# Install dependencies
npm install

# Start development server
npm run dev
```

### Access the Schedule Generator

1. Navigate to `http://localhost:3001`
2. Go to the protected dashboard route
3. Access "Schedule Generator" from the navigation

## 🏗️ Architecture

### File Structure

```
components/
├── schedule/
│   ├── schedule-form.tsx      # Entry creation/editing form
│   ├── schedule-table.tsx     # Table view with sorting/filtering
│   ├── schedule-grid.tsx      # Weekly grid visualization
│   └── schedule-stats.tsx     # Statistics and analytics
├── ui/                        # Reusable UI components
└── ...

hooks/
├── use-schedule.ts           # Main schedule management hook

types/
├── schedule.ts              # TypeScript type definitions

app/
├── (protected-routes)/
│   └── dashboard/
│       └── (additional-mini-apps)/
│           └── schedule-generator/
│               └── page.tsx  # Main schedule generator page
```

### Key Components

#### 1. **ScheduleForm Component**

- **Purpose**: Create and edit schedule entries
- **Features**:
  - Form validation with error handling
  - Time conflict detection
  - Advanced options (recurring events, credits, colors)
  - Responsive modal dialog
- **Props**: `open`, `onOpenChange`, `onSubmit`, `initialData`, `hasTimeConflict`

#### 2. **ScheduleTable Component**

- **Purpose**: Display entries in a sortable, filterable table
- **Features**:
  - Multi-column sorting
  - Advanced filtering (day, type, subject search)
  - Bulk actions (export, import, clear all)
  - Context menus for individual entries
- **Props**: `entries`, `onEdit`, `onDelete`, `onDuplicate`, `filters`, `onFiltersChange`

#### 3. **ScheduleGrid Component**

- **Purpose**: Visual weekly calendar grid
- **Features**:
  - Time-based layout with configurable hours
  - Color-coded entries with hover details
  - Weekend toggle support
  - Responsive grid layout
- **Props**: `entries`, `settings`

#### 4. **ScheduleStats Component**

- **Purpose**: Analytics and insights dashboard
- **Features**:
  - Total entries and hours tracking
  - Distribution charts by type and day
  - Busiest day identification
  - Progress bars and visual indicators
- **Props**: `stats`, `onExport`

### Custom Hook: `useSchedule`

The `useSchedule` hook provides centralized state management for all schedule operations:

```typescript
const {
  entries, // Filtered entries based on current filters
  allEntries, // All entries (unfiltered)
  settings, // User preferences and display settings
  filters, // Current filter state
  addEntry, // Add new schedule entry
  updateEntry, // Update existing entry
  deleteEntry, // Delete entry by ID
  duplicateEntry, // Create copy of existing entry
  hasTimeConflict, // Check for scheduling conflicts
  exportToJSON, // Export data as JSON
  importFromJSON, // Import data from JSON
  getScheduleStats, // Get analytics and statistics
} = useSchedule();
```

## 📋 Data Structure

### ScheduleEntry Interface

```typescript
interface ScheduleEntry {
  id: string; // Unique identifier
  subject: string; // Course/activity name
  description?: string; // Optional detailed description
  day: string; // Day of week
  startTime: string; // Start time (HH:MM format)
  endTime: string; // End time (HH:MM format)
  location?: string; // Physical location
  instructor?: string; // Teacher/contact person
  color?: string; // Custom color (hex)
  type: "class" | "study" | "exam" | "meeting" | "other";
  credits?: number; // Credit hours or weight
  isRecurring: boolean; // Whether entry repeats
  recurringPattern?: "weekly" | "biweekly" | "monthly";
  endDate?: string; // End date for recurring events
}
```

### Schedule Settings

```typescript
interface ScheduleSettings {
  timeFormat: "12h" | "24h"; // Time display format
  startHour: number; // Grid start hour (0-23)
  endHour: number; // Grid end hour (0-23)
  showWeekends: boolean; // Include Saturday/Sunday
  colorScheme: "default" | "pastel" | "vibrant" | "monochrome";
}
```

## 🎯 Usage Examples

### Basic Entry Creation

```typescript
// Add a simple class entry
const newEntry = {
  subject: "Advanced Mathematics",
  day: "Monday",
  startTime: "09:00",
  endTime: "10:30",
  type: "class",
  location: "Room 201",
  instructor: "Dr. Smith",
};

addEntry(newEntry);
```

### Advanced Recurring Entry

```typescript
// Add a recurring study session
const studySession = {
  subject: "Group Study - Physics",
  description: "Weekly physics problem-solving session",
  day: "Wednesday",
  startTime: "14:00",
  endTime: "16:00",
  type: "study",
  location: "Library Study Room 3",
  isRecurring: true,
  recurringPattern: "weekly",
  endDate: "2024-12-15",
  color: "#10B981",
};

addEntry(studySession);
```

### Filtering and Search

```typescript
// Filter by specific day and type
setFilters({
  day: "Monday",
  type: "class",
  subject: "math", // Text search in subject names
});
```

### Data Export/Import

```typescript
// Export current schedule
const jsonData = exportToJSON();
// Save to file or share with others

// Import from JSON file
const importSuccess = importFromJSON(jsonString);
if (importSuccess) {
  console.log("Schedule imported successfully!");
}
```

## 🛠️ Customization

### Adding New Entry Types

1. Update the `SCHEDULE_TYPES` constant in `types/schedule.ts`:

```typescript
export const SCHEDULE_TYPES = [
  // ... existing types
  { value: "workshop", label: "Workshop", color: "#F59E0B" },
] as const;
```

2. Update the TypeScript type definition:

```typescript
type: "class" | "study" | "exam" | "meeting" | "workshop" | "other";
```

### Custom Color Schemes

Add new color schemes in `types/schedule.ts`:

```typescript
export const COLOR_SCHEMES = {
  // ... existing schemes
  custom: ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FECA57"],
};
```

### Time Slot Customization

Modify the `TIME_SLOTS` generation in `types/schedule.ts` for different time intervals:

```typescript
// For 30-minute intervals
export const TIME_SLOTS = Array.from({ length: 48 }, (_, i) => {
  const totalMinutes = i * 30;
  const hour = Math.floor(totalMinutes / 60);
  const minute = totalMinutes % 60;
  return {
    value: `${hour.toString().padStart(2, "0")}:${minute
      .toString()
      .padStart(2, "0")}`,
    label: formatTimeLabel(hour, minute),
  };
});
```

## 📱 Responsive Design

The schedule generator is fully responsive with optimized layouts for:

- **Desktop (1024px+)**: Full feature set with side-by-side layouts
- **Tablet (768px-1023px)**: Adapted grid layouts and collapsible sidebars
- **Mobile (< 768px)**: Stacked layouts with touch-optimized controls

### Mobile-Specific Features

- Swipe gestures for navigation
- Touch-friendly button sizes
- Collapsible filter panels
- Simplified table views with essential information

## 🔧 Advanced Configuration

### Local Storage Schema

Data is stored in localStorage with the following keys:

- `kawanstudy_schedule_entries`: Array of schedule entries
- `kawanstudy_schedule_settings`: User preferences and settings

### Performance Optimizations

- **Memoized Calculations**: Statistics and filtered data are computed efficiently
- **Lazy Loading**: Components load only when needed
- **Debounced Search**: Search inputs use debouncing to reduce re-renders
- **Virtual Scrolling**: Large datasets are handled with virtual scrolling (if needed)

## 🚀 Future Enhancements

### Planned Features

- **Calendar Integration**: Sync with Google Calendar, Outlook
- **Notification System**: Reminders and alerts for upcoming events
- **Collaboration**: Share schedules with study partners
- **Template System**: Save and reuse common schedule patterns
- **Mobile App**: Native mobile application
- **AI Suggestions**: Intelligent scheduling recommendations

### API Integration Possibilities

- **University Systems**: Direct integration with course registration systems
- **Study Group Matching**: Connect with students having similar schedules
- **Room Booking**: Automatic room reservation for study sessions
- **Grade Tracking**: Link schedule with academic performance data

## 🧪 Testing

### Manual Testing Checklist

- [ ] Create new schedule entry
- [ ] Edit existing entry
- [ ] Delete entry with confirmation
- [ ] Duplicate entry functionality
- [ ] Time conflict detection
- [ ] Filter by day, type, and subject
- [ ] Sort table columns
- [ ] Export schedule data
- [ ] Import schedule data
- [ ] Switch between table and grid views
- [ ] View statistics dashboard
- [ ] Responsive design on different screen sizes

### Automated Testing (Future)

```bash
# Unit tests
npm run test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e
```

## 📄 License

This project is part of the Kawanstudy platform and follows the same licensing terms.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use meaningful component and variable names
- Add proper error handling and validation
- Ensure responsive design compatibility
- Include comprehensive prop documentation

## 🐛 Troubleshooting

### Common Issues

**Q: Time conflicts not being detected properly**
A: Check that time formats are consistent (HH:MM) and verify the `hasTimeConflict` function logic

**Q: Data not persisting after page refresh**
A: Ensure localStorage is available and not blocked by browser settings

**Q: Grid view not displaying correctly**
A: Verify that the time ranges are properly configured in settings

**Q: Export/Import not working**
A: Check JSON format validity and ensure proper error handling

### Debug Mode

Enable debug logging by adding to localStorage:

```javascript
localStorage.setItem("kawanstudy_debug", "true");
```

---

🎓 **Happy Scheduling with Kawanstudy!** 📚
