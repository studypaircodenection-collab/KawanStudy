"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  BookOpen,
  Eye,
  Heart,
  Download,
  Plus,
} from "lucide-react";
import Link from "next/link";
import NoteCard from "@/components/notes/note-card";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { useNotes } from "@/hooks/use-notes";

const MyNotesPage = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSubject, setFilterSubject] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterVisibility, setFilterVisibility] = useState("all");
  const supabase = createClient();
  const router = useRouter();

  // Use the unified notes hook for current user's notes
  const {
    data: notesData,
    loading: notesLoading,
    error: notesError,
    filters,
    updateFilters,
    refetch,
  } = useNotes({
    myNotes: true, // Fetch current user's notes including private ones
    initialFilters: { sortBy: "created_at", sortDirection: "desc" },
    autoLoad: !!currentUser, // Only auto-load when we have authenticated user
  });

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      setLoading(true);
      const {
        data: { user: currentUser },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !currentUser) {
        router.push("/auth/login");
        return;
      }

      setCurrentUser(currentUser);
    } catch (error) {
      console.error("Error fetching user:", error);
      router.push("/auth/login");
    } finally {
      setLoading(false);
    }
  };

  // Get notes and stats from the unified API response
  const notes = notesData?.notes || [];
  const stats = notesData?.stats
    ? {
        totalNotes: notesData.stats.totalPublicNotes || 0,
        totalViews: notesData.stats.totalViews || 0,
        totalLikes: notesData.stats.totalLikes || 0,
        totalDownloads: notesData.stats.totalDownloads || 0,
        publicNotes: notes.filter((note) => note.visibility === "public")
          .length,
        privateNotes: notes.filter((note) => note.visibility === "private")
          .length,
      }
    : null;

  // Apply local filters to the fetched notes
  const getFilteredNotes = () => {
    let filtered = notes;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (note) =>
          note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          note.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          note.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
          note.tags.some((tag: string) =>
            tag.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    // Apply subject filter
    if (filterSubject !== "all") {
      filtered = filtered.filter((note) => note.subject === filterSubject);
    }

    // Apply status filter (note: API only returns published notes, but we can add this for future use)
    if (filterStatus !== "all") {
      filtered = filtered.filter((note) => note.status === filterStatus);
    }

    // Apply visibility filter
    if (filterVisibility !== "all") {
      filtered = filtered.filter(
        (note) => note.visibility === filterVisibility
      );
    }

    return filtered;
  };

  const filteredNotes = getFilteredNotes();

  const getUniqueSubjects = (): string[] => {
    const subjects = [...new Set(notes.map((note) => note.subject))];
    return subjects.sort();
  };

  if (loading || notesLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-8 rounded mb-6"></Skeleton>
          <Skeleton className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 rounded"></div>
            ))}
          </Skeleton>
          <Skeleton className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-64 rounded"></Skeleton>
            ))}
          </Skeleton>
        </div>
      </div>
    );
  }

  // Show error state if there's an error fetching notes
  if (notesError) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error loading notes</h3>
            <p className="text-muted-foreground mb-4">
              There was an error loading your notes. Please try again.
            </p>
            <Button onClick={refetch}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Notes</h1>
          <p className="text-muted-foreground">
            Manage and track your uploaded notes
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/notes/upload">
            <Plus className="h-4 w-4 mr-2" />
            Upload New Note
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Notes
                  </p>
                  <p className="text-2xl font-bold">{stats.totalNotes}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Eye className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Views
                  </p>
                  <p className="text-2xl font-bold">{stats.totalViews}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Heart className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Likes
                  </p>
                  <p className="text-2xl font-bold">{stats.totalLikes}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Download className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    Downloads
                  </p>
                  <p className="text-2xl font-bold">{stats.totalDownloads}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Select value={filterSubject} onValueChange={setFilterSubject}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {getUniqueSubjects().map((subject) => (
                <SelectItem key={subject} value={subject}>
                  {subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="under_review">Under Review</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterVisibility} onValueChange={setFilterVisibility}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Visibility" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="public">Public</SelectItem>
              <SelectItem value="private">Private</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Notes Grid */}
      {filteredNotes.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredNotes.map((note) => (
            <div key={note.id} className="relative group">
              <NoteCard note={note} />
            </div>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm ||
              filterSubject !== "all" ||
              filterStatus !== "all" ||
              filterVisibility !== "all"
                ? "No notes match your filters"
                : "No notes yet"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ||
              filterSubject !== "all" ||
              filterStatus !== "all" ||
              filterVisibility !== "all"
                ? "Try adjusting your search terms or filters"
                : "Upload your first note to get started"}
            </p>
            {!searchTerm &&
              filterSubject === "all" &&
              filterStatus === "all" &&
              filterVisibility === "all" && (
                <Button asChild>
                  <Link href="/dashboard/notes/upload">
                    <Plus className="h-4 w-4 mr-2" />
                    Upload Your First Note
                  </Link>
                </Button>
              )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MyNotesPage;
