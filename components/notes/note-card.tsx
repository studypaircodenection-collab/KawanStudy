"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Clock,
  Calendar,
  Eye,
  Heart,
  Download,
  Globe,
  Share2,
  Copy,
  Mail,
  Twitter,
  Facebook,
  Linkedin,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CustomizedAvatar } from "@/components/ui/customized-avatar";
import { Text } from "@/components/ui/typography";
import { formatDateShort } from "@/lib/constant";
import { formatCount } from "@/lib/constant";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import Link from "next/link";
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

  const handleViewNote = () => {
    router.push(`/dashboard/notes/${note.id}`);
  };
  const handleViewProfile = () => {
    if (note.userProfile)
      router.push(`/dashboard/notes/${note.userProfile?.username}`);

    return null;
  };

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
    <Card key={note.id} className="pt-0 group overflow-hidden">
      {/* Header Image */}
      <CardHeader className="h-fit p-0 gap-0 relative overflow-hidden">
        {/* Author Section */}
        {note.userProfile && (
          <div className="flex justify-between items-center gap-2 px-4 py-3">
            <div className="flex items-center gap-2 ">
              <CustomizedAvatar
                src={note.userProfile.avatarUrl}
                userId={note.userProfile.id}
                size="sm"
              />
              <Link href={`/dashboard/profile/${note.userProfile.username}`}>
                <Text
                  as="p"
                  className="text-sm truncate hover:underline cursor-pointer"
                >
                  @{note.userProfile.username}
                </Text>
              </Link>
            </div>
            <div className="flex gap-2 items-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
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
            </div>
          </div>
        )}

        <div className="aspect-[16/9] dark:bg-background bg-white w-full flex items-center justify-center relative">
          {note.thumbnailUrl ? (
            <Image
              src={note.thumbnailUrl}
              alt={note.title}
              width={400}
              onClick={handleViewNote}
              height={225}
              className="w-full h-full cursor-pointer object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                e.currentTarget.nextElementSibling?.classList.remove("hidden");
              }}
            />
          ) : null}
          <div
            className={`${
              note.thumbnailUrl ? "hidden" : ""
            } flex flex-col items-center justify-center w-full h-full cursor-pointer`}
            onClick={handleViewNote}
          >
            <div className="w-16 h-16  bg-primary/20 rounded-full flex items-center justify-center mb-2">
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
            <Text as="p" styleVariant="muted">
              {note.subject}
            </Text>
          </div>

          <div className="flex absolute top-3 right-3 items-center gap-2 bg-primary/50 backdrop-blur-xl rounded-xl pl-2">
            <div className="text-right">
              <Text
                as="p"
                className="text-sm font-medium text-gray-900 dark:text-white"
              >
                {note.subject}
              </Text>
            </div>
            <div className="w-8 h-8 bg-primary/20 rounded-xl flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-secondary" />
            </div>
          </div>

          {/* Overlay badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge
              variant="secondary"
              className="bg-white/90 text-gray-800 text-xs font-medium"
            >
              {note.noteType}
            </Badge>
          </div>
        </div>
        {/* STATISTIC */}
        <div className="flex items-center justify-between absolute bottom-1 px-2 w-full py-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-card/50 rounded-full pr-2 backdrop-blur-xl">
              <div className="w-6 h-6  rounded-full flex items-center justify-center">
                <Eye className="w-3 h-3 text-cyan-500" />
              </div>
              <Text as="p" className="text-xs">
                {formatCount(note.viewCount)}
              </Text>
            </div>

            <div className="flex items-center gap-1 bg-card/50 rounded-full pr-2 backdrop-blur-xl">
              <div className="w-6 h-6 rounded-full flex items-center justify-center">
                <Heart className="w-3 h-3 text-red-500" />
              </div>
              <Text as="p" className="text-xs">
                {formatCount(note.likeCount)}
              </Text>
            </div>

            <div className="flex items-center gap-1 bg-card/50  rounded-full pr-2 backdrop-blur-xl">
              <div className="w-6 h-6  rounded-full flex items-center justify-center">
                <Download className="w-3 h-3 text-primary" />
              </div>
              <Text as="p" className="text-xs">
                {formatCount(note.downloadCount)}
              </Text>
            </div>
          </div>

          <Text
            as="p"
            className="flex items-center gap-1 text-xs bg-card/50 rounded-md px-2 py-1 backdrop-blur-xl"
          >
            <Calendar className="w-3 h-3" />
            {formatDateShort(note.createdAt)}
          </Text>
        </div>
      </CardHeader>

      <CardContent onClick={handleViewNote} className="cursor-pointer">
        {/* Title and Description */}
        <div className="flex items-start justify-between mb-2 gap-2">
          <div>
            <CardTitle className="max-w-2/3 text-md font-bold line-clamp-2 group-hover:text-primary transition-colors leading-tight">
              {note.title}
            </CardTitle>

            <CardDescription className="line-clamp-2 leading-relaxed">
              {note.description ? note.description : "test"}
            </CardDescription>
          </div>
          {note.tags.length > 0 ? (
            <div className="flex flex-wrap  justify-end gap-2">
              {note.tags.slice(0, 2).map((tag: string, index: number) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="text-xs px-2 py-1 transition-colors"
                >
                  #{tag}
                </Badge>
              ))}
              {note.tags.length > 3 && (
                <Badge variant="outline" className="text-xs px-2 py-1">
                  +{note.tags.length - 2} more
                </Badge>
              )}
            </div>
          ) : null}
        </div>

        {/* Academic Info Row */}
        <div className="flex items-center justify-between mt-4">
          {note.language && (
            <Text
              as="p"
              styleVariant="muted"
              className="text-xs flex items-center gap-1"
            >
              <Globe className="w-3 h-3" />
              <span>{formatLanguage(note.language)}</span>
            </Text>
          )}
        </div>

        {/* Stats Row */}
      </CardContent>
    </Card>
  );
};

export default NoteCard;
