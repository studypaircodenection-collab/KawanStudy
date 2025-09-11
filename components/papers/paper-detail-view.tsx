"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PDFViewer from "@/components/pdf-viewer";

import {
  Download,
  Heart,
  MessageCircle,
  Eye,
  Calendar,
  User,
  Building,
  FileText,
  BookOpen,
  Loader2,
  Send,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/constant";

interface Paper {
  id: string;
  title: string;
  description?: string;
  subject: string;
  academicLevel: string;
  year: number;
  institution?: string;
  courseCode?: string;
  courseName?: string;
  professor?: string;
  semester?: string;
  tags: string[];
  paperType?: string;
  language: string;
  difficultyLevel: string;
  questionFileName?: string;
  questionFileUrl?: string;
  solutionFileName?: string;
  solutionFileUrl?: string;
  hasSolution: boolean;
  allowDownload: boolean;
  allowComments: boolean;
  sourceAttribution?: string;
  sourceType: string;
  viewCount: number;
  downloadCount: number;
  likeCount: number;
  commentCount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  userProfile: {
    id: string;
    username: string;
    fullName?: string;
    avatarUrl?: string;
  };
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  userProfile: {
    id: string;
    username: string;
    fullName?: string;
    avatarUrl?: string;
  };
}

interface PaperDetailViewProps {
  paper: Paper;
}

export function PaperDetailView({ paper }: PaperDetailViewProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(paper.likeCount);
  const [isLiking, setIsLiking] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    getCurrentUser();
    checkLikeStatus();
    if (paper.allowComments) {
      loadComments();
    }
  }, [paper.id]);

  const getCurrentUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setCurrentUser(user);
  };

  const checkLikeStatus = async () => {
    try {
      const response = await fetch(`/api/papers/${paper.id}/like`);
      if (response.ok) {
        const data = await response.json();
        setIsLiked(data.liked);
        setLikeCount(data.likeCount);
      }
    } catch (error) {
      console.error("Error checking like status:", error);
    }
  };

  const loadComments = async () => {
    setIsLoadingComments(true);
    try {
      const response = await fetch(`/api/papers/${paper.id}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments);
      }
    } catch (error) {
      console.error("Error loading comments:", error);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleLike = async () => {
    if (isLiking) return;

    setIsLiking(true);
    try {
      if (!currentUser) {
        toast.error("Please login to like papers");
        return;
      }

      const response = await fetch(`/api/papers/${paper.id}/like`, {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        setIsLiked(data.liked);
        setLikeCount((prev) => (data.liked ? prev + 1 : prev - 1));
        toast.success(data.message);
      } else {
        throw new Error("Failed to update like");
      }
    } catch (error) {
      console.error("Error liking paper:", error);
      toast.error("Failed to update like");
    } finally {
      setIsLiking(false);
    }
  };

  const handleDownload = async (fileType: "question" | "solution") => {
    try {
      if (!currentUser) {
        toast.error("Please login to download papers");
        return;
      }

      const response = await fetch(`/api/papers/${paper.id}/download`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fileType }),
      });

      if (response.ok) {
        const data = await response.json();
        // Open download URL in new tab
        window.open(data.downloadUrl, "_blank");
        toast.success("Download started");
      } else {
        const error = await response.json();
        toast.error(error.error || "Download failed");
      }
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Download failed");
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmittingComment(true);
    try {
      if (!currentUser) {
        toast.error("Please login to comment");
        return;
      }

      const response = await fetch(`/api/papers/${paper.id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: newComment }),
      });

      if (response.ok) {
        const data = await response.json();
        setComments((prev) => [data.comment, ...prev]);
        setNewComment("");
        toast.success("Comment added");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to add comment");
      }
    } catch (error) {
      console.error("Comment error:", error);
      toast.error("Failed to add comment");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "hard":
        return "bg-orange-100 text-orange-800";
      case "expert":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatAcademicLevel = (level: string) => {
    return level.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      {/* Paper Header */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-2xl mb-3">{paper.title}</CardTitle>

              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="secondary">
                  {paper.subject
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </Badge>
                <Badge variant="outline">
                  {formatAcademicLevel(paper.academicLevel)}
                </Badge>
                <Badge className={getDifficultyColor(paper.difficultyLevel)}>
                  {paper.difficultyLevel}
                </Badge>
                {paper.hasSolution && (
                  <Badge variant="default">Has Solution</Badge>
                )}
                {paper.paperType && (
                  <Badge variant="outline">
                    {paper.paperType
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </Badge>
                )}
              </div>

              {paper.description && (
                <p className="text-muted-foreground mb-4">
                  {paper.description}
                </p>
              )}

              {/* Course Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground mb-4">
                {paper.courseCode && (
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    <span>{paper.courseCode}</span>
                    {paper.courseName && <span>- {paper.courseName}</span>}
                  </div>
                )}
                {paper.institution && (
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    <span>{paper.institution}</span>
                  </div>
                )}
                {paper.professor && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>Prof. {paper.professor}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{paper.year}</span>
                  {paper.semester && <span>- {paper.semester}</span>}
                </div>
              </div>

              {/* Tags */}
              {paper.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {paper.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Stats */}
              <div className="flex items-center gap-6 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{paper.viewCount} views</span>
                </div>
                <div className="flex items-center gap-1">
                  <Download className="h-4 w-4" />
                  <span>{paper.downloadCount} downloads</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="h-4 w-4" />
                  <span>{likeCount} likes</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" />
                  <span>{paper.commentCount} comments</span>
                </div>
              </div>

              {/* Author */}
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={paper.userProfile.avatarUrl} />
                  <AvatarFallback>
                    {paper.userProfile.fullName?.[0] ||
                      paper.userProfile.username[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {paper.userProfile.fullName || paper.userProfile.username}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Uploaded on {formatDate(paper.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Paper Preview */}
      {(paper.questionFileUrl ||
        (paper.hasSolution && paper.solutionFileUrl)) && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Paper Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs
              defaultValue={paper.questionFileUrl ? "question" : "solution"}
              className="w-full"
            >
              <TabsList
                className={`grid w-full ${
                  paper.questionFileUrl &&
                  paper.hasSolution &&
                  paper.solutionFileUrl
                    ? "grid-cols-2"
                    : "grid-cols-1"
                }`}
              >
                {paper.questionFileUrl && (
                  <TabsTrigger
                    value="question"
                    className="flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    Question Paper
                  </TabsTrigger>
                )}
                {paper.hasSolution && paper.solutionFileUrl && (
                  <TabsTrigger
                    value="solution"
                    className="flex items-center gap-2"
                  >
                    <BookOpen className="h-4 w-4" />
                    Solution
                  </TabsTrigger>
                )}
              </TabsList>

              {paper.questionFileUrl && (
                <TabsContent value="question" className="mt-6">
                  <PDFViewer
                    fileUrl={paper.questionFileUrl}
                    title={`${paper.title} - Question Paper`}
                    onDownload={
                      paper.allowDownload
                        ? () => handleDownload("question")
                        : undefined
                    }
                  />
                </TabsContent>
              )}

              {paper.hasSolution && paper.solutionFileUrl && (
                <TabsContent value="solution" className="mt-6">
                  <PDFViewer
                    fileUrl={paper.solutionFileUrl}
                    title={`${paper.title} - Solution`}
                    onDownload={
                      paper.allowDownload
                        ? () => handleDownload("solution")
                        : undefined
                    }
                  />
                </TabsContent>
              )}
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Actions and Downloads */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <Button
              onClick={handleLike}
              disabled={isLiking}
              variant={isLiked ? "default" : "outline"}
            >
              <Heart
                className={`h-4 w-4 mr-2 ${isLiked ? "fill-current" : ""}`}
              />
              {isLiked ? "Liked" : "Like"} ({likeCount})
            </Button>

            {paper.allowDownload && paper.questionFileUrl && (
              <Button onClick={() => handleDownload("question")}>
                <Download className="h-4 w-4 mr-2" />
                Download Question Paper
              </Button>
            )}

            {paper.allowDownload &&
              paper.hasSolution &&
              paper.solutionFileUrl && (
                <Button
                  onClick={() => handleDownload("solution")}
                  variant="outline"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Solution
                </Button>
              )}
          </div>
        </CardContent>
      </Card>

      {/* Comments Section */}
      {paper.allowComments && (
        <Card>
          <CardHeader>
            <CardTitle>Comments ({paper.commentCount})</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Add Comment Form */}
            {currentUser ? (
              <form onSubmit={handleSubmitComment} className="mb-6">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="mb-3"
                  rows={3}
                />
                <Button
                  type="submit"
                  disabled={isSubmittingComment || !newComment.trim()}
                >
                  {isSubmittingComment ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Post Comment
                </Button>
              </form>
            ) : (
              <div className="mb-6 p-4 bg-muted rounded-lg text-center">
                <p className="text-muted-foreground">
                  <Link
                    href="/auth/login"
                    className="text-primary hover:underline"
                  >
                    Login
                  </Link>{" "}
                  to post comments
                </p>
              </div>
            )}

            <Separator className="mb-6" />

            {/* Comments List */}
            {isLoadingComments ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : comments.length === 0 ? (
              <p className="text-muted-foreground text-center py-6">
                No comments yet. Be the first to comment!
              </p>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.userProfile.avatarUrl} />
                      <AvatarFallback>
                        {comment.userProfile.fullName?.[0] ||
                          comment.userProfile.username[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">
                          {comment.userProfile.fullName ||
                            comment.userProfile.username}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
