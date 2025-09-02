"use client";

import React from "react";
import { MoreVertical } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { PeerUser } from "@/lib/types";
import Link from "next/link";

interface PeerCardProps {
  peer: PeerUser;
  onConnect?: (peerId: string) => void;
  onMessage?: (peerId: string) => void;
  onAccept?: (peerId: string) => void;
  onDecline?: (peerId: string) => void;
  onBlock?: (peerId: string) => void;
  onUnblock?: (peerId: string) => void;
  onReport?: (peerId: string) => void;
  onRemoveConnection?: (peerId: string) => void;
}

export const PeerCard: React.FC<PeerCardProps> = ({
  peer,
  onConnect,
  onMessage,
  onAccept,
  onDecline,
  onBlock,
  onUnblock,
  onReport,
  onRemoveConnection,
}) => {
  const getInitials = () => {
    if (peer.full_name) {
      return peer.full_name
        .split(" ")
        .map((name) => name.charAt(0))
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return peer.username ? peer.username.charAt(0).toUpperCase() : "?";
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-200 hover:border-primary/20">
      <CardContent>
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4 flex-1">
            <div className="relative">
              <Avatar className="h-14 w-14">
                <AvatarImage
                  src={peer.avatar_url || "/default-avatar.png"}
                  alt={peer.full_name || peer.username || " "}
                />
                <AvatarFallback className="text-lg">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              {peer.is_online && (
                <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 border-2 border-white rounded-full" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="font-semibold text-lg truncate">
                  {peer.full_name || peer.username}
                </h3>
              </div>

              {peer.username && peer.full_name && (
                <p className="text-sm text-muted-foreground">
                  @{peer.username}
                </p>
              )}

              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground flex-wrap">
                {peer.university && <span>{peer.university}</span>}
                {peer.university && (peer.major || peer.year_of_study) && (
                  <span>•</span>
                )}
                {peer.major && <span>{peer.major}</span>}
                {peer.major && peer.year_of_study && <span>•</span>}
                {peer.year_of_study && <span>{peer.year_of_study}</span>}
              </div>

              {peer.location && (
                <p className="text-sm text-muted-foreground mt-1">
                  📍 {peer.location}
                </p>
              )}

              {peer.bio && (
                <p className="text-sm mt-3 text-gray-600 line-clamp-2">
                  {peer.bio}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 ml-4">
            {onConnect && peer.connection_status !== "connected" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onConnect(peer.id)}
              >
                Connect
              </Button>
            )}
            {onRemoveConnection && peer.connection_status === "connected" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRemoveConnection(peer.id)}
              >
                Remove Connection
              </Button>
            )}
            {onAccept && peer.connection_status === "pending_received" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAccept(peer.id)}
              >
                Accept
              </Button>
            )}
            {onDecline && peer.connection_status === "pending_received" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDecline(peer.id)}
              >
                Reject
              </Button>
            )}
            {onUnblock && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onUnblock(peer.id)}
              >
                Unblock
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/profile/${peer.username}`}>
                    View Profile
                  </Link>
                </DropdownMenuItem>
                {onMessage && peer.connection_status !== "blocked" && (
                  <DropdownMenuItem onClick={() => onMessage(peer.username)}>
                    Message User
                  </DropdownMenuItem>
                )}
                {onBlock && peer.connection_status !== "blocked" && (
                  <DropdownMenuItem onClick={() => onBlock(peer.id)}>
                    Block User
                  </DropdownMenuItem>
                )}
                {onReport && (
                  <DropdownMenuItem onClick={() => onReport(peer.id)}>
                    Report User
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
