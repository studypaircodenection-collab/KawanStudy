"use client";

import React from "react";
import {
  MessageCircle,
  UserPlus,
  MapPin,
  GraduationCap,
  Calendar,
  Clock,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { PeerUser } from "@/lib/types";

interface PeerProfileModalProps {
  peer: PeerUser | null;
  isOpen: boolean;
  onClose: () => void;
  onConnect?: (peerId: string) => void;
  onMessage?: (peerId: string) => void;
  onAccept?: (peerId: string) => void;
  onDecline?: (peerId: string) => void;
}

export const PeerProfileModal: React.FC<PeerProfileModalProps> = ({
  peer,
  isOpen,
  onClose,
  onConnect,
  onMessage,
  onAccept,
  onDecline,
}) => {
  if (!peer) return null;

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

  const getStatusBadge = () => {
    switch (peer.connection_status) {
      case "connected":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            Connected
          </Badge>
        );
      case "pending_sent":
        return <Badge variant="secondary">Request Sent</Badge>;
      case "pending_received":
        return (
          <Badge
            variant="outline"
            className="border-orange-300 text-orange-600"
          >
            Pending
          </Badge>
        );
      default:
        return null;
    }
  };

  const getActionButtons = () => {
    switch (peer.connection_status) {
      case "connected":
        return (
          onMessage && (
            <Button onClick={() => onMessage(peer.id)} className="flex-1">
              <MessageCircle className="h-4 w-4 mr-2" />
              Send Message
            </Button>
          )
        );
      case "pending_sent":
        return (
          <Button variant="outline" disabled className="flex-1">
            Request Sent
          </Button>
        );
      case "pending_received":
        return (
          <div className="flex gap-2">
            {onAccept && (
              <Button onClick={() => onAccept(peer.id)} className="flex-1">
                Accept Request
              </Button>
            )}
            {onDecline && (
              <Button
                variant="outline"
                onClick={() => onDecline(peer.id)}
                className="flex-1"
              >
                Decline
              </Button>
            )}
          </div>
        );
      default:
        return (
          onConnect && (
            <Button onClick={() => onConnect(peer.id)} className="flex-1">
              <UserPlus className="h-4 w-4 mr-2" />
              Send Connection Request
            </Button>
          )
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="sr-only">Peer Profile</DialogTitle>
          <DialogDescription className="sr-only">
            View {peer.full_name || peer.username}&apos;s profile information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Header */}
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="relative">
              <Avatar className="h-20 w-20">
                {peer.avatar_url ? (
                  <img
                    src={peer.avatar_url}
                    alt={peer.full_name || peer.username || "User"}
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl">
                    {getInitials()}
                  </div>
                )}
              </Avatar>
              {peer.is_online && (
                <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-green-500 border-2 border-white rounded-full" />
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <h2 className="text-xl font-semibold">
                  {peer.full_name || peer.username}
                </h2>
                {getStatusBadge()}
              </div>

              {peer.username && peer.full_name && (
                <p className="text-muted-foreground">@{peer.username}</p>
              )}

              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                {!peer.is_online && peer.last_seen && (
                  <>
                    <Clock className="h-4 w-4" />
                    <span>Last seen {peer.last_seen}</span>
                  </>
                )}
                {peer.is_online && (
                  <>
                    <div className="h-2 w-2 bg-green-500 rounded-full" />
                    <span>Online now</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Profile Details */}
          <div className="space-y-4">
            {peer.bio && (
              <div>
                <h3 className="font-medium mb-2">About</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {peer.bio}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 gap-3">
              {peer.university && (
                <div className="flex items-center gap-3">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{peer.university}</span>
                </div>
              )}

              {peer.major && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{peer.major}</span>
                </div>
              )}

              {peer.year_of_study && (
                <div className="flex items-center gap-3">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{peer.year_of_study}</span>
                </div>
              )}

              {peer.location && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{peer.location}</span>
                </div>
              )}
            </div>

            {peer.mutual_connections > 0 && (
              <div>
                <p className="text-sm text-muted-foreground">
                  {peer.mutual_connections} mutual connection
                  {peer.mutual_connections !== 1 ? "s" : ""}
                </p>
              </div>
            )}
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex gap-2">{getActionButtons()}</div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
