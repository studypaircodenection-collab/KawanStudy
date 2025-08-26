"use client";

import React from "react";
import { Users, UserPlus, Search, MessageCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  type: "discover" | "connections" | "requests" | "sent" | "search" | "blocked";
  onAction?: () => void;
}

export const PeerEmptyState: React.FC<EmptyStateProps> = ({
  type,
  onAction,
}) => {
  const getContent = () => {
    switch (type) {
      case "discover":
        return {
          icon: (
            <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          ),
          title: "Discover Your Study Community",
          description:
            "Connect with fellow students, find study partners, and build meaningful academic relationships.",
          actionText: "Search for Peers",
        };
      case "connections":
        return {
          icon: (
            <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          ),
          title: "No connections yet",
          description:
            "Start connecting with other students to build your academic network. You can message and collaborate once connected.",
          actionText: "Discover Peers",
        };
      case "requests":
        return {
          icon: (
            <UserPlus className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          ),
          title: "No pending requests",
          description:
            "You don't have any connection requests at the moment. When other students want to connect, they'll appear here.",
          actionText: null,
        };
      case "sent":
        return {
          icon: (
            <UserPlus className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          ),
          title: "No sent requests",
          description:
            "You haven't sent any connection requests yet. Start exploring and connecting with other students.",
          actionText: "Find Peers",
        };
      case "blocked":
        return {
          icon: (
            <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          ),
          title: "No blocked users",
          description:
            "You haven't blocked any users. If you need to manage blocked users, they will appear here.",
          actionText: "Find Peers",
        };
      case "search":
        return {
          icon: (
            <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          ),
          title: "No peers found",
          description:
            "Try adjusting your search criteria or filters to find more students.",
          actionText: "Clear Filters",
        };
      default:
        return {
          icon: (
            <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          ),
          title: "No results",
          description: "Nothing to show here right now.",
          actionText: null,
        };
    }
  };

  const content = getContent();

  return (
    <Card>
      <CardContent className="p-12 text-center">
        {content.icon}
        <h3 className="font-semibold text-lg mb-2">{content.title}</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed">
          {content.description}
        </p>
        {content.actionText && onAction && (
          <Button onClick={onAction} variant="outline">
            {content.actionText}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
