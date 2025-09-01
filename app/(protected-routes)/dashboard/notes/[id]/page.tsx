"use client";

import React, { useState, useEffect } from "react";
import TextContentViewer from "@/components/text-viewer";
import PDFViewer from "@/components/pdf-viewer";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Download,
  Heart,
  Share2,
  BookOpen,
  User,
  GraduationCap,
  Building,
  Calendar,
  Tag,
  Globe,
  FileText,
  MessageCircle,
  Eye,
  Flag,
} from "lucide-react";
import { notesService } from "@/lib/services/notes";
import { useNoteUpload } from "@/hooks/use-notes";
import Link from "next/link";

interface NoteData {
  id: string;
  user_id: string;
  title: string;
  description: string;
  content?: string;
  content_type: "pdf" | "text";
  subject: string;
  topic?: string;
  academic_level: string;
  institution?: string;
  course?: string;
  professor?: string;
  semester?: string;
  note_type: string;
  tags: string[];
  language: string;
  difficulty_level: string;
  visibility: string;
  allow_download: boolean;
  allow_comments: boolean;
  source_type?: string;
  source_reference?: string;
  file_url?: string;
  estimated_read_time: number;
  view_count: number;
  download_count: number;
  like_count: number;
  created_at: string;
  updated_at: string;
  profiles: {
    id: string;
    username: string;
    full_name: string;
    avatar_url?: string;
  };
}

