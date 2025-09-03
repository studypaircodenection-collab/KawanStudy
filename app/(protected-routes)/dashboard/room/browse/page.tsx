"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/typography";
import { LoadingState, CardSkeleton } from "@/components/ui/loading";
import {
  Video,
  Users,
  Search,
  Filter,
  Plus,
  Calendar,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import { format, isAfter } from "date-fns";

interface RoomData {
  id: string;
  room_id: string;
  host_user_id: string;
  room_type: string;
  status: string;
  created_at: string;
  metadata: {
    title?: string;
    description?: string;
    subject?: string;
    max_participants?: number;
    is_public?: boolean;
    scheduled_start?: string;
  };
  host_profile: {
    username: string;
    full_name?: string;
    avatar_url?: string;
  };
  participants: Array<{
    user_id: string;
    connection_status: string;
  }>;
}

const SUBJECTS = [
  "All",
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
  { value: "all", label: "All Types" },
  { value: "peer_to_peer", label: "Peer to Peer" },
  { value: "group", label: "Group Study" },
  { value: "tutor_session", label: "Tutoring Session" },
];

const STATUSES = [
  { value: "all", label: "All" },
  { value: "waiting", label: "Waiting" },
  { value: "active", label: "Active" },
];

const BrowseRoomsPage = () => {
  const router = useRouter();
  const [rooms, setRooms] = useState<RoomData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    getCurrentUser();
    fetchRooms();
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [searchTerm, subjectFilter, typeFilter, statusFilter]);

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
    }
  };

  const fetchRooms = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("video_rooms")
        .select(
          `
          *,
          host_profile:profiles!host_user_id(username, full_name, avatar_url),
          participants:video_room_participants(user_id, connection_status)
        `
        )
        .eq("metadata->>is_public", "true")
        .order("created_at", { ascending: false });

      // Apply filters
      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      if (typeFilter !== "all") {
        query = query.eq("room_type", typeFilter);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching rooms:", error);
        toast.error("Failed to load rooms");
        return;
      }

      let filteredData = data || [];

      // Filter by subject
      if (subjectFilter !== "All") {
        filteredData = filteredData.filter(
          (room) => room.metadata.subject === subjectFilter
        );
      }

      // Filter by search term
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filteredData = filteredData.filter(
          (room) =>
            room.metadata.title?.toLowerCase().includes(term) ||
            room.metadata.description?.toLowerCase().includes(term) ||
            room.metadata.subject?.toLowerCase().includes(term) ||
            room.host_profile.username.toLowerCase().includes(term) ||
            room.host_profile.full_name?.toLowerCase().includes(term)
        );
      }

      setRooms(filteredData);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const joinRoom = async (roomId: string) => {
    if (!currentUser) {
      toast.error("Please log in to join rooms");
      return;
    }

    try {
      // Check if room exists and is joinable
      const room = rooms.find((r) => r.room_id === roomId);
      if (!room) {
        toast.error("Room not found");
        return;
      }

      // Check capacity
      const currentParticipants = room.participants.length;
      const maxParticipants = room.metadata.max_participants || 50;

      if (currentParticipants >= maxParticipants) {
        toast.error("Room is full");
        return;
      }

      // Check if already a participant
      const isAlreadyParticipant = room.participants.some(
        (p) => p.user_id === currentUser.id
      );

      if (!isAlreadyParticipant) {
        // Add as participant
        const { error } = await supabase
          .from("video_room_participants")
          .insert({
            room_id: roomId,
            user_id: currentUser.id,
            is_host: false,
          });

        if (error) {
          console.error("Error joining room:", error);
          toast.error("Failed to join room");
          return;
        }
      }

      // Navigate to room
      router.push(`/dashboard/room/${roomId}/active-room`);
    } catch (error) {
      console.error("Error joining room:", error);
      toast.error("Failed to join room");
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSubjectFilter("All");
    setTypeFilter("all");
    setStatusFilter("all");
  };

  const activeFiltersCount = [
    searchTerm,
    subjectFilter !== "All" ? subjectFilter : null,
    typeFilter !== "all" ? typeFilter : null,
    statusFilter !== "all" ? statusFilter : null,
  ].filter(Boolean).length;

  const RoomCard = ({ room }: { room: RoomData }) => {
    const totalParticipants = room.participants.length;
    const maxParticipants = room.metadata.max_participants || 50;
    const isScheduled = room.metadata.scheduled_start;
    const scheduledDate = isScheduled
      ? new Date(room.metadata.scheduled_start!)
      : null;
    const isUpcoming = scheduledDate
      ? isAfter(scheduledDate, new Date())
      : false;
    const isLive = room.status === "active";
    const canJoin = room.status === "waiting" || room.status === "active";
    const isFull = totalParticipants >= maxParticipants;

    return (
      <Card key={room.room_id} className="hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg">
                {room.metadata.title || "Untitled Room"}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={isLive ? "default" : "secondary"}>
                  {room.status}
                </Badge>
                <Badge variant="outline">
                  {room.room_type.replace("_", " ")}
                </Badge>
                {room.metadata.subject && (
                  <Badge variant="outline">{room.metadata.subject}</Badge>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                <Users className="w-3 h-3 mr-1" />
                {totalParticipants}/{maxParticipants}
              </Badge>
              {isLive && (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <Text as="span" className="text-xs text-green-600">
                    Live
                  </Text>
                </div>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {room.metadata.description && (
            <Text as="p" styleVariant="muted" className="text-sm line-clamp-2">
              {room.metadata.description}
            </Text>
          )}

          {scheduledDate && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>
                {isUpcoming ? "Scheduled for " : "Started "}
                {format(scheduledDate, "MMM d, h:mm a")}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="w-6 h-6">
                <AvatarImage src={room.host_profile.avatar_url} />
                <AvatarFallback className="text-xs">
                  {room.host_profile.full_name?.[0] ||
                    room.host_profile.username[0]}
                </AvatarFallback>
              </Avatar>
              <Text as="p" className="text-sm">
                {room.host_profile.full_name || room.host_profile.username}
              </Text>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/dashboard/room/${room.room_id}`)}
              >
                View Details
              </Button>

              {canJoin && !isFull && (
                <Button
                  size="sm"
                  onClick={() => joinRoom(room.room_id)}
                  className="flex items-center gap-1"
                >
                  <Video className="w-3 h-3" />
                  Join
                </Button>
              )}

              {isFull && (
                <Button size="sm" disabled>
                  Full
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Text as="h1">Browse Study Rooms</Text>
          <Text as="p" styleVariant="muted">
            Join public study rooms or create your own
          </Text>
        </div>

        <Button onClick={() => router.push("/dashboard/room/create")}>
          <Plus className="w-4 h-4 mr-2" />
          Create Room
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search rooms by title, subject, or host..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filter Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {activeFiltersCount}
                </Badge>
              )}
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  showFilters ? "rotate-180" : ""
                }`}
              />
            </Button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t">
              <div>
                <Label className="text-sm font-medium">Subject</Label>
                <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                  <SelectTrigger>
                    <SelectValue />
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

              <div>
                <Label className="text-sm font-medium">Room Type</Label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROOM_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {activeFiltersCount > 0 && (
                <div className="md:col-span-3">
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : rooms.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Video className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <Text as="h3">No rooms found</Text>
            <Text as="p" styleVariant="muted" className="mt-2 mb-4">
              {searchTerm || activeFiltersCount > 0
                ? "Try adjusting your search or filters"
                : "No public rooms are available right now"}
            </Text>
            <div className="flex gap-2 justify-center">
              {(searchTerm || activeFiltersCount > 0) && (
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
              <Button onClick={() => router.push("/dashboard/room/create")}>
                <Plus className="w-4 h-4 mr-2" />
                Create Room
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <Text as="p" styleVariant="muted">
              Showing {rooms.length} room{rooms.length !== 1 ? "s" : ""}
            </Text>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <RoomCard key={room.room_id} room={room} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default BrowseRoomsPage;
