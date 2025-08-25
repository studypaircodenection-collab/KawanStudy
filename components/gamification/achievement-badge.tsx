import React from "react";
import { UserAchievement } from "@/lib/types";
import { Badge } from "../ui/badge";

const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case "common":
      return "bg-gray-100 text-gray-800";
    case "rare":
      return "bg-blue-100 text-blue-800";
    case "epic":
      return "bg-purple-100 text-purple-800";
    case "legendary":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const AchievementBadge = ({
  achievement,
}: {
  achievement: UserAchievement;
}) => {
  return (
    <div
      key={achievement.achievement_id}
      className="flex items-center gap-3 p-3 border rounded-lg"
    >
      <div className="text-3xl">{achievement.achievement_icon}</div>
      <div className="flex-1">
        <div className="font-medium">{achievement.achievement_title}</div>
        <div className="text-sm text-muted-foreground">
          {achievement.achievement_description}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <Badge
            variant="outline"
            className={getRarityColor(achievement.rarity)}
          >
            {achievement.rarity}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {formatDate(achievement.earned_at)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AchievementBadge;