export default function NoteDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { likeNote, downloadNote } = useNoteUpload();

  const [note, setNote] = useState<NoteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(0);

  const noteId = params.id as string;

  useEffect(() => {
    const fetchNote = async () => {
      try {
        setLoading(true);
        const response = await notesService.getNoteById(noteId);
        setNote(response.note);
        setLikes(response.note.like_count || 0);
        setIsLiked(response.note.is_liked);
      } catch (err) {
        setError("Failed to load note");
        console.error("Error fetching note:", err);
      } finally {
        setLoading(false);
      }
    };

    if (noteId) {
      fetchNote();
    }
  }, [noteId]);

  const handleLike = async () => {
    try {
      const result = await likeNote(noteId);
      setIsLiked(result.liked);
      setLikes((prev) => (result.liked ? prev + 1 : prev - 1));
    } catch (error) {
      console.error("Error liking note:", error);
    }
  };

  const handleDownload = async () => {
    try {
      await downloadNote(noteId);
    } catch (error) {
      console.error("Error downloading note:", error);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="container mx-auto py-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error || "Note not found"}
          </h1>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDifficultyColor = (difficulty: string | undefined) => {
    if (!difficulty) return "bg-gray-100 text-gray-800";

    switch (difficulty.toLowerCase()) {
      case "easy":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "advanced":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format.toLowerCase()) {
      case "pdf":
        return <FileText className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto space-y-6">
      {/* Header with Navigation */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Notes
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Note Header */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <h1 className="text-2xl font-bold">{note.title}</h1>
                  <p className="text-muted-foreground">{note.description}</p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLike}
                    className={isLiked ? "text-red-600 border-red-200" : ""}
                  >
                    <Heart
                      className={`h-4 w-4 mr-1 ${
                        isLiked ? "fill-current" : ""
                      }`}
                    />
                    {likes}
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4 mr-1" />
                    Share
                  </Button>
                </div>
              </div>

              {/* Author Information */}
              <div className="flex items-center gap-3 pt-4">
                <Avatar>
                  <AvatarImage src={note.profiles.avatar_url} />
                  <AvatarFallback>
                    {note.profiles.full_name?.charAt(0) ||
                      note.profiles.username?.charAt(0) ||
                      "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {note.profiles.full_name || note.profiles.username}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    @{note.profiles.username}
                  </p>
                </div>
                <Separator orientation="vertical" className="h-8" />
                <div className="text-sm text-muted-foreground">
                  <p>Published {formatDate(note.created_at)}</p>
                  {note.updated_at !== note.created_at && (
                    <p>Updated {formatDate(note.updated_at)}</p>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Note Content Tabs */}
          <Card>
            <Tabs defaultValue="overview" className="w-full">
              <CardHeader>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                </TabsList>
              </CardHeader>

              <CardContent>
                <TabsContent value="overview" className="space-y-6 mt-0">
                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 rounded-lg bg-blue-50">
                      <Eye className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-blue-600">
                        {note.view_count?.toLocaleString() || 0}
                      </p>
                      <p className="text-xs text-blue-600">Views</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-green-50">
                      <Download className="h-6 w-6 text-green-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-green-600">
                        {note.download_count || 0}
                      </p>
                      <p className="text-xs text-green-600">Downloads</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-red-50">
                      <Heart className="h-6 w-6 text-red-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-red-600">{likes}</p>
                      <p className="text-xs text-red-600">Likes</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-purple-50">
                      <MessageCircle className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-purple-600">0</p>
                      <p className="text-xs text-purple-600">Comments</p>
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {note.tags.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          <Tag className="h-3 w-3" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Academic Information */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">
                        Academic Context
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Subject:
                          </span>
                          <Badge variant="outline">{note.subject}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Level:
                          </span>
                          <Badge variant="outline">
                            {note.academic_level?.replace("-", " ")}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Institution:
                          </span>
                          <span className="text-sm">
                            {note.institution || "Not specified"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3">
                        Course Information
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Course:
                          </span>
                          <span className="text-sm">
                            {note.course || "Not specified"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Professor:
                          </span>
                          <span className="text-sm">
                            {note.professor || "Not specified"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Semester:
                          </span>
                          <span className="text-sm">
                            {note.semester || "Not specified"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="content" className="mt-0">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Note Content</h3>
                      {note.allow_download && note.file_url && (
                        <Button
                          className="flex items-center gap-2"
                          onClick={handleDownload}
                        >
                          <Download className="h-4 w-4" />
                          Download {note.content_type.toUpperCase()}
                        </Button>
                      )}
                    </div>

                    {/* Mock PDF Viewer */}
                    {note.content_type === "pdf" && note.file_url ? (
                      <PDFViewer fileUrl={note.file_url} className="h-fit" />
                    ) : (
                      <TextContentViewer
                        content={note.content || note.description}
                      />
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="details" className="mt-0">
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Classification Details */}
                      <div>
                        <h3 className="text-lg font-semibold mb-3">
                          Classification
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground w-20">
                              Type:
                            </span>
                            <Badge variant="outline">
                              {note.note_type?.replace("-", " ")}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground w-20">
                              Format:
                            </span>
                            <Badge
                              variant="outline"
                              className="flex items-center gap-1"
                            >
                              {getFormatIcon(note.content_type)}
                              {note.content_type.toUpperCase()}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground w-20">
                              Language:
                            </span>
                            <Badge
                              variant="outline"
                              className="flex items-center gap-1"
                            >
                              <Globe className="h-3 w-3" />
                              {note.language?.replace("-", " ")}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground w-20">
                              Difficulty:
                            </span>
                            <Badge
                              className={getDifficultyColor(
                                note.difficulty_level
                              )}
                            >
                              {note.difficulty_level || "Not specified"}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Source & Attribution */}
                      <div>
                        <h3 className="text-lg font-semibold mb-3">
                          Source & Attribution
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground w-20">
                              Source:
                            </span>
                            <Badge variant="outline">{note.source_type}</Badge>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground block mb-1">
                              Reference:
                            </span>
                            <p className="text-sm">{note.source_reference}</p>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground block mb-1">
                              Topic:
                            </span>
                            <p className="text-sm">{note.topic}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Sharing & Permissions */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">
                        Sharing & Permissions
                      </h3>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Visibility:
                          </span>
                          <Badge
                            variant={
                              note.visibility === "public"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {note.visibility}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Download className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Downloads:
                          </span>
                          <Badge
                            variant={
                              note.allow_download ? "default" : "secondary"
                            }
                          >
                            {note.allow_download ? "Allowed" : "Restricted"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <MessageCircle className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Comments:
                          </span>
                          <Badge
                            variant={
                              note.allow_comments ? "default" : "secondary"
                            }
                          >
                            {note.allow_comments ? "Enabled" : "Disabled"}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Metadata</h3>
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">
                            Created:
                          </span>
                          <p>{formatDate(note.created_at)}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Last Updated:
                          </span>
                          <p>{formatDate(note.updated_at)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {note.allow_download && (
                <Button className="w-full justify-start" variant="default">
                  <Download className="h-4 w-4 mr-2" />
                  Download {note.content_type.toUpperCase()}
                </Button>
              )}
              <Button className="w-full justify-start" variant="outline">
                <Share2 className="h-4 w-4 mr-2" />
                Share Note
              </Button>
              <Separator />
              <Button
                className="w-full justify-start"
                variant="ghost"
                size="sm"
                asChild
              >
                <Link href={`/dashboard/feedback`}>
                  <Flag className="h-4 w-4 mr-2" />
                  Report Issue
                </Link>
              </Button>
            </CardContent>
          </Card>
          {/* Author Profile */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">About the Author</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={note.profiles.avatar_url} />
                  <AvatarFallback>
                    {note.profiles.full_name?.charAt(0) ||
                      note.profiles.username?.charAt(0) ||
                      "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {note.profiles.full_name || note.profiles.username}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    @{note.profiles.username}
                  </p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Notes shared:</span>
                  <span className="font-medium">47</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total likes:</span>
                  <span className="font-medium">1,234</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Joined:</span>
                  <span className="font-medium">Jan 2024</span>
                </div>
              </div>
              <Button className="w-full mt-4" variant="outline" asChild>
                <Link href={`/dashboard/profile/${note.profiles.username}`}>
                  <User className="h-4 w-4 mr-2" />
                  View Profile
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
