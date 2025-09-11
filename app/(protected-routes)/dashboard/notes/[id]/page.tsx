"use client";

import React, { useState, useEffect } from "react";
import TextContentViewer from "@/components/text-viewer";
import PDFViewer from "@/components/pdf-viewer";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CustomizedAvatar } from "@/components/ui/customized-avatar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
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
  Edit,
  Copy,
  Mail,
  Twitter,
  Facebook,
  Linkedin,
} from "lucide-react";
import { notesService } from "@/lib/services/notes";
import { useNoteUpload } from "@/hooks/use-notes";
import CommentSection from "@/components/notes/comment-section";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

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
  const supabase = createClient();

  const [note, setNote] = useState<NoteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [currentUser, setCurrentUser] = useState<any>(null);

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

    const getCurrentUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCurrentUser(user);
    };

    if (noteId) {
      fetchNote();
      getCurrentUser();
    }
  }, [noteId, supabase.auth]);

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

  // Share functionality
  const copyToClipboard = async () => {
    try {
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy link");
      console.error("Error copying to clipboard:", error);
    }
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Check out this note: ${note.title}`);
    const body = encodeURIComponent(
      `I found this interesting note on KawanStudy:\n\n${note.title}\n${note.description}\n\n${window.location.href}`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const shareOnTwitter = () => {
    const text = encodeURIComponent(`Check out this note: ${note.title}`);
    const url = encodeURIComponent(window.location.href);
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      "_blank"
    );
  };

  const shareOnFacebook = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      "_blank"
    );
  };

  const shareOnLinkedIn = () => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(note.title);
    const summary = encodeURIComponent(note.description);
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${url}&title=${title}&summary=${summary}`,
      "_blank"
    );
  };

  const shareNative = async () => {
    if (
      typeof window !== "undefined" &&
      "share" in navigator &&
      navigator.share
    ) {
      try {
        await navigator.share({
          title: note.title,
          text: note.description,
          url: window.location.href,
        });
        toast.success("Shared successfully!");
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          toast.error("Failed to share");
        }
      }
    } else {
      copyToClipboard();
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

      <div className="grid gap-6 xl:grid-cols-3">
        {/* Main Content */}
        <div className="xl:col-span-2 space-y-6">
          {/* Note Content Tabs */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <h1 className="text-2xl font-bold">{note.title}</h1>
                  <p className="text-muted-foreground">{note.description}</p>
                </div>
              </div>
            </CardHeader>
            <Tabs defaultValue="overview" className="w-full">
              <CardHeader>
                <TabsList className="grid w-full grid-cols-2 bg-background">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="content">Content</TabsTrigger>
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
                      <div className="flex items-center gap-2">
                        {/* Edit button - only show for note owner */}
                        {currentUser && note.user_id === currentUser.id && (
                          <Button
                            variant="outline"
                            className="flex items-center gap-2"
                            onClick={() =>
                              router.push(`/dashboard/notes/${noteId}/edit`)
                            }
                          >
                            <Edit className="h-4 w-4" />
                            Edit Note
                          </Button>
                        )}
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
              </CardContent>
            </Tabs>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader className="flex justify-between items-center gap-2">
              <CardTitle className="text-lg">Quick Actions</CardTitle>
              <div className="flex items-center gap-2 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLike}
                  className={isLiked ? "text-red-600 border-red-200" : ""}
                >
                  <Heart
                    className={`h-4 w-4 mr-1 ${isLiked ? "fill-current" : ""}`}
                  />
                  {likes}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {note.allow_download && (
                <Button className="w-full justify-start" variant="default">
                  <Download className="h-4 w-4 mr-2" />
                  Download {note.content_type.toUpperCase()}
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="w-full justify-start" variant="outline">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Note
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Share this note</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {typeof window !== "undefined" && "share" in navigator && (
                    <>
                      <DropdownMenuItem onClick={shareNative}>
                        <Share2 className="h-4 w-4 mr-2" />
                        Share...
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem onClick={copyToClipboard}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy link
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={shareViaEmail}>
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={shareOnTwitter}>
                    <Twitter className="h-4 w-4 mr-2" />
                    Twitter
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={shareOnFacebook}>
                    <Facebook className="h-4 w-4 mr-2" />
                    Facebook
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={shareOnLinkedIn}>
                    <Linkedin className="h-4 w-4 mr-2" />
                    LinkedIn
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
                <CustomizedAvatar
                  src={note.profiles.avatar_url}
                  userId={note.profiles.id}
                  size="md"
                />
                <div>
                  <Link
                    href={`/dashboard/profile/${note.profiles.username}`}
                    className="font-medium hover:underline"
                  >
                    {note.profiles.full_name || note.profiles.username}
                  </Link>
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
            </CardContent>
          </Card>
          {/* Comment Section */}
          <CommentSection
            noteId={note.id}
            allowComments={note.allow_comments}
          />
        </div>
      </div>
    </div>
  );
}
