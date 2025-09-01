"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, Calendar, Eye, Heart, Download } from "lucide-react";
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

const NoteCard = ({ note }: { note: NoteCardData }) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/dashboard/notes/${note.id}`);
  };

  return (
    <Card
      key={note.id}
      onClick={handleClick}
      className="hover:shadow-lg transition-shadow duration-200 cursor-pointer border pt-0"
    >
      <CardHeader className="p-0 overflow-hidden rounded-xl">
        <div className="aspect-video w-full bg-background grid place-items-center object-cover">
          {note.thumbnailUrl ? (
            <Image
              src={note.thumbnailUrl}
              alt={note.title}
              width={400}
              height={300}
              className="w-full h-full object-cover aspect-video"
              onError={(e) => {
                // Fallback to placeholder if image fails to load
                e.currentTarget.style.display = "none";
                e.currentTarget.nextElementSibling?.classList.remove("hidden");
              }}
            />
          ) : null}
          <ImageIcon
            className={`size-10 object-cover text-muted-foreground ${
              note.thumbnailUrl ? "hidden" : ""
            }`}
          />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex justify-between items-start mb-2">
          <Badge variant="outline" className="text-xs">
            {note.noteType}
          </Badge>
          <div className="flex items-center text-muted-foreground text-sm">
            <Clock className="w-3 h-3" />
            {note.estimatedReadTime}m
          </div>
        </div>
        <CardTitle className="text-lg line-clamp-2 hover:text-blue-600 transition-colors">
          {note.title}
        </CardTitle>
        {note.description && (
          <CardDescription className="line-clamp-2 text-muted-foreground">
            {note.description}
          </CardDescription>
        )}
        <div className="space-y-3">
          <div className="flex items-center text-sm text-muted-foreground">
            <BookOpen className="w-4 h-4 mr-2 text-foreground" />
            <span className="font-medium">{note.subject}</span>
          </div>

          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 mr-2 text-foreground" />
            {formatDate(note.createdAt)}
          </div>

          <div className="flex flex-wrap gap-1">
            {note.tags.slice(0, 3).map((tag: string, index: number) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {note.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{note.tags.length - 3}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NoteCard;
