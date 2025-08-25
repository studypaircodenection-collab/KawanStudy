export interface ScheduleEntry {
  id: string;
  subject: string;
  description?: string;
  day: string;
  startTime: string;
  endTime: string;
  location?: string;
  instructor?: string;
  color?: string;
  type: "class" | "study" | "exam" | "meeting" | "other";
  credits?: number;
  isRecurring: boolean;
  recurringPattern?: "weekly" | "biweekly" | "monthly";
  endDate?: string;
}

export interface ScheduleFilters {
  day?: string;
  type?: string;
  subject?: string;
}

export interface TimeSlot {
  hour: number;
  minute: number;
}

export interface ScheduleSettings {
  timeFormat: "12h" | "24h";
  startHour: number;
  endHour: number;
  showWeekends: boolean;
  colorScheme: "default" | "pastel" | "vibrant" | "monochrome";
}

export const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export const SCHEDULE_TYPES = [
  { value: "class", label: "Class", color: "#3B82F6" },
  { value: "study", label: "Study Session", color: "#10B981" },
  { value: "exam", label: "Exam", color: "#EF4444" },
  { value: "meeting", label: "Meeting", color: "#8B5CF6" },
  { value: "other", label: "Other", color: "#6B7280" },
] as const;

export const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => {
  const hour = i;
  return {
    value: `${hour.toString().padStart(2, "0")}:00`,
    label:
      hour === 0
        ? "12:00 AM"
        : hour === 12
        ? "12:00 PM"
        : hour < 12
        ? `${hour}:00 AM`
        : `${hour - 12}:00 PM`,
  };
});

export const COLOR_SCHEMES = {
  default: [
    "#3B82F6",
    "#10B981",
    "#EF4444",
    "#8B5CF6",
    "#F59E0B",
    "#06B6D4",
    "#84CC16",
  ],
  pastel: [
    "#DBEAFE",
    "#D1FAE5",
    "#FEE2E2",
    "#EDE9FE",
    "#FEF3C7",
    "#CFFAFE",
    "#ECFCCB",
  ],
  vibrant: [
    "#1D4ED8",
    "#059669",
    "#DC2626",
    "#7C3AED",
    "#D97706",
    "#0891B2",
    "#65A30D",
  ],
  monochrome: [
    "#111827",
    "#374151",
    "#6B7280",
    "#9CA3AF",
    "#D1D5DB",
    "#E5E7EB",
    "#F9FAFB",
  ],
};
