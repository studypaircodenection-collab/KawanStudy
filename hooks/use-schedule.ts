"use client";

import { useState, useEffect } from "react";
import {
  ScheduleEntry,
  ScheduleFilters,
  ScheduleSettings,
} from "@/types/schedule";

const STORAGE_KEYS = {
  SCHEDULE_ENTRIES: "kawanstudy_schedule_entries",
  SCHEDULE_SETTINGS: "kawanstudy_schedule_settings",
};

export function useSchedule() {
  const [entries, setEntries] = useState<ScheduleEntry[]>([]);
  const [settings, setSettings] = useState<ScheduleSettings>({
    timeFormat: "12h",
    startHour: 7,
    endHour: 22,
    showWeekends: true,
    colorScheme: "default",
  });
  const [filters, setFilters] = useState<ScheduleFilters>({});
  const [isLoading, setIsLoading] = useState(true);

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const savedEntries = localStorage.getItem(STORAGE_KEYS.SCHEDULE_ENTRIES);
      const savedSettings = localStorage.getItem(
        STORAGE_KEYS.SCHEDULE_SETTINGS
      );

      if (savedEntries) {
        setEntries(JSON.parse(savedEntries));
      }

      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error("Failed to load schedule data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save entries to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(
        STORAGE_KEYS.SCHEDULE_ENTRIES,
        JSON.stringify(entries)
      );
    }
  }, [entries, isLoading]);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(
        STORAGE_KEYS.SCHEDULE_SETTINGS,
        JSON.stringify(settings)
      );
    }
  }, [settings, isLoading]);

  const addEntry = (entry: Omit<ScheduleEntry, "id">) => {
    const newEntry: ScheduleEntry = {
      ...entry,
      id: crypto.randomUUID(),
    };
    setEntries((prev) => [...prev, newEntry]);
    return newEntry;
  };

  const updateEntry = (id: string, updates: Partial<ScheduleEntry>) => {
    setEntries((prev) =>
      prev.map((entry) => (entry.id === id ? { ...entry, ...updates } : entry))
    );
  };

  const deleteEntry = (id: string) => {
    setEntries((prev) => prev.filter((entry) => entry.id !== id));
  };

  const duplicateEntry = (id: string) => {
    const entry = entries.find((e) => e.id === id);
    if (entry) {
      const { id: _, ...entryWithoutId } = entry;
      return addEntry({
        ...entryWithoutId,
        subject: `${entry.subject} (Copy)`,
      });
    }
  };

  const clearAllEntries = () => {
    setEntries([]);
  };

  const getFilteredEntries = (): ScheduleEntry[] => {
    return entries.filter((entry) => {
      if (filters.day && entry.day !== filters.day) return false;
      if (filters.type && entry.type !== filters.type) return false;
      if (
        filters.subject &&
        !entry.subject.toLowerCase().includes(filters.subject.toLowerCase())
      )
        return false;
      return true;
    });
  };

  const getEntriesForDay = (day: string): ScheduleEntry[] => {
    return entries
      .filter((entry) => entry.day === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  const hasTimeConflict = (
    newEntry: Omit<ScheduleEntry, "id">,
    excludeId?: string
  ): boolean => {
    const conflictingEntries = entries.filter((entry) => {
      if (excludeId && entry.id === excludeId) return false;
      if (entry.day !== newEntry.day) return false;

      const entryStart = entry.startTime;
      const entryEnd = entry.endTime;
      const newStart = newEntry.startTime;
      const newEnd = newEntry.endTime;

      // Check for time overlap
      return newStart < entryEnd && newEnd > entryStart;
    });

    return conflictingEntries.length > 0;
  };

  const exportToJSON = (): string => {
    return JSON.stringify({ entries, settings }, null, 2);
  };

  const importFromJSON = (jsonData: string): boolean => {
    try {
      const data = JSON.parse(jsonData);
      if (data.entries && Array.isArray(data.entries)) {
        setEntries(data.entries);
      }
      if (data.settings) {
        setSettings(data.settings);
      }
      return true;
    } catch (error) {
      console.error("Failed to import schedule data:", error);
      return false;
    }
  };

  const getScheduleStats = () => {
    const totalEntries = entries.length;
    const totalHours = entries.reduce((sum, entry) => {
      const start = new Date(`2000-01-01T${entry.startTime}`);
      const end = new Date(`2000-01-01T${entry.endTime}`);
      return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    }, 0);

    const entriesByType = entries.reduce((acc, entry) => {
      acc[entry.type] = (acc[entry.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const busyDays = entries.reduce((acc, entry) => {
      acc[entry.day] = (acc[entry.day] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalEntries,
      totalHours: Math.round(totalHours * 100) / 100,
      entriesByType,
      busyDays,
      averagePerDay: Math.round((totalEntries / 7) * 100) / 100,
    };
  };

  return {
    entries: getFilteredEntries(),
    allEntries: entries,
    settings,
    filters,
    isLoading,
    setSettings,
    setFilters,
    addEntry,
    updateEntry,
    deleteEntry,
    duplicateEntry,
    clearAllEntries,
    getEntriesForDay,
    hasTimeConflict,
    exportToJSON,
    importFromJSON,
    getScheduleStats,
  };
}
