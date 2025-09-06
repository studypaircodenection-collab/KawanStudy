"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomizedAvatar } from "@/components/ui/customized-avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award } from "lucide-react";

interface LeaderboardUser {
  id: string;
  username: string;
  avatarUrl?: string;
  points: number;
  level: number;
  rank: number;
}

interface CustomizedLeaderboardProps {
  users: LeaderboardUser[];
  currentUserId?: string;
}

export function CustomizedLeaderboard({ users, currentUserId }: CustomizedLeaderboardProps) {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white";
      case 2:
        return "bg-gradient-to-r from-gray-300 to-gray-500 text-white";
      case 3:
        return "bg-gradient-to-r from-amber-400 to-amber-600 text-white";
      default:
        return "bg-background hover:bg-accent";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {users.map((user) => (
          <div
            key={user.id}
            className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
              user.id === currentUserId ? "ring-2 ring-primary" : ""
            } ${getRankColor(user.rank)}`}
          >
            {/* Rank */}
            <div className="flex items-center justify-center w-8">
              {getRankIcon(user.rank)}
            </div>

            {/* Avatar with customizations */}
            <CustomizedAvatar
              userId={user.id}
              src={user.avatarUrl}
              fallback={user.username.charAt(0).toUpperCase()}
              size="md"
              showBadges={true}
              showTitle={false}
            />

            {/* User info */}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{user.username}</span>
                {user.id === currentUserId && (
                  <Badge variant="secondary" className="text-xs">You</Badge>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                Level {user.level}
              </div>
            </div>

            {/* Points */}
            <div className="text-right">
              <div className="font-bold">{user.points.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">points</div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
