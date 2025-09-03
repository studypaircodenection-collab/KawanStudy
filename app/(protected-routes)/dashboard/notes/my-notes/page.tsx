"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Edit,
  Trash2,
  Plus,
} from "lucide-react";
import Link from "next/link";
import NoteCard from "@/components/notes/note-card";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
interface MyNote {
  id: string;
  title: string;
  description: string;
  subject: string;
  noteType: string;
  tags: string[];
  createdAt: string;
  estimatedReadTime: number;
  viewCount: number;
  downloadCount: number;
  likeCount: number;
  academicLevel: string;
  language: string;
  difficultyLevel: string;
  institution: string;
  status: string;
  visibility: string;
  thumbnailUrl?: string;
  userProfile?: {
    id: string;
    username: string;
    fullName: string;
    avatarUrl: string;
  };
}

interface NotesStats {
  totalNotes: number;
  totalViews: number;
  totalLikes: number;
  totalDownloads: number;
  publicNotes: number;
  privateNotes: number;
}

const MyNotesPage = () => {
  const [notes, setNotes] = useState<MyNote[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<MyNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<NotesStats | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSubject, setFilterSubject] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterVisibility, setFilterVisibility] = useState("all");
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    fetchUserAndNotes();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [notes, searchTerm, filterSubject, filterStatus, filterVisibility]);

  const fetchUserAndNotes = async () => {
    try {
      setLoading(true);

      // Get current user
      const {
        data: { user: currentUser },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !currentUser) {
        router.push("/auth/login");
        return;
      }

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentUser.id)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        return;
      }

      // Fetch user's notes
      const { data: notesData, error: notesError } = await supabase
        .from("notes")
        .select(
          `
          id,
          title,
          description,
          subject,
          note_type,
          tags,
          created_at,
          estimated_read_time,
          view_count,
          download_count,
          like_count,
          academic_level,
          language,
          difficulty_level,
          institution,
          status,
          visibility,
          file_url,
          profiles!notes_user_id_fkey (
            id,
            username,
            full_name,
            avatar_url
          )
        `
        )
        .eq("user_id", currentUser.id)
        .order("created_at", { ascending: false });

      if (notesError) {
        console.error("Error fetching notes:", notesError);
        return;
      }

      // Transform notes data
      const transformedNotes = (notesData || []).map((note: any) => ({
        id: note.id,
        title: note.title || "Untitled Note",
        description: note.description || "",
        subject: note.subject || "General",
        noteType:
          note.note_type
            ?.replace(/-/g, " ")
            .replace(/\b\w/g, (l: string) => l.toUpperCase()) || "Note",
        tags: Array.isArray(note.tags) ? note.tags : [],
        createdAt: note.created_at,
        estimatedReadTime: note.estimated_read_time || 5,
        viewCount: note.view_count || 0,
        downloadCount: note.download_count || 0,
        likeCount: note.like_count || 0,
        academicLevel: note.academic_level,
        language: note.language,
        difficultyLevel: note.difficulty_level,
        institution: note.institution,
        status: note.status,
        visibility: note.visibility,
        thumbnailUrl: note.file_url
          ? `${note.file_url}?thumbnail=true`
          : undefined,
        userProfile: note.profiles
          ? {
              id: note.profiles.id,
              username: note.profiles.username,
              fullName: note.profiles.full_name,
              avatarUrl: note.profiles.avatar_url || "",
            }
          : undefined,
      }));

      setNotes(transformedNotes);

      // Calculate stats
      const notesStats: NotesStats = {
        totalNotes: transformedNotes.length,
        totalViews: transformedNotes.reduce(
          (sum, note) => sum + note.viewCount,
          0
        ),
        totalLikes: transformedNotes.reduce(
          (sum, note) => sum + note.likeCount,
          0
        ),
        totalDownloads: transformedNotes.reduce(
          (sum, note) => sum + note.downloadCount,
          0
        ),
        publicNotes: transformedNotes.filter(
          (note) => note.visibility === "public"
        ).length,
        privateNotes: transformedNotes.filter(
          (note) => note.visibility === "private"
        ).length,
      };

      setStats(notesStats);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = notes;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (note) =>
          note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          note.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          note.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
          note.tags.some((tag) =>
            tag.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    // Apply subject filter
    if (filterSubject !== "all") {
      filtered = filtered.filter((note) => note.subject === filterSubject);
    }

    // Apply status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter((note) => note.status === filterStatus);
    }

    // Apply visibility filter
    if (filterVisibility !== "all") {
      filtered = filtered.filter(
        (note) => note.visibility === filterVisibility
      );
    }

    setFilteredNotes(filtered);
  };

  const getUniqueSubjects = () => {
    const subjects = [...new Set(notes.map((note) => note.subject))];
    return subjects.sort();
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-8  rounded mb-6"></Skeleton>
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
      <Card>
        <CardContent className="p-6">
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

              <Select
                value={filterVisibility}
                onValueChange={setFilterVisibility}
              >
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
        </CardContent>
      </Card>

      {/* Notes Grid */}
      {filteredNotes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredNotes.map((note) => (
            <div key={note.id} className="relative group">
              <NoteCard note={note} />

              {/* Action buttons overlay */}
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8 w-8 p-0"
                  asChild
                >
                  <Link href={`/dashboard/notes/${note.id}/edit`}>
                    <Edit className="h-4 w-4" />
                  </Link>
                </Button>

                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                  onClick={() => {
                    // TODO: Implement delete functionality
                    console.log("Delete note:", note.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Status badge */}
              <div className="absolute top-4 left-4">
                <Badge
                  variant={
                    note.status === "published" ? "default" : "secondary"
                  }
                >
                  {note.status}
                </Badge>
              </div>
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
