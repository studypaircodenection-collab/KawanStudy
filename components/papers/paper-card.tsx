"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Download,
  Heart,
  MessageCircle,
  Eye,
  Calendar,
  User,
  Building,
  FileText,
  ExternalLink,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

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
  hasSolution: boolean;
  viewCount: number;
  downloadCount: number;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  userProfile: {
    id: string;
    username: string;
    fullName?: string;
    avatarUrl?: string;
  };
}

interface PaperCardProps {
  paper: Paper;
}

export function PaperCard({ paper }: PaperCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(paper.likeCount);
  const [isLiking, setIsLiking] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    checkLikeStatus();
  }, [paper.id]);

  const checkLikeStatus = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

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

  const handleLike = async () => {
    if (isLiking) return;

    setIsLiking(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatAcademicLevel = (level: string) => {
    return level.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Link
              href={`/dashboard/past-year/${paper.id}`}
              className="hover:underline"
            >
              <CardTitle className="text-lg line-clamp-2 mb-2">
                {paper.title}
              </CardTitle>
            </Link>

            <div className="flex flex-wrap gap-1 mb-3">
              <Badge variant="secondary" className="text-xs">
                {paper.subject
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {formatAcademicLevel(paper.academicLevel)}
              </Badge>
              <Badge
                className={`text-xs ${getDifficultyColor(
                  paper.difficultyLevel
                )}`}
              >
                {paper.difficultyLevel}
              </Badge>
              {paper.hasSolution && (
                <Badge variant="default" className="text-xs">
                  Has Solution
                </Badge>
              )}
            </div>
          </div>
        </div>

        {paper.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {paper.description}
          </p>
        )}

        {/* Course Info */}
        <div className="space-y-1 text-xs text-muted-foreground">
          {paper.courseCode && (
            <div className="flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              <span>{paper.courseCode}</span>
              {paper.courseName && <span>- {paper.courseName}</span>}
            </div>
          )}
          {paper.institution && (
            <div className="flex items-center gap-1">
              <Building className="h-3 w-3" />
              <span>{paper.institution}</span>
            </div>
          )}
          {paper.professor && (
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span>Prof. {paper.professor}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{paper.year}</span>
            {paper.semester && <span>- {paper.semester}</span>}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 flex-1 flex flex-col">
        {/* Tags */}
        {paper.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {paper.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {paper.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{paper.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{paper.viewCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <Download className="h-4 w-4" />
              <span>{paper.downloadCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              <span>{likeCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4" />
              <span>{paper.commentCount}</span>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={paper.userProfile.avatarUrl} />
              <AvatarFallback>
                {paper.userProfile.fullName?.[0] ||
                  paper.userProfile.username[0]}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">
              {paper.userProfile.fullName || paper.userProfile.username}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            {formatDate(paper.createdAt)}
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          <Button
            size="sm"
            variant="outline"
            onClick={handleLike}
            disabled={isLiking}
            className="flex-1"
          >
            <Heart
              className={`h-4 w-4 mr-1 ${isLiked ? "fill-current" : ""}`}
            />
            {isLiked ? "Liked" : "Like"}
          </Button>

          <Link href={`/dashboard/past-year/${paper.id}`} className="flex-1">
            <Button size="sm" className="w-full">
              <ExternalLink className="h-4 w-4 mr-1" />
              View
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
