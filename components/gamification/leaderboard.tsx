import React from "react";
import { LeaderboardEntry } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Crown, Trophy, Medal, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  showTop?: number;
  className?: string;
}

const Leaderboard = ({
  entries,
  showTop = 10,
  className,
}: LeaderboardProps) => {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Trophy className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Medal className="h-5 w-5 text-amber-600" />;
      default:
        return (
          <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center">
            <span className="text-xs font-medium text-muted-foreground">
              {rank}
            </span>
          </div>
        );
    }
  };

  const getRankCardStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return "border-yellow-200 bg-gradient-to-r from-yellow-50/50 to-amber-50/50 dark:from-yellow-950/20 dark:to-amber-950/20";
      case 2:
        return "border-gray-200 bg-gradient-to-r from-gray-50/50 to-slate-50/50 dark:from-gray-950/20 dark:to-slate-950/20";
      case 3:
        return "border-amber-200 bg-gradient-to-r from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20";
      default:
        return "border-border hover:bg-muted/50 transition-colors";
    }
  };

  const getLevelColor = (level: number) => {
    if (level >= 20) return "bg-purple-500";
    if (level >= 15) return "bg-blue-500";
    if (level >= 10) return "bg-green-500";
    if (level >= 5) return "bg-yellow-500";
    return "bg-gray-500";
  };

  const getInitials = (fullName: string | null, username: string | null) => {
    if (fullName) {
      return fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return username?.slice(0, 2).toUpperCase() || "?";
  };

  return (
    <div className={cn("space-y-2", className)}>
      {entries.slice(0, showTop).map((entry) => (
        <Card
          key={entry.user_id}
          className={cn(
            "transition-all duration-200 hover:shadow-md",
            getRankCardStyle(entry.rank)
          )}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              {/* Rank Icon */}
              <div className="flex items-center justify-center w-8">
                {getRankIcon(entry.rank)}
              </div>

              {/* Avatar */}
              <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
                <AvatarImage
                  src={entry.avatar_url || undefined}
                  alt={entry.full_name || entry.username || "User"}
                />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                  {getInitials(entry.full_name, entry.username)}
                </AvatarFallback>
              </Avatar>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          href={`/dashboard/profile/${entry.username}`}
                          className="font-semibold text-base truncate hover:underline"
                          target="_BLANK"
                        >
                          {entry.full_name ||
                            entry.username ||
                            "Anonymous User"}
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">
                          View {entry.username || "user"}'s profile
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-xs font-medium text-white",
                      getLevelColor(entry.level)
                    )}
                  >
                    Lv. {entry.level}
                  </Badge>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    <span>{entry.total_points.toLocaleString()} pts</span>
                  </div>

                  {entry.university && (
                    <div className="truncate max-w-[250px]">
                      📚 {entry.university}
                    </div>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="text-right space-y-1">
                <div className="flex items-center gap-1 text-sm font-medium">
                  <Trophy className="h-3 w-3 text-amber-500" />
                  <span>{entry.achievement_count}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {entries.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">No Rankings Yet</h3>
            <p className="text-sm text-muted-foreground">
              Start earning points to appear on the leaderboard!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Leaderboard;
