"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSchedule } from "@/hooks/use-schedule";
import { ScheduleForm } from "@/components/schedule/schedule-form";
import { ScheduleTable } from "@/components/schedule/schedule-table";
import { ScheduleGrid } from "@/components/schedule/schedule-grid";
import { ScheduleStats } from "@/components/schedule/schedule-stats";
import { Text } from "@/components/ui/typography";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  Calendar,
  Table,
  Grid3X3,
  BarChart3,
  Settings,
  Download,
  Upload,
  Trash2,
  Info,
  Loader2,
} from "lucide-react";
import { ScheduleEntry } from "@/types/schedule";
import { toast } from "sonner";
export default function ScheduleGeneratorPage() {
  const {
    entries,
    allEntries,
    settings,
    filters,
    setSettings,
    setFilters,
    addEntry,
    updateEntry,
    deleteEntry,
    duplicateEntry,
    clearAllEntries,
    hasTimeConflict,
    exportToJSON,
    importFromJSON,
    getScheduleStats,
    isLoading,
  } = useSchedule();

  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ScheduleEntry | undefined>();
  const [activeTab, setActiveTab] = useState("table");

  const handleAddEntry = (entryData: Omit<ScheduleEntry, "id">) => {
    try {
      addEntry(entryData);
      toast.success("Schedule entry added successfully!");
    } catch (error) {
      toast.error("Failed to add schedule entry");
    }
  };

  const handleUpdateEntry = (entryData: Omit<ScheduleEntry, "id">) => {
    if (editingEntry) {
      try {
        updateEntry(editingEntry.id, entryData);
        toast.success("Schedule entry updated successfully!");
        setEditingEntry(undefined);
      } catch (error) {
        toast.error("Failed to update schedule entry");
      }
    }
  };

  const handleEdit = (entry: ScheduleEntry) => {
    setEditingEntry(entry);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    try {
      deleteEntry(id);
      toast.success("Schedule entry deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete schedule entry");
    }
  };

  const handleDuplicate = (id: string) => {
    try {
      duplicateEntry(id);
      toast.success("Schedule entry duplicated successfully!");
    } catch (error) {
      toast.error("Failed to duplicate schedule entry");
    }
  };

  const handleExport = () => {
    try {
      const data = exportToJSON();
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `kawanstudy-schedule-${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Schedule exported successfully!");
    } catch (error) {
      toast.error("Failed to export schedule");
    }
  };

  const handleImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const success = importFromJSON(content);
        if (success) {
          toast.success("Schedule imported successfully!");
        } else {
          toast.error("Invalid file format");
        }
      } catch (error) {
        toast.error("Failed to import schedule");
      }
    };
    reader.readAsText(file);
  };

  const handleClearAll = () => {
    try {
      clearAllEntries();
      toast.success("All schedule entries cleared successfully!");
    } catch (error) {
      toast.error("Failed to clear schedule entries");
    }
  };

  const stats = getScheduleStats();

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold ">Schedule Manager</h1>
          <p className="text-muted-foreground">
            Create and manage your personalized study schedule
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => {
              setEditingEntry(undefined);
              setShowForm(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Entry
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      {allEntries.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <Text as="h3">Total Entries</Text>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Text as="p" className="text-2xl ">
                {stats.totalEntries} Entries
              </Text>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Grid3X3 className="h-5 w-5 text-green-600" />
                <Text as="h3">Total Hours</Text>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Text as="p" className="text-2xl ">
                {stats.totalHours} hours
              </Text>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-purple-600" />
                <Text as="h3">Average/Day</Text>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Text as="p" className="text-2xl">
                {stats.averagePerDay} hours
              </Text>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="table" className="flex items-center gap-2">
            <Table className="h-4 w-4" />
            <span className="hidden sm:inline">Table View</span>
          </TabsTrigger>
          <TabsTrigger value="grid" className="flex items-center gap-2">
            <Grid3X3 className="h-4 w-4" />
            <span className="hidden sm:inline">Grid View</span>
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Statistics</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="table" className="space-y-4">
          <ScheduleTable
            entries={entries}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onDuplicate={handleDuplicate}
            filters={filters}
            onFiltersChange={setFilters}
            onExport={handleExport}
            onImport={handleImport}
          />
        </TabsContent>

        <TabsContent value="grid" className="space-y-4">
          <ScheduleGrid entries={allEntries} settings={settings} />
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <ScheduleStats stats={stats} onExport={handleExport} />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Schedule Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Display Options</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="time-format"
                        className="text-sm font-medium"
                      >
                        Time Format
                      </Label>
                      <Select
                        value={settings.timeFormat}
                        onValueChange={(value: "12h" | "24h") =>
                          setSettings({
                            ...settings,
                            timeFormat: value,
                          })
                        }
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="12h">12 Hour</SelectItem>
                          <SelectItem value="24h">24 Hour</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="show-weekends"
                        className="text-sm font-medium"
                      >
                        Show Weekends
                      </Label>
                      <Checkbox
                        id="show-weekends"
                        checked={settings.showWeekends}
                        onCheckedChange={(checked) =>
                          setSettings({
                            ...settings,
                            showWeekends: checked === true,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Data Management</h3>
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      onClick={handleExport}
                      className="w-full justify-start"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export Schedule Data
                    </Button>
                    <div className="relative">
                      <input
                        type="file"
                        accept=".json"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImport(file);
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        id="import-settings-file"
                      />
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        asChild
                      >
                        <label
                          htmlFor="import-settings-file"
                          className="cursor-pointer"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Import Schedule Data
                        </label>
                      </Button>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          className="w-full justify-start"
                          disabled={allEntries.length === 0}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Clear All Entries
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Confirm Clear All Entries?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This action will permanently delete all schedule
                            entries. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleClearAll}>
                            Confirm
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-primary/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-primary mt-0.5" />
                  <div className="text-sm">
                    <h4 className="font-medium text-primary mb-1">
                      Tips for better scheduling:
                    </h4>
                    <ul className="text-primary space-y-1">
                      <li>
                        • Use different colors for different types of activities
                      </li>
                      <li>• Add locations to help you plan your movements</li>
                      <li>• Include instructor information for easy contact</li>
                      <li>• Regular backups help prevent data loss</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Empty State */}
      {allEntries.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium  mb-2">
              No schedule entries yet
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Get started by creating your first schedule entry. Add classes,
              study sessions, exams, and more to organize your academic life.
            </p>
            <Button
              onClick={() => {
                setEditingEntry(undefined);
                setShowForm(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Entry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Form Dialog */}
      <ScheduleForm
        open={showForm}
        onOpenChange={(open) => {
          setShowForm(open);
          if (!open) setEditingEntry(undefined);
        }}
        onSubmit={editingEntry ? handleUpdateEntry : handleAddEntry}
        initialData={editingEntry}
        hasTimeConflict={hasTimeConflict}
      />
    </div>
  );
}
