"use client";

import React, { useState } from "react";
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
  Clock,
  User,
  GraduationCap,
  Building,
  Calendar,
  Tag,
  Globe,
  FileText,
  Star,
  MessageCircle,
  Eye,
  ThumbsUp,
  Flag,
  Edit
} from "lucide-react";
import { Note } from "@/lib/types";

export default function NoteDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(342);

  // Mock note data with all Note interface properties
  const mockNote: Note & {
    id: string;
    createdAt: string;
    updatedAt: string;
    userId: string;
    author: {
      id: string;
      username: string;
      full_name: string;
      avatar_url: string;
      university: string;
    };
    stats: {
      views: number;
      downloads: number;
      likes: number;
      comments: number;
    };
  } = {
    // From Note interface
    id: params?.id as string || "mock-note-123",
    title: "Advanced Calculus Integration Techniques",
    description: "Comprehensive notes covering advanced integration methods including substitution, integration by parts, partial fractions, and trigonometric substitutions. Includes worked examples and practice problems.",
    
    // Academic Context
    subject: "Mathematics",
    topic: "Calculus - Integration",
    academicLevel: "Undergraduate",
    institution: "Universiti Teknologi MARA (UiTM)",
    course: "MAT183 - Calculus II",
    professor: "Dr. Ahmad bin Hassan",
    semester: "Semester 2, 2024/2025",
    
    // Classification
    noteType: "Lecture Notes",
    tags: ["calculus", "integration", "mathematics", "derivatives", "advanced-math", "exam-prep"],
    language: "English",
    format: "PDF",
    difficulty: "Advanced",
    
    // Source & Attribution
    sourceType: "Original Content",
    sourceReference: "Based on MAT183 lecture series and Calculus by James Stewart (8th Edition)",
    
    // Sharing & Permissions
    sharingOption: "Public",
    allowDownload: true,
    allowComments: true,
    
    // Metadata
    estimatedReadTime: 45,
    textContent: "This comprehensive guide covers advanced integration techniques...",
    
    // Additional mock data
    createdAt: "2024-08-15T10:30:00Z",
    updatedAt: "2024-08-20T14:45:00Z",
    userId: "user-123",
    author: {
      id: "user-123",
      username: "mathwhiz2024",
      full_name: "Sarah Ahmad",
      avatar_url: "/api/placeholder/40/40",
      university: "UiTM Shah Alam"
    },
    stats: {
      views: 1247,
      downloads: 342,
      likes: 89,
      comments: 23
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes(prev => isLiked ? prev - 1 : prev + 1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDifficultyColor = (difficulty: string | undefined) => {
    if (!difficulty) return 'bg-gray-100 text-gray-800';
    
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format.toLowerCase()) {
      case 'pdf':
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
                  <h1 className="text-2xl font-bold">{mockNote.title}</h1>
                  <p className="text-muted-foreground">{mockNote.description}</p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLike}
                    className={isLiked ? "text-red-600 border-red-200" : ""}
                  >
                    <Heart className={`h-4 w-4 mr-1 ${isLiked ? "fill-current" : ""}`} />
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
                  <AvatarImage src={mockNote.author.avatar_url} />
                  <AvatarFallback>{mockNote.author.full_name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{mockNote.author.full_name}</p>
                  <p className="text-sm text-muted-foreground">@{mockNote.author.username}</p>
                </div>
                <Separator orientation="vertical" className="h-8" />
                <div className="text-sm text-muted-foreground">
                  <p>Published {formatDate(mockNote.createdAt)}</p>
                  {mockNote.updatedAt !== mockNote.createdAt && (
                    <p>Updated {formatDate(mockNote.updatedAt)}</p>
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
                      <p className="text-2xl font-bold text-blue-600">{mockNote.stats.views.toLocaleString()}</p>
                      <p className="text-xs text-blue-600">Views</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-green-50">
                      <Download className="h-6 w-6 text-green-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-green-600">{mockNote.stats.downloads}</p>
                      <p className="text-xs text-green-600">Downloads</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-red-50">
                      <Heart className="h-6 w-6 text-red-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-red-600">{likes}</p>
                      <p className="text-xs text-red-600">Likes</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-purple-50">
                      <MessageCircle className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-purple-600">{mockNote.stats.comments}</p>
                      <p className="text-xs text-purple-600">Comments</p>
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {mockNote.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          <Tag className="h-3 w-3" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Academic Information */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Academic Context</h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Subject:</span>
                          <Badge variant="outline">{mockNote.subject}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Level:</span>
                          <Badge variant="outline">{mockNote.academicLevel}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Institution:</span>
                          <span className="text-sm">{mockNote.institution}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Course Information</h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Course:</span>
                          <span className="text-sm">{mockNote.course}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Professor:</span>
                          <span className="text-sm">{mockNote.professor}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Semester:</span>
                          <span className="text-sm">{mockNote.semester}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="content" className="mt-0">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Note Content</h3>
                      {mockNote.allowDownload && (
                        <Button className="flex items-center gap-2">
                          <Download className="h-4 w-4" />
                          Download {mockNote.format}
                        </Button>
                      )}
                    </div>
                    
                    {/* Mock PDF Viewer */}
                    <div className="border rounded-lg p-8 bg-gray-50 text-center">
                      <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">PDF Content Preview</p>
                      <p className="text-sm text-gray-500 max-w-2xl mx-auto">
                        {mockNote.textContent}
                      </p>
                      <p className="text-xs text-gray-400 mt-4">
                        Estimated reading time: {mockNote.estimatedReadTime} minutes
                      </p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="details" className="mt-0">
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Classification Details */}
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Classification</h3>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground w-20">Type:</span>
                            <Badge variant="outline">{mockNote.noteType}</Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground w-20">Format:</span>
                            <Badge variant="outline" className="flex items-center gap-1">
                              {getFormatIcon(mockNote.format)}
                              {mockNote.format}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground w-20">Language:</span>
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Globe className="h-3 w-3" />
                              {mockNote.language}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground w-20">Difficulty:</span>
                            <Badge className={getDifficultyColor(mockNote.difficulty)}>
                              {mockNote.difficulty || 'Not specified'}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Source & Attribution */}
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Source & Attribution</h3>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground w-20">Source:</span>
                            <Badge variant="outline">{mockNote.sourceType}</Badge>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground block mb-1">Reference:</span>
                            <p className="text-sm">{mockNote.sourceReference}</p>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground block mb-1">Topic:</span>
                            <p className="text-sm">{mockNote.topic}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Sharing & Permissions */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Sharing & Permissions</h3>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Visibility:</span>
                          <Badge variant={mockNote.sharingOption === 'Public' ? 'default' : 'secondary'}>
                            {mockNote.sharingOption}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Download className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Downloads:</span>
                          <Badge variant={mockNote.allowDownload ? 'default' : 'secondary'}>
                            {mockNote.allowDownload ? 'Allowed' : 'Restricted'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <MessageCircle className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Comments:</span>
                          <Badge variant={mockNote.allowComments ? 'default' : 'secondary'}>
                            {mockNote.allowComments ? 'Enabled' : 'Disabled'}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Metadata</h3>
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Note ID:</span>
                          <p className="font-mono text-xs">{mockNote.id}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Author ID:</span>
                          <p className="font-mono text-xs">{mockNote.userId}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Created:</span>
                          <p>{formatDate(mockNote.createdAt)}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Last Updated:</span>
                          <p>{formatDate(mockNote.updatedAt)}</p>
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
              {mockNote.allowDownload && (
                <Button className="w-full justify-start" variant="default">
                  <Download className="h-4 w-4 mr-2" />
                  Download {mockNote.format}
                </Button>
              )}
              <Button className="w-full justify-start" variant="outline">
                <Share2 className="h-4 w-4 mr-2" />
                Share Note
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <ThumbsUp className="h-4 w-4 mr-2" />
                Rate & Review
              </Button>
              <Separator />
              <Button className="w-full justify-start" variant="ghost" size="sm">
                <Flag className="h-4 w-4 mr-2" />
                Report Issue
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
                  <AvatarImage src={mockNote.author.avatar_url} />
                  <AvatarFallback>{mockNote.author.full_name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{mockNote.author.full_name}</p>
                  <p className="text-sm text-muted-foreground">{mockNote.author.university}</p>
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
              <Button className="w-full mt-4" variant="outline">
                <User className="h-4 w-4 mr-2" />
                View Profile
              </Button>
            </CardContent>
          </Card>

          {/* Related Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Related Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { title: "Differential Equations Basics", subject: "Mathematics", likes: 156 },
                { title: "Linear Algebra Concepts", subject: "Mathematics", likes: 98 },
                { title: "Statistics and Probability", subject: "Mathematics", likes: 203 }
              ].map((relatedNote, index) => (
                <div key={index} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{relatedNote.title}</p>
                    <p className="text-xs text-muted-foreground">{relatedNote.subject}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="h-3 w-3 text-red-500" />
                    <span className="text-xs">{relatedNote.likes}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
