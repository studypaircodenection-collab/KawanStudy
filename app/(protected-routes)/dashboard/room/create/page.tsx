"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Text } from "@/components/ui/typography";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  ArrowLeft,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  Users,
  Video,
} from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { format } from "date-fns";

interface RoomFormData {
  title: string;
  description: string;
  subject: string;
  max_participants: number;
  is_public: boolean;
  room_type: string;
  scheduled_start?: Date;
}

const SUBJECTS = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Computer Science",
  "Engineering",
  "Medicine",
  "Business",
  "Economics",
  "Psychology",
  "History",
  "Literature",
  "Philosophy",
  "Art",
  "Music",
  "Other",
];

const ROOM_TYPES = [
  {
    value: "peer_to_peer",
    label: "Peer to Peer",
    description: "1-on-1 study session with another student",
    icon: Users,
    maxParticipants: 2,
  },
  {
    value: "group",
    label: "Group Study",
    description: "Small group collaboration (up to 8 people)",
    icon: Users,
    maxParticipants: 8,
  },
  {
    value: "tutor_session",
    label: "Tutoring Session",
    description: "Teaching and learning session with multiple students",
    icon: Video,
    maxParticipants: 20,
  },
];

const CreateRoomPage = () => {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [scheduledDate, setScheduledDate] = useState<Date>();
  const [scheduledTime, setScheduledTime] = useState("");
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RoomFormData>({
    defaultValues: {
      title: "",
      description: "",
      subject: "",
      max_participants: 10,
      is_public: true,
      room_type: "group",
    },
  });

  const watchedValues = watch();

  useEffect(() => {
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      setCurrentUser(profile);
    } else {
      router.push("/auth/login");
    }
  };

  const generateRoomId = () => {
    return `room-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  };

  const onSubmit = async (data: RoomFormData) => {
    if (!currentUser) return;

    setCreating(true);
    try {
      const roomId = generateRoomId();

      // Prepare scheduled start time
      let scheduledStart = null;
      if (scheduledDate && scheduledTime) {
        const [hours, minutes] = scheduledTime.split(":");
        const scheduledDateTime = new Date(scheduledDate);
        scheduledDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        scheduledStart = scheduledDateTime.toISOString();
      }

      // Get max participants based on room type
      const roomType = ROOM_TYPES.find((t) => t.value === data.room_type);
      const maxParticipants = Math.min(
        data.max_participants,
        roomType?.maxParticipants || 50
      );

      // Create room
      const { error: roomError } = await supabase.from("video_rooms").insert({
        room_id: roomId,
        host_user_id: currentUser.id,
        room_type: data.room_type,
        status: scheduledStart ? "waiting" : "waiting",
        metadata: {
          title: data.title,
          description: data.description,
          subject: data.subject,
          max_participants: maxParticipants,
          is_public: data.is_public,
          scheduled_start: scheduledStart,
        },
      });

      if (roomError) throw roomError;

      // Add creator as host participant
      const { error: participantError } = await supabase
        .from("video_room_participants")
        .insert({
          room_id: roomId,
          user_id: currentUser.id,
          is_host: true,
          connection_status: "disconnected",
        });

      if (participantError) {
        console.error("Error adding host as participant:", participantError);
        // Continue anyway
      }

      toast.success("Room created successfully!");
      router.push(`/dashboard/room/${roomId}`);
    } catch (error) {
      console.error("Error creating room:", error);
      toast.error("Failed to create room");
    } finally {
      setCreating(false);
    }
  };

  const selectedRoomType = ROOM_TYPES.find(
    (t) => t.value === watchedValues.room_type
  );

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/dashboard/room")}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <Text as="h1">Create New Room</Text>
          <Text as="p" styleVariant="muted">
            Set up a new study room for video collaboration
          </Text>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Give your room a name and description to help others
                  understand what you'll be studying.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Room Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Calculus Study Group, Physics Help Session..."
                    {...register("title", { required: "Title is required" })}
                  />
                  {errors.title && (
                    <Text as="p" className="text-red-500 text-sm mt-1">
                      {errors.title.message}
                    </Text>
                  )}
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what you'll be studying, what topics you'll cover, or what help you need..."
                    rows={3}
                    {...register("description")}
                  />
                </div>

                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Select
                    value={watchedValues.subject}
                    onValueChange={(value) => setValue("subject", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {SUBJECTS.map((subject) => (
                        <SelectItem key={subject} value={subject}>
                          {subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Room Type & Settings</CardTitle>
                <CardDescription>
                  Choose the type of room and configure capacity settings.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Room Type</Label>
                  <div className="grid grid-cols-1 gap-3 mt-2">
                    {ROOM_TYPES.map((type) => {
                      const Icon = type.icon;
                      const isSelected = watchedValues.room_type === type.value;

                      return (
                        <div
                          key={type.value}
                          className={`p-4 border rounded-lg cursor-pointer transition-all ${
                            isSelected
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                          onClick={() => {
                            setValue("room_type", type.value);
                            setValue(
                              "max_participants",
                              Math.min(
                                watchedValues.max_participants,
                                type.maxParticipants
                              )
                            );
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <Icon className="w-5 h-5 mt-0.5 text-primary" />
                            <div className="flex-1">
                              <Text as="p" className="font-medium">
                                {type.label}
                              </Text>
                              <Text
                                as="p"
                                styleVariant="muted"
                                className="text-sm"
                              >
                                {type.description}
                              </Text>
                              <Text
                                as="p"
                                styleVariant="muted"
                                className="text-xs mt-1"
                              >
                                Max participants: {type.maxParticipants}
                              </Text>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <Label htmlFor="max_participants">Maximum Participants</Label>
                  <Input
                    id="max_participants"
                    type="number"
                    min="2"
                    max={selectedRoomType?.maxParticipants || 50}
                    {...register("max_participants", {
                      valueAsNumber: true,
                      min: { value: 2, message: "Minimum 2 participants" },
                      max: {
                        value: selectedRoomType?.maxParticipants || 50,
                        message: `Maximum ${
                          selectedRoomType?.maxParticipants || 50
                        } participants for this room type`,
                      },
                    })}
                  />
                  {errors.max_participants && (
                    <Text as="p" className="text-red-500 text-sm mt-1">
                      {errors.max_participants.message}
                    </Text>
                  )}
                  <Text as="p" styleVariant="muted" className="text-sm mt-1">
                    For {selectedRoomType?.label}: 2-
                    {selectedRoomType?.maxParticipants} participants
                  </Text>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="is_public">Public Room</Label>
                    <Text as="p" styleVariant="muted" className="text-sm">
                      Allow anyone to discover and join this room
                    </Text>
                  </div>
                  <Switch
                    id="is_public"
                    checked={watchedValues.is_public}
                    onCheckedChange={(checked) =>
                      setValue("is_public", checked)
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Schedule (Optional)</CardTitle>
                <CardDescription>
                  Schedule this room to start at a specific time, or leave blank
                  to start immediately.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {scheduledDate
                            ? format(scheduledDate, "PPP")
                            : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={scheduledDate}
                          onSelect={setScheduledDate}
                          disabled={(date) => date < new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <Label htmlFor="time">Time</Label>
                    <Input
                      id="time"
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                    />
                  </div>
                </div>

                {scheduledDate && scheduledTime && (
                  <div className="p-3 bg-muted rounded-lg">
                    <Text as="p" className="text-sm font-medium">
                      Scheduled for:
                    </Text>
                    <Text as="p" styleVariant="muted" className="text-sm">
                      {format(scheduledDate, "MMMM d, yyyy")} at {scheduledTime}
                    </Text>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Room Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Text as="p" className="text-sm font-medium">
                    Title
                  </Text>
                  <Text as="p" styleVariant="muted" className="text-sm">
                    {watchedValues.title || "Untitled Room"}
                  </Text>
                </div>

                <div>
                  <Text as="p" className="text-sm font-medium">
                    Type
                  </Text>
                  <Text as="p" styleVariant="muted" className="text-sm">
                    {selectedRoomType?.label}
                  </Text>
                </div>

                <div>
                  <Text as="p" className="text-sm font-medium">
                    Capacity
                  </Text>
                  <Text as="p" styleVariant="muted" className="text-sm">
                    Up to {watchedValues.max_participants} participants
                  </Text>
                </div>

                <div>
                  <Text as="p" className="text-sm font-medium">
                    Visibility
                  </Text>
                  <Text as="p" styleVariant="muted" className="text-sm">
                    {watchedValues.is_public
                      ? "Public - Anyone can join"
                      : "Private - Invite only"}
                  </Text>
                </div>

                {watchedValues.subject && (
                  <div>
                    <Text as="p" className="text-sm font-medium">
                      Subject
                    </Text>
                    <Text as="p" styleVariant="muted" className="text-sm">
                      {watchedValues.subject}
                    </Text>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={creating}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {creating ? "Creating Room..." : "Create Room"}
                </Button>

                <Text
                  as="p"
                  styleVariant="muted"
                  className="text-xs text-center mt-2"
                >
                  You'll be able to edit room settings after creation
                </Text>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateRoomPage;
