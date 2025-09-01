"use client";

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
  BookOpen,
  Clock,
  Calendar,
  Eye,
  Heart,
  Download,
  Globe,
  GraduationCap,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { ImageIcon } from "lucide-react";
import Image from "next/image";

interface NoteCardData {
  id: string;
  title: string;
  description: string;
  subject: string;
  noteType: string;
  tags: string[];
  createdAt: string;
  estimatedReadTime: number;
  viewCount?: number;
  downloadCount?: number;
  likeCount?: number;
  thumbnailUrl?: string;
  academicLevel?: string;
  language?: string;
  difficultyLevel?: string;
  institution?: string;
  userProfile?: {
    id: string;
    username: string;
    fullName: string;
    avatarUrl: string;
  };
}
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatCount = (count?: number) => {
  if (!count) return "0";
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return count.toString();
};

const getDifficultyColor = (difficulty?: string) => {
  if (!difficulty)
    return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200";

  switch (difficulty.toLowerCase()) {
    case "beginner":
    case "easy":
      return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700";
    case "intermediate":
    case "medium":
      return "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-700";
    case "advanced":
    case "hard":
      return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-700";
    default:
      return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600";
  }
};

const formatAcademicLevel = (level?: string) => {
  if (!level) return "";
  return level.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase());
};

const formatLanguage = (language?: string) => {
  if (!language) return "";
  switch (language.toLowerCase()) {
    case "bahasa-malaysia":
      return "Bahasa Malaysia";
    case "english":
      return "English";
    case "chinese":
      return "Chinese";
    case "tamil":
      return "Tamil";
    default:
      return language.charAt(0).toUpperCase() + language.slice(1);
  }
};

const NoteCard = ({ note }: { note: NoteCardData }) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/dashboard/notes/${note.id}`);
  };

  return (
    <Card
      key={note.id}
      onClick={handleClick}
      className="pt-0 group transition-all duration-300 cursor-pointer border-0 bg-white dark:bg-gray-900 overflow-hidden"
    >
      {/* Header Image */}
      <CardHeader className="h-fit p-0 relative overflow-hidden">
        <div className="aspect-[16/9] w-full bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center relative">
          {note.thumbnailUrl ? (
            <Image
              src={note.thumbnailUrl}
              alt={note.title}
              width={400}
              height={225}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                e.currentTarget.nextElementSibling?.classList.remove("hidden");
              }}
            />
          ) : null}
          <div
            className={`${
              note.thumbnailUrl ? "hidden" : ""
            } flex flex-col items-center justify-center`}
          >
            <div className="w-16 h-16 bg-white/20 dark:bg-black/20 rounded-full flex items-center justify-center mb-2">
              <BookOpen className="w-8 h-8 text-gray-600 dark:text-gray-300" />
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">
              {note.subject}
            </span>
          </div>

          {/* Overlay badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge
              variant="secondary"
              className="bg-white/90 text-gray-800 text-xs font-medium"
            >
              {note.noteType}
            </Badge>
            {note.difficultyLevel && (
              <Badge
                className={`text-xs font-medium ${getDifficultyColor(
                  note.difficultyLevel
                )}`}
              >
                {note.difficultyLevel.charAt(0).toUpperCase() +
                  note.difficultyLevel.slice(1)}
              </Badge>
            )}
          </div>

          <div className="absolute top-3 right-3">
            <div className="flex items-center gap-1 bg-white/90 dark:bg-black/70 px-2 py-1 rounded-full text-xs">
              <Clock className="w-3 h-3" />
              <span className="font-medium">{note.estimatedReadTime}m</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Title and Description */}
        <div className="mb-4">
          <CardTitle className="text-xl font-bold line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors leading-tight">
            {note.title}
          </CardTitle>

          {note.description && (
            <CardDescription className="line-clamp-2 text-gray-600 dark:text-gray-300 leading-relaxed">
              {note.description}
            </CardDescription>
          )}
        </div>

        {/* Academic Info Row */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {note.subject}
              </p>
              {note.academicLevel && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatAcademicLevel(note.academicLevel)}
                </p>
              )}
            </div>
          </div>

          {note.language && (
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <Globe className="w-3 h-3" />
              <span>{formatLanguage(note.language)}</span>
            </div>
          )}
        </div>

        {/* Stats Row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <div className="w-6 h-6 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center">
                <Eye className="w-3 h-3" />
              </div>
              <span className="font-medium">{formatCount(note.viewCount)}</span>
            </div>

            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <div className="w-6 h-6 bg-red-50 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <Heart className="w-3 h-3 text-red-500" />
              </div>
              <span className="font-medium">{formatCount(note.likeCount)}</span>
            </div>

            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <div className="w-6 h-6 bg-green-50 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <Download className="w-3 h-3 text-green-600" />
              </div>
              <span className="font-medium">
                {formatCount(note.downloadCount)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(note.createdAt)}</span>
          </div>
        </div>

        {/* Author Section */}
        {note.userProfile && (
          <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <Avatar className="w-10 h-10 border-2 border-white shadow-sm">
              <AvatarImage src={note.userProfile.avatarUrl} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                {note.userProfile.fullName?.charAt(0) ||
                  note.userProfile.username?.charAt(0) ||
                  "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {note.userProfile.fullName || note.userProfile.username}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                @{note.userProfile.username}
              </p>
            </div>
          </div>
        )}

        {/* Tags */}
        {note.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {note.tags.slice(0, 3).map((tag: string, index: number) => (
              <Badge
                key={index}
                variant="outline"
                className="text-xs px-2 py-1 bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
              >
                #{tag}
              </Badge>
            ))}
            {note.tags.length > 3 && (
              <Badge
                variant="outline"
                className="text-xs px-2 py-1 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400"
              >
                +{note.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NoteCard;
