"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScheduleEntry, DAYS_OF_WEEK } from "@/types/schedule";
import { Clock, MapPin, BookOpen } from "lucide-react";

interface ScheduleGridProps {
  entries: ScheduleEntry[];
  settings: {
    timeFormat: "12h" | "24h";
    startHour: number;
    endHour: number;
    showWeekends: boolean;
  };
}

export function ScheduleGrid({ entries, settings }: ScheduleGridProps) {
  const { timeFormat, startHour, endHour, showWeekends } = settings;

  const displayDays = showWeekends ? DAYS_OF_WEEK : DAYS_OF_WEEK.slice(0, 5);

  const timeSlots = Array.from(
    { length: endHour - startHour + 1 },
    (_, i) => startHour + i
  );

  const formatTime = (hour: number) => {
    if (timeFormat === "12h") {
      if (hour === 0) return "12 AM";
      if (hour === 12) return "12 PM";
      if (hour < 12) return `${hour} AM`;
      return `${hour - 12} PM`;
    }
    return `${hour.toString().padStart(2, "0")}:00`;
  };

  const getEntriesForTimeSlot = (day: string, hour: number) => {
    return entries.filter((entry) => {
      if (entry.day !== day) return false;

      const [startHour, startMinute] = entry.startTime.split(":").map(Number);
      const [endHour, endMinute] = entry.endTime.split(":").map(Number);

      const entryStart = startHour + startMinute / 60;
      const entryEnd = endHour + endMinute / 60;

      return hour >= entryStart && hour < entryEnd;
    });
  };

  const getEntryHeight = (entry: ScheduleEntry) => {
    const [startHour, startMinute] = entry.startTime.split(":").map(Number);
    const [endHour, endMinute] = entry.endTime.split(":").map(Number);

    const duration = endHour + endMinute / 60 - (startHour + startMinute / 60);
    return Math.max(duration * 60, 40); // Minimum 40px height
  };

  const getEntryPosition = (entry: ScheduleEntry) => {
    const [startHour, startMinute] = entry.startTime.split(":").map(Number);
    const position = (startHour - startHour + startMinute / 60) * 60;
    return Math.max(position, 0);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Weekly Schedule Grid
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="grid grid-cols-1 lg:grid-cols-8 gap-4 min-w-[800px]">
            {/* Time column */}
            <div className="space-y-1">
              <div className="h-12 flex items-center justify-center font-medium text-sm">
                Time
              </div>
              {timeSlots.map((hour) => (
                <div
                  key={hour}
                  className="h-16 flex items-start justify-end pr-2 text-sm text-gray-500 border-r"
                >
                  {formatTime(hour)}
                </div>
              ))}
            </div>

            {/* Day columns */}
            {displayDays.map((day) => (
              <div key={day} className="space-y-1">
                <div className="h-12 flex items-center justify-center font-medium text-sm bg-gray-50 rounded-md">
                  {day}
                </div>
                <div className="relative space-y-1">
                  {timeSlots.map((hour) => {
                    const slotEntries = getEntriesForTimeSlot(day, hour);

                    return (
                      <div
                        key={`${day}-${hour}`}
                        className="h-16 border border-gray-100 rounded-sm relative bg-gray-25"
                      >
                        {slotEntries.map((entry) => (
                          <div
                            key={entry.id}
                            className="absolute inset-x-1 rounded-sm p-1 text-xs shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                            style={{
                              backgroundColor: entry.color || "#3B82F6",
                              height: `${Math.min(
                                getEntryHeight(entry),
                                60
                              )}px`,
                              top: `${getEntryPosition(entry)}px`,
                            }}
                            title={`${entry.subject} - ${entry.startTime} to ${entry.endTime}`}
                          >
                            <div className="text-white font-medium truncate">
                              {entry.subject}
                            </div>
                            <div className="text-white/80 text-xs flex items-center gap-1">
                              <Clock className="h-2 w-2" />
                              {entry.startTime.slice(0, 5)}
                            </div>
                            {entry.location && (
                              <div className="text-white/80 text-xs flex items-center gap-1 truncate">
                                <MapPin className="h-2 w-2" />
                                {entry.location}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t">
          <h4 className="text-sm font-medium mb-2">Color Legend</h4>
          <div className="flex flex-wrap gap-2">
            {Array.from(new Set(entries.map((e) => e.type))).map((type) => {
              const entry = entries.find((e) => e.type === type);
              const color = entry?.color || "#3B82F6";

              return (
                <Badge
                  key={type}
                  variant="outline"
                  className="capitalize"
                  style={{ borderColor: color, color: color }}
                >
                  <div
                    className="w-2 h-2 rounded-full mr-1"
                    style={{ backgroundColor: color }}
                  />
                  {type}
                </Badge>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
