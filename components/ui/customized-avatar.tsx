"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useEquippedItems } from "@/hooks/use-equipped-items";
import { cn } from "@/lib/utils";
import { UserIcon } from "lucide-react";

interface CustomizedAvatarProps {
  userId: string;
  src?: string;
  fallback?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showBadges?: boolean;
  showTitle?: boolean;
  className?: string;
}

export function CustomizedAvatar({
  userId,
  src,
  fallback,
  size = "md",
  showBadges = true,
  showTitle = true,
  className,
}: CustomizedAvatarProps) {
  const { getEquippedItemByType } = useEquippedItems(userId);

  const border = getEquippedItemByType("profile_border");
  const badge = getEquippedItemByType("profile_badge");
  const title = getEquippedItemByType("profile_title");

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-16 w-16",
    xl: "h-24 w-24",
  };

  const sizeConfig = {
    sm: {
      borderWidth: "2px",
      badgeSize: "w-4 h-4",
      badgePosition: "-bottom-0.5 -right-0.5",
      badgeTextSize: "text-xs",
      titleTop: "-top-5",
      titleTextSize: "text-xs px-1 py-0.5",
    },
    md: {
      borderWidth: "3px",
      badgeSize: "w-6 h-6",
      badgePosition: "-bottom-1.5 -right-1.5",
      badgeTextSize: "text-sm",
      titleTop: "-top-7",
      titleTextSize: "text-xs px-2 py-1",
    },
    lg: {
      borderWidth: "4px",
      badgeSize: "w-8 h-8",
      badgePosition: "-bottom-1 -right-1",
      badgeTextSize: "text-lg",
      titleTop: "-top-8",
      titleTextSize: "text-sm px-3 py-1",
    },
    xl: {
      borderWidth: "5px",
      badgeSize: "w-10 h-10",
      badgePosition: "-bottom-2 -right-2",
      badgeTextSize: "text-2xl",
      titleTop: "-top-10",
      titleTextSize: "text-base px-4 py-2",
    },
  };

  const config = sizeConfig[size];

  const getBorderStyle = () => {
    if (!border) return {};

    return {
      border: `${config.borderWidth} solid ${border.item_data.value}`,
      borderRadius: "50%",
    };
  };

  const getInitialsFallback = () => {
    if (fallback) return fallback;
    return <UserIcon className="size-4" />;
  };

  return (
    <div className={cn("relative inline-block", className)}>
      {/* Title above avatar */}
      {showTitle && title && (
        <div
          className={`absolute ${config.titleTop} left-1/2 transform -translate-x-1/2 z-10 whitespace-nowrap`}
        >
          <Badge
            variant="secondary"
            className={`${config.titleTextSize} bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none`}
          >
            {title.item_name}
          </Badge>
        </div>
      )}

      {/* Avatar with border */}
      <Avatar
        className={cn(sizeClasses[size], className)}
        style={getBorderStyle()}
      >
        <AvatarImage src={src} />
        <AvatarFallback>{getInitialsFallback()}</AvatarFallback>
      </Avatar>

      {/* Badge overlay */}
      {showBadges && badge && (
        <div className={`absolute ${config.badgePosition} z-10`}>
          <div
            className={`${config.badgeTextSize} bg-white dark:bg-gray-800 rounded-full border-2 border-gray-200 dark:border-gray-700 ${config.badgeSize} flex items-center justify-center`}
          >
            {badge.item_data.value}
          </div>
        </div>
      )}
    </div>
  );
}
