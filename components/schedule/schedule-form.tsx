"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

import { MapPin, User, AlertTriangle } from "lucide-react";

import {
  ScheduleEntry,
  DAYS_OF_WEEK,
  SCHEDULE_TYPES,
  TIME_SLOTS,
} from "@/types/schedule";

interface ScheduleFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (entry: Omit<ScheduleEntry, "id">) => void;
  initialData?: ScheduleEntry;
  hasTimeConflict?: (
    entry: Omit<ScheduleEntry, "id">,
    excludeId?: string
  ) => boolean;
}

export function ScheduleForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  hasTimeConflict,
}: ScheduleFormProps) {
  const [formData, setFormData] = useState<Omit<ScheduleEntry, "id">>({
    subject: initialData?.subject || "",
    description: initialData?.description || "",
    day: initialData?.day || "",
    startTime: initialData?.startTime || "",
    endTime: initialData?.endTime || "",
    location: initialData?.location || "",
    instructor: initialData?.instructor || "",
    color: initialData?.color || SCHEDULE_TYPES[0].color,
    type: initialData?.type || "class",
    credits: initialData?.credits || 1,
    isRecurring: initialData?.isRecurring || false,
    recurringPattern: initialData?.recurringPattern || "weekly",
    endDate: initialData?.endDate || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showAdvanced, setShowAdvanced] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required";
    }

    if (!formData.day) {
      newErrors.day = "Day is required";
    }

    if (!formData.startTime) {
      newErrors.startTime = "Start time is required";
    }

    if (!formData.endTime) {
      newErrors.endTime = "End time is required";
    }

    if (
      formData.startTime &&
      formData.endTime &&
      formData.startTime >= formData.endTime
    ) {
      newErrors.endTime = "End time must be after start time";
    }

    if (hasTimeConflict && hasTimeConflict(formData, initialData?.id)) {
      newErrors.timeConflict = "This time slot conflicts with another entry";
    }

    if (formData.isRecurring && !formData.endDate) {
      newErrors.endDate = "End date is required for recurring entries";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
      onOpenChange(false);
      resetForm();
    }
  };

  const resetForm = () => {
    setFormData({
      subject: "",
      description: "",
      day: "",
      startTime: "",
      endTime: "",
      location: "",
      instructor: "",
      color: SCHEDULE_TYPES[0].color,
      type: "class",
      credits: 1,
      isRecurring: false,
      recurringPattern: "weekly",
      endDate: "",
    });
    setErrors({});
    setShowAdvanced(false);
  };

  const updateFormData = (field: keyof typeof formData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const selectedType = SCHEDULE_TYPES.find(
    (type) => type.value === formData.type
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Schedule Entry" : "Add New Schedule Entry"}
          </DialogTitle>
          <DialogDescription>
            Fill in the details for your schedule entry. Required fields are
            marked with *.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => updateFormData("subject", e.target.value)}
                  placeholder="e.g., Mathematics, Study Session"
                  className={errors.subject ? "border-red-500" : ""}
                />
                {errors.subject && (
                  <p className="text-sm text-red-500">{errors.subject}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    updateFormData("type", value as ScheduleEntry["type"])
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateFormData("description", e.target.value)}
                placeholder="Additional details about this entry..."
                rows={3}
              />
            </div>
          </div>

          {/* Time & Date */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Schedule Details</h3>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="day">Day *</Label>
                <Select
                  value={formData.day}
                  onValueChange={(value) => updateFormData("day", value)}
                >
                  <SelectTrigger className={errors.day ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS_OF_WEEK.map((day) => (
                      <SelectItem key={day} value={day}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.day && (
                  <p className="text-sm text-red-500">{errors.day}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time *</Label>
                <Select
                  value={formData.startTime}
                  onValueChange={(value) => updateFormData("startTime", value)}
                >
                  <SelectTrigger
                    className={
                      errors.startTime ? "border-red-500 w-full" : "w-full"
                    }
                  >
                    <SelectValue placeholder="Start" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.map((time) => (
                      <SelectItem key={time.value} value={time.value}>
                        {time.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.startTime && (
                  <p className="text-sm text-red-500">{errors.startTime}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="endTime">End Time *</Label>
                <Select
                  value={formData.endTime}
                  onValueChange={(value) => updateFormData("endTime", value)}
                >
                  <SelectTrigger
                    className={
                      errors.endTime ? "border-red-500 w-full" : "w-full"
                    }
                  >
                    <SelectValue placeholder="End" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.map((time) => (
                      <SelectItem key={time.value} value={time.value}>
                        {time.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.endTime && (
                  <p className="text-sm text-red-500">{errors.endTime}</p>
                )}
              </div>
            </div>

            {errors.timeConflict && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <p className="text-sm text-red-600">{errors.timeConflict}</p>
              </div>
            )}
          </div>

          {/* Additional Details */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Additional Details</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                {showAdvanced ? "Hide" : "Show"} Advanced
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">
                  <MapPin className="inline h-4 w-4 mr-1" />
                  Location
                </Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => updateFormData("location", e.target.value)}
                  placeholder="e.g., Room 201, Library"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructor">
                  <User className="inline h-4 w-4 mr-1" />
                  Instructor/Contact
                </Label>
                <Input
                  id="instructor"
                  value={formData.instructor}
                  onChange={(e) => updateFormData("instructor", e.target.value)}
                  placeholder="e.g., Dr. Smith, Study Partner"
                />
              </div>
            </div>

            {showAdvanced && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="credits">Credits/Hours</Label>
                    <Input
                      id="credits"
                      type="number"
                      min="0"
                      step="0.5"
                      value={formData.credits}
                      onChange={(e) =>
                        updateFormData(
                          "credits",
                          parseFloat(e.target.value) || 0
                        )
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="color">Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="color"
                        type="color"
                        value={formData.color}
                        onChange={(e) =>
                          updateFormData("color", e.target.value)
                        }
                        className="w-16 h-10 p-1"
                      />
                      <div className="flex-1 flex items-center">
                        <Badge
                          style={{ backgroundColor: formData.color }}
                          className="text-white"
                        >
                          {selectedType?.label}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="recurring">Recurring Entry</Label>
                    <Switch
                      id="recurring"
                      checked={formData.isRecurring}
                      onCheckedChange={(checked) =>
                        updateFormData("isRecurring", checked)
                      }
                    />
                  </div>

                  {formData.isRecurring && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Pattern</Label>
                        <Select
                          value={formData.recurringPattern}
                          onValueChange={(value) =>
                            updateFormData(
                              "recurringPattern",
                              value as "weekly" | "biweekly" | "monthly"
                            )
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="biweekly">Bi-weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>End Date</Label>
                        <Input
                          type="date"
                          value={formData.endDate}
                          onChange={(e) =>
                            updateFormData("endDate", e.target.value)
                          }
                          className={errors.endDate ? "border-red-500" : ""}
                        />
                        {errors.endDate && (
                          <p className="text-sm text-red-500">
                            {errors.endDate}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {initialData ? "Update Entry" : "Add Entry"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
