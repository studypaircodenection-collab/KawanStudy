"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Heart,
  Share2,
  Download,
  Eye,
  MessageCircle,
  Tag,
  BookOpen,
  GraduationCap,
  Building,
  FileText,
  User,
  Calendar,
  Globe,
  Copy,
  Mail,
  Twitter,
  Facebook,
  Linkedin,
  Flag,
  Edit,
  Target,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import PDFViewer from "@/components/pdf-viewer";

interface PaperData {
  id: string;
  title: string;
  description: string;
  subject: string;
  academicLevel: string;
  year: number;
  institution: string;
  courseCode: string;
  courseName: string;
  professor: string;
  semester: string;
  tags: string[];
  paperType: string;
  language: string;
  difficultyLevel: string;
  questionFileName: string;
  questionFileUrl: string;
  solutionFileName?: string;
  solutionFileUrl?: string;
  hasSolution: boolean;
  visibility: string;
  allowDownload: boolean;
  allowComments: boolean;
  sourceAttribution: string;
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
  isLiked?: boolean;
}

export default function PaperPage() {
  const params = useParams();
  const router = useRouter();
  const [paper, setPaper] = useState<PaperData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const paperId = params.id as string;

  useEffect(() => {
    const fetchPaper = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/papers/${paperId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError("Paper not found");
          } else if (response.status === 403) {
            setError("Access denied");
          } else {
            setError("Failed to load paper");
          }
          return;
        }

        const result = await response.json();
        setPaper(result.paper);
        setLikes(result.paper.likeCount || 0);
        setIsLiked(result.paper.isLiked || false);
      } catch (err) {
        setError("Failed to load paper");
        console.error("Error fetching paper:", err);
      } finally {
        setLoading(false);
      }
    };

    const getCurrentUser = async () => {
      try {
        const response = await fetch('/api/auth/user');
        if (response.ok) {
          const { user } = await response.json();
          setCurrentUser(user);
        }
      } catch (error) {
        console.error("Error fetching current user:", error);
      }
    };

    if (paperId) {
      fetchPaper();
      getCurrentUser();
    }
  }, [paperId]);

  const handleLike = async () => {
    try {
      const response = await fetch(`/api/papers/${paperId}/like`, {
        method: 'POST',
      });
      
      if (response.ok) {
        const result = await response.json();
        setIsLiked(result.liked);
        setLikes(result.likeCount);
      }
    } catch (error) {
      console.error("Error liking paper:", error);
      toast.error("Failed to like paper");
    }
  };

  const handleDownload = async () => {
    try {
      // Trigger download
      if (paper?.questionFileUrl) {
        const link = document.createElement('a');
        link.href = paper.questionFileUrl;
        link.download = paper.questionFileName || 'exam-paper.pdf';
        link.click();
        
        // Track download
        await fetch(`/api/papers/${paperId}/download`, {
          method: 'POST',
        });
        
        toast.success("Download started!");
      }
    } catch (error) {
      console.error("Error downloading paper:", error);
      toast.error("Failed to download paper");
    }
  };

  // Share functionality
  const copyToClipboard = async () => {
    try {
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Check out this exam paper: ${paper?.title}`);
    const body = encodeURIComponent(
      `I found this exam paper on StudyPair:\n\n${paper?.title}\n${paper?.description}\n\n${window.location.href}`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const shareOnTwitter = () => {
    const text = encodeURIComponent(`Check out this exam paper: ${paper?.title}`);
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
    const title = encodeURIComponent(paper?.title || '');
    const summary = encodeURIComponent(paper?.description || '');
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
          title: paper?.title,
          text: paper?.description,
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

  if (error || !paper) {
    return (
      <div className="container mx-auto py-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error || "Paper not found"}
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
          Back to Papers
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Paper Content Tabs */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <h1 className="text-2xl font-bold">{paper.title}</h1>
                  <p className="text-muted-foreground">{paper.description}</p>
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
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Share2 className="h-4 w-4 mr-1" />
                        Share
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuLabel>Share this paper</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {typeof window !== "undefined" &&
                        "share" in navigator && (
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
                </div>
              </div>
            </CardHeader>
            <Tabs defaultValue="overview" className="w-full">
              <CardHeader>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="content">Exam Paper</TabsTrigger>
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
                        {paper.viewCount?.toLocaleString() || 0}
                      </p>
                      <p className="text-xs text-blue-600">Views</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-green-50">
                      <Download className="h-6 w-6 text-green-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-green-600">
                        {paper.downloadCount || 0}
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
                      <p className="text-2xl font-bold text-purple-600">
                        {paper.commentCount || 0}
                      </p>
                      <p className="text-xs text-purple-600">Comments</p>
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {paper.tags?.map((tag, index) => (
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
                          <Badge variant="outline">{paper.subject}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Level:
                          </span>
                          <Badge variant="outline">{paper.academicLevel}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Institution:
                          </span>
                          <span className="text-sm">{paper.institution}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Difficulty:
                          </span>
                          <Badge className={getDifficultyColor(paper.difficultyLevel)}>
                            {paper.difficultyLevel}
                          </Badge>
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
                            {paper.courseCode} - {paper.courseName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Professor:
                          </span>
                          <span className="text-sm">{paper.professor}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Semester:
                          </span>
                          <span className="text-sm">
                            {paper.semester} {paper.year}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Paper Type:
                          </span>
                          <Badge variant="outline">{paper.paperType}</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="content" className="mt-0">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Exam Paper</h3>
                      <div className="flex items-center gap-2">
                        {paper.allowDownload && paper.questionFileUrl && (
                          <Button
                            className="flex items-center gap-2"
                            onClick={handleDownload}
                          >
                            <Download className="h-4 w-4" />
                            Download PDF
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* PDF Viewer with Tabs */}
                    <div className="space-y-4">
                      <Tabs defaultValue="question" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="question">Question Paper</TabsTrigger>
                          <TabsTrigger 
                            value="solution" 
                            disabled={!paper.hasSolution}
                          >
                            Solution {!paper.hasSolution && "(Not Available)"}
                          </TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="question" className="mt-4">
                          {paper.questionFileUrl ? (
                            <PDFViewer 
                              fileUrl={paper.questionFileUrl} 
                              className="h-[600px] w-full" 
                            />
                          ) : (
                            <div className="flex items-center justify-center h-[400px] bg-gray-50 rounded-lg">
                              <div className="text-center">
                                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500">Question paper not available</p>
                              </div>
                            </div>
                          )}
                        </TabsContent>
                        
                        <TabsContent value="solution" className="mt-4">
                          {paper.hasSolution && paper.solutionFileUrl ? (
                            <PDFViewer 
                              fileUrl={paper.solutionFileUrl} 
                              className="h-[600px] w-full" 
                            />
                          ) : (
                            <div className="flex items-center justify-center h-[400px] bg-gray-50 rounded-lg">
                              <div className="text-center">
                                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500">Solution not available</p>
                              </div>
                            </div>
                          )}
                        </TabsContent>
                      </Tabs>
                    </div>
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
                            <Badge variant="outline">{paper.paperType}</Badge>
                            <span className="text-sm text-muted-foreground">Paper Type</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{paper.language}</Badge>
                            <span className="text-sm text-muted-foreground">Language</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getDifficultyColor(paper.difficultyLevel)}>
                              {paper.difficultyLevel}
                            </Badge>
                            <span className="text-sm text-muted-foreground">Difficulty</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{paper.sourceType}</Badge>
                            <span className="text-sm text-muted-foreground">Source Type</span>
                          </div>
                        </div>
                      </div>

                      {/* Source & Attribution */}
                      <div>
                        <h3 className="text-lg font-semibold mb-3">
                          Source & Attribution
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <span className="text-sm text-muted-foreground">Attribution:</span>
                            <p className="text-sm">{paper.sourceAttribution}</p>
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
                          <Badge variant="outline">{paper.visibility}</Badge>
                          <span className="text-sm text-muted-foreground">Visibility</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Download className="h-4 w-4 text-muted-foreground" />
                          <Badge variant={paper.allowDownload ? "default" : "secondary"}>
                            {paper.allowDownload ? "Allowed" : "Restricted"}
                          </Badge>
                          <span className="text-sm text-muted-foreground">Download</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MessageCircle className="h-4 w-4 text-muted-foreground" />
                          <Badge variant={paper.allowComments ? "default" : "secondary"}>
                            {paper.allowComments ? "Enabled" : "Disabled"}
                          </Badge>
                          <span className="text-sm text-muted-foreground">Comments</span>
                        </div>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Metadata</h3>
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Created:</span>
                          <p>{formatDate(paper.createdAt)}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Updated:</span>
                          <p>{formatDate(paper.updatedAt)}</p>
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
              {paper?.allowDownload && (
                <Button
                  className="w-full justify-start"
                  variant="default"
                  onClick={handleDownload}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="w-full justify-start" variant="outline">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Paper
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Share this paper</DropdownMenuLabel>
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
              <CardTitle className="text-lg">About the Contributor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={paper?.userProfile?.avatarUrl} />
                  <AvatarFallback>
                    {paper?.userProfile?.fullName?.charAt(0) ||
                      paper?.userProfile?.username?.charAt(0) ||
                      "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {paper.userProfile?.fullName || paper.userProfile?.username}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    @{paper.userProfile?.username}
                  </p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Papers shared:</span>
                  <span className="font-medium">12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total likes:</span>
                  <span className="font-medium">348</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Joined:</span>
                  <span className="font-medium">Jan 2024</span>
                </div>
              </div>
              <Button className="w-full mt-4" variant="outline" asChild>
                <Link href={`/dashboard/profile/${paper.userProfile?.username}`}>
                  <User className="h-4 w-4 mr-2" />
                  View Profile
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Study Tips */}
          <Card className="bg-gradient-to-br from-blue-50 to-green-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-800">Exam Tip</span>
              </div>
              <p className="text-sm text-blue-700">
                "Practice with past papers under timed conditions. This helps
                you manage time effectively during actual exams!"
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
