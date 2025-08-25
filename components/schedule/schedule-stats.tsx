"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3, Calendar, Clock, TrendingUp, Download } from "lucide-react";
import { SCHEDULE_TYPES } from "@/types/schedule";

interface ScheduleStatsProps {
  stats: {
    totalEntries: number;
    totalHours: number;
    entriesByType: Record<string, number>;
    busyDays: Record<string, number>;
    averagePerDay: number;
  };
  onExport: () => void;
}

export function ScheduleStats({ stats, onExport }: ScheduleStatsProps) {
  const { totalEntries, totalHours, entriesByType, busyDays, averagePerDay } =
    stats;

  const getTypeInfo = (type: string) => {
    return (
      SCHEDULE_TYPES.find((t) => t.value === type) || {
        value: type,
        label: type,
        color: "#6B7280",
      }
    );
  };

  const getBusiestDay = () => {
    const entries = Object.entries(busyDays);
    if (entries.length === 0) return null;

    return entries.reduce((max, current) =>
      current[1] > max[1] ? current : max
    );
  };

  const busiestDay = getBusiestDay();

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3     gap-4">
        {/* Total Entries */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEntries}</div>
            <p className="text-xs text-muted-foreground">
              {averagePerDay.toFixed(1)} per day average
            </p>
          </CardContent>
        </Card>

        {/* Total Hours */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHours}h</div>
            <p className="text-xs text-muted-foreground">Per week scheduled</p>
          </CardContent>
        </Card>

        {/* Busiest Day */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Busiest Day</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {busiestDay ? busiestDay[0] : "None"}
            </div>
            <p className="text-xs text-muted-foreground">
              {busiestDay ? `${busiestDay[1]} entries` : "No entries yet"}
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {" "}
        {/* Entries by Type */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Entries by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(entriesByType).map(([type, count]) => {
                const typeInfo = getTypeInfo(type);
                const percentage =
                  totalEntries > 0 ? (count / totalEntries) * 100 : 0;

                return (
                  <div key={type} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: typeInfo.color }}
                        />
                        <span className="text-sm font-medium capitalize">
                          {typeInfo.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {count} ({percentage.toFixed(0)}%)
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-300"
                        style={{
                          backgroundColor: typeInfo.color,
                          width: `${percentage}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}

              {Object.keys(entriesByType).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No entries to display
                </p>
              )}
            </div>
          </CardContent>
        </Card>
        {/* Daily Distribution */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Daily Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday",
              ].map((day) => {
                const count = busyDays[day] || 0;
                const maxCount = Math.max(...Object.values(busyDays), 1);
                const percentage = (count / maxCount) * 100;

                return (
                  <div key={day} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{day}</span>
                      <Badge variant="secondary" className="text-xs">
                        {count} {count === 1 ? "entry" : "entries"}
                      </Badge>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
