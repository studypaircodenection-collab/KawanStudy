"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  UserPlus,
  Clock,
  Check,
  X,
  UserMinus,
  Ban,
  MoreHorizontal,
  Loader2,
} from "lucide-react";
import { PeerService } from "@/lib/services/peer-service";
import { toast } from "sonner";

interface ConnectionButtonProps {
  targetUserId: string;
  targetUsername: string;
  targetFullName: string | null;
}

type ConnectionStatus =
  | "none"
  | "pending_sent"
  | "pending_received"
  | "connected"
  | "blocked";

export default function ConnectionButton({
  targetUserId,
  targetUsername,
  targetFullName,
}: ConnectionButtonProps) {
  const [status, setStatus] = useState<ConnectionStatus>("none");
  const [connectionId, setConnectionId] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [connectMessage, setConnectMessage] = useState("");

  // Load initial connection status
  useEffect(() => {
    loadConnectionStatus();
  }, [targetUserId]);

  const loadConnectionStatus = async () => {
    try {
      setLoading(true);
      const result = await PeerService.getConnectionStatus(targetUserId);
      setStatus(result.status);
      setConnectionId(result.connectionId);
    } catch (error) {
      console.error("Error loading connection status:", error);
      toast.error("Failed to load connection status");
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async () => {
    try {
      setActionLoading(true);
      await PeerService.sendConnectionRequest(targetUserId, connectMessage);
      setStatus("pending_sent");
      setShowConnectDialog(false);
      setConnectMessage("");
      toast.success("Connection request sent!");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to send request";
      toast.error(message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAcceptRequest = async () => {
    if (!connectionId) return;

    try {
      setActionLoading(true);
      await PeerService.acceptConnectionRequest(connectionId);
      setStatus("connected");
      toast.success("Connection request accepted!");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to accept request";
      toast.error(message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeclineRequest = async () => {
    if (!connectionId) return;

    try {
      setActionLoading(true);
      await PeerService.declineConnectionRequest(connectionId);
      setStatus("none");
      toast.success("Connection request declined");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to decline request";
      toast.error(message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveConnection = async () => {
    try {
      setActionLoading(true);
      await PeerService.removeConnection(targetUserId);
      setStatus("none");
      toast.success("Connection removed");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to remove connection";
      toast.error(message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleBlockUser = async () => {
    try {
      setActionLoading(true);
      await PeerService.blockUser(targetUserId);
      setStatus("blocked");
      toast.success("User blocked");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to block user";
      toast.error(message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnblockUser = async () => {
    try {
      setActionLoading(true);
      await PeerService.unblockUser(targetUserId);
      setStatus("none");
      toast.success("User unblocked");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to unblock user";
      toast.error(message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <Button disabled variant="outline" size="sm">
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        Loading...
      </Button>
    );
  }

  // Render different buttons based on connection status
  switch (status) {
    case "none":
      return (
        <>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowConnectDialog(true)}
              disabled={actionLoading}
              size="sm"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Connect
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleBlockUser}>
                  <Ban className="h-4 w-4 mr-2" />
                  Block User
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <Dialog open={showConnectDialog} onOpenChange={setShowConnectDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Send Connection Request</DialogTitle>
                <DialogDescription>
                  Send a connection request to{" "}
                  {targetFullName || targetUsername}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="message">Message (optional)</Label>
                  <Textarea
                    id="message"
                    placeholder="Add a personal message..."
                    value={connectMessage}
                    onChange={(e) => setConnectMessage(e.target.value)}
                    maxLength={500}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowConnectDialog(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSendRequest} disabled={actionLoading}>
                  {actionLoading && (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  )}
                  Send Request
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      );

    case "pending_sent":
      return (
        <Button disabled variant="outline" size="sm">
          <Clock className="h-4 w-4 mr-2" />
          Request Sent
        </Button>
      );

    case "pending_received":
      return (
        <div className="flex gap-2">
          <Button
            onClick={handleAcceptRequest}
            disabled={actionLoading}
            size="sm"
          >
            <Check className="h-4 w-4 mr-2" />
            Accept
          </Button>
          <Button
            onClick={handleDeclineRequest}
            disabled={actionLoading}
            variant="outline"
            size="sm"
          >
            <X className="h-4 w-4 mr-2" />
            Decline
          </Button>
        </div>
      );

    case "connected":
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Check className="h-4 w-4 mr-2" />
              Connected
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleRemoveConnection}>
              <UserMinus className="h-4 w-4 mr-2" />
              Remove Connection
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleBlockUser}>
              <Ban className="h-4 w-4 mr-2" />
              Block User
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

    case "blocked":
      return (
        <Button
          onClick={handleUnblockUser}
          disabled={actionLoading}
          variant="outline"
          size="sm"
        >
          <Ban className="h-4 w-4 mr-2" />
          Unblock
        </Button>
      );

    default:
      return null;
  }
}
