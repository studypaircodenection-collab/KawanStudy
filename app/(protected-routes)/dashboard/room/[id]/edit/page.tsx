"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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
import { Badge } from "@/components/ui/badge";
import { Text } from "@/components/ui/typography";
import { LoadingState, Skeleton } from "@/components/ui/loading";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, Save, Trash2, Users, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";

interface RoomFormData {
  title: string;
  description: string;
  subject: string;
  max_participants: number;
  is_public: boolean;
  room_type: string;
}

interface RoomData {
  id: string;
  room_id: string;
  host_user_id: string;
  room_type: string;
  status: string;
  metadata: {
    title?: string;
    description?: string;
    subject?: string;
    max_participants?: number;
    is_public?: boolean;
  };
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
    description: "1-on-1 study session",
  },
  {
    value: "group",
    label: "Group Study",
    description: "Small group collaboration",
  },
  {
    value: "tutor_session",
    label: "Tutoring Session",
    description: "Teaching and learning session",
  },
];

const EditRoomPage = () => {
  const params = useParams();
  const router = useRouter();
  const roomId = params.id as string;
  const [room, setRoom] = useState<RoomData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<RoomFormData>();

  const watchedValues = watch();

  useEffect(() => {
    fetchRoomData();
    getCurrentUser();
  }, [roomId]);

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

  const fetchRoomData = async () => {
    try {
      const { data, error } = await supabase
        .from("video_rooms")
        .select("*")
        .eq("room_id", roomId)
        .single();

      if (error) {
        toast.error("Failed to load room");
        router.push("/dashboard/room");
        return;
      }

      setRoom(data);

      // Populate form with existing data
      setValue("title", data.metadata.title || "");
      setValue("description", data.metadata.description || "");
      setValue("subject", data.metadata.subject || "");
      setValue("max_participants", data.metadata.max_participants || 10);
      setValue("is_public", data.metadata.is_public || false);
      setValue("room_type", data.room_type);
    } catch (error) {
      console.error("Error fetching room:", error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: RoomFormData) => {
    if (!room || !currentUser) return;

    // Check if user is the host
    if (room.host_user_id !== currentUser.id) {
      toast.error("Only the room host can edit this room");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from("video_rooms")
        .update({
          room_type: data.room_type,
          metadata: {
            ...room.metadata,
            title: data.title,
            description: data.description,
            subject: data.subject,
            max_participants: data.max_participants,
            is_public: data.is_public,
          },
        })
        .eq("room_id", roomId);

      if (error) throw error;

      toast.success("Room updated successfully");
      router.push(`/dashboard/room/${roomId}`);
    } catch (error) {
      console.error("Error updating room:", error);
      toast.error("Failed to update room");
    } finally {
      setSaving(false);
    }
  };

  const deleteRoom = async () => {
    if (!room || !currentUser) return;

    if (room.host_user_id !== currentUser.id) {
      toast.error("Only the room host can delete this room");
      return;
    }

    setDeleting(true);
    try {
      // Delete room (cascade will handle participants and signals)
      const { error } = await supabase
        .from("video_rooms")
        .delete()
        .eq("room_id", roomId);

      if (error) throw error;

      toast.success("Room deleted successfully");
      router.push("/dashboard/room");
    } catch (error) {
      console.error("Error deleting room:", error);
      toast.error("Failed to delete room");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="container mx-auto py-8">
        <Card className="max-w-md mx-auto text-center">
          <CardContent className="py-8">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <Text as="h3">Room not found</Text>
            <Text as="p" styleVariant="muted" className="mt-2">
              The room you're trying to edit doesn't exist or you don't have
              permission.
            </Text>
            <Button
              onClick={() => router.push("/dashboard/room")}
              className="mt-4"
            >
              Browse Rooms
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if user is the host
  const isHost = currentUser?.id === room.host_user_id;
  if (!isHost) {
    return (
      <div className="container mx-auto py-8">
        <Card className="max-w-md mx-auto text-center">
          <CardContent className="py-8">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <Text as="h3">Access Denied</Text>
            <Text as="p" styleVariant="muted" className="mt-2">
              Only the room host can edit this room.
            </Text>
            <Button
              onClick={() => router.push(`/dashboard/room/${roomId}`)}
              className="mt-4"
            >
              View Room
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push(`/dashboard/room/${roomId}`)}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <Text as="h1">Edit Room</Text>
          <Text as="p" styleVariant="muted">
            Modify room settings and preferences
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
                  Set the title, description, and other basic details for your
                  room.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Room Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter room title..."
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
                    placeholder="What will you be studying or discussing?"
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
                <CardTitle>Room Settings</CardTitle>
                <CardDescription>
                  Configure room type, capacity, and visibility settings.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="room_type">Room Type</Label>
                  <Select
                    value={watchedValues.room_type}
                    onValueChange={(value) => setValue("room_type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select room type" />
                    </SelectTrigger>
                    <SelectContent>
                      {ROOM_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div>
                            <div className="font-medium">{type.label}</div>
                            <div className="text-sm text-muted-foreground">
                              {type.description}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="max_participants">Maximum Participants</Label>
                  <Input
                    id="max_participants"
                    type="number"
                    min="2"
                    max="50"
                    {...register("max_participants", {
                      valueAsNumber: true,
                      min: { value: 2, message: "Minimum 2 participants" },
                      max: { value: 50, message: "Maximum 50 participants" },
                    })}
                  />
                  {errors.max_participants && (
                    <Text as="p" className="text-red-500 text-sm mt-1">
                      {errors.max_participants.message}
                    </Text>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="is_public">Public Room</Label>
                    <Text as="p" styleVariant="muted" className="text-sm">
                      Anyone can discover and join this room
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
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle>Room Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Text as="p" className="text-sm">
                      Status
                    </Text>
                    <Badge
                      variant={
                        room.status === "active" ? "default" : "secondary"
                      }
                    >
                      {room.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <Text as="p" className="text-sm">
                      Room ID
                    </Text>
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {roomId}
                    </code>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={saving || !isDirty}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push(`/dashboard/room/${roomId}`)}
                >
                  Cancel
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Room
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Room</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this room? This action
                        cannot be undone. All participants will be removed and
                        the room will be permanently deleted.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={deleteRoom}
                        disabled={deleting}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        {deleting ? "Deleting..." : "Delete Room"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditRoomPage;
