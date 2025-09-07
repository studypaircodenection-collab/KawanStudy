"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  MoreHorizontal,
  Edit2,
  Trash2,
  Copy,
  Clock,
  MapPin,
  User,
  Search,
  Calendar,
  Download,
  Upload,
} from "lucide-react";
import { ScheduleEntry, DAYS_OF_WEEK, SCHEDULE_TYPES } from "@/types/schedule";

interface ScheduleTableProps {
  entries: ScheduleEntry[];
  onEdit: (entry: ScheduleEntry) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  filters: {
    day?: string;
    type?: string;
    subject?: string;
  };
  onFiltersChange: (filters: any) => void;
  onExport: () => void;
  onImport: (file: File) => void;
}

export function ScheduleTable({
  entries,
  onEdit,
  onDelete,
  onDuplicate,
  filters,
  onFiltersChange,
  onExport,
  onImport,
}: ScheduleTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<keyof ScheduleEntry>("day");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const sortedEntries = [...entries].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];

    // Special handling for day sorting
    if (sortField === "day") {
      const dayOrder = DAYS_OF_WEEK;
      aValue = dayOrder.indexOf(a.day as any);
      bValue = dayOrder.indexOf(b.day as any);
    }

    // Special handling for time sorting
    if (sortField === "startTime") {
      aValue = a.startTime;
      bValue = b.startTime;
    }

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    }

    return 0;
  });

  const handleSort = (field: keyof ScheduleEntry) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    const date = new Date();
    date.setHours(hours, minutes);
    return date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getDuration = (startTime: string, endTime: string) => {
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    const duration = (end.getTime() - start.getTime()) / (1000 * 60); // minutes
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;

    if (hours === 0) return `${minutes}m`;
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}m`;
  };

  const getTypeInfo = (type: string) => {
    return SCHEDULE_TYPES.find((t) => t.value === type) || SCHEDULE_TYPES[0];
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImport(file);
      event.target.value = "";
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Schedule Overview
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={onExport}>
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
              <div className="relative">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  id="import-file"
                />
                <Button variant="outline" size="sm" asChild>
                  <label htmlFor="import-file" className="cursor-pointer">
                    <Upload className="h-4 w-4 mr-1" />
                    Import
                  </label>
                </Button>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-1 block">
                Search Subject
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search subjects..."
                  value={filters.subject || ""}
                  onChange={(e) =>
                    onFiltersChange({ ...filters, subject: e.target.value })
                  }
                  className="pl-10"
                />
              </div>
            </div>

            <div className="min-w-[120px]">
              <label className="text-sm font-medium mb-1 block">Day</label>
              <Select
                value={filters.day || "all"}
                onValueChange={(value) =>
                  onFiltersChange({
                    ...filters,
                    day: value === "all" ? undefined : value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Days</SelectItem>
                  {DAYS_OF_WEEK.map((day) => (
                    <SelectItem key={day} value={day}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="min-w-[120px]">
              <label className="text-sm font-medium mb-1 block">Type</label>
              <Select
                value={filters.type || "all"}
                onValueChange={(value) =>
                  onFiltersChange({
                    ...filters,
                    type: value === "all" ? undefined : value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {SCHEDULE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: type.color }}
                        />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="outline"
              onClick={() => onFiltersChange({})}
              size="sm"
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      {entries.length > 0 && (
        <div className="text-sm text-gray-600">
          Showing {sortedEntries.length} of {entries.length} entries
        </div>
      )}

      {/* Table */}

      <ScrollArea className="border rounded-xl shadow-md h-[300px]">
        <Table className="">
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => handleSort("subject")}
              >
                Subject{" "}
                {sortField === "subject" &&
                  (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => handleSort("day")}
              >
                Day{" "}
                {sortField === "day" && (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => handleSort("startTime")}
              >
                Time{" "}
                {sortField === "startTime" &&
                  (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Details</TableHead>
              <TableHead className="w-[70px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedEntries.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-gray-500"
                >
                  No schedule entries found. Add your first entry to get
                  started!
                </TableCell>
              </TableRow>
            ) : (
              sortedEntries.map((entry) => {
                const typeInfo = getTypeInfo(entry.type);
                return (
                  <TableRow
                    key={entry.id}
                    className="hover:bg-muted-foreground"
                  >
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{entry.subject}</div>
                        {entry.description && (
                          <div className="text-sm text-gray-500 truncate max-w-[200px]">
                            {entry.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{entry.day}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Clock className="h-3 w-3" />
                        {formatTime(entry.startTime)} -{" "}
                        {formatTime(entry.endTime)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {getDuration(entry.startTime, entry.endTime)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        style={{
                          backgroundColor: entry.color || typeInfo.color,
                        }}
                        className="text-white"
                      >
                        {typeInfo.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 text-sm">
                        {entry.location && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {entry.location}
                          </div>
                        )}
                        {entry.instructor && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <User className="h-3 w-3" />
                            {entry.instructor}
                          </div>
                        )}
                        {entry.credits && entry.credits > 0 && (
                          <div className="text-muted-foreground">
                            {entry.credits}{" "}
                            {entry.credits === 1 ? "credit" : "credits"}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEdit(entry)}>
                            <Edit2 className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onDuplicate(entry.id)}
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setDeleteId(entry.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </ScrollArea>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Schedule Entry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this schedule entry? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId) {
                  onDelete(deleteId);
                  setDeleteId(null);
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
