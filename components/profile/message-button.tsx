"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PersistentChat } from "@/components/chat/persistent-chat";
import { MessageCircle, ExternalLink, ChevronDown } from "lucide-react";
import Link from "next/link";

interface MessageButtonProps {
  currentUsername: string;
  targetUsername: string;
  targetFullName?: string | null;
}

export default function MessageButton({
  currentUsername,
  targetUsername,
  targetFullName,
}: MessageButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Create a consistent room name for both users
  const roomName = [currentUsername, targetUsername].sort().join("_");

  return (
    <div className="flex items-center gap-2">
      {/* Quick Chat Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Message
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px] h-[600px] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Chat with {targetFullName || targetUsername}
            </DialogTitle>
            <DialogDescription>
              Send a message to start a conversation
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            <PersistentChat
              targetUsername={targetUsername}
              currentUsername={currentUsername}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Dropdown for additional options */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="px-2">
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link
              href={`/dashboard/chat/${targetUsername}`}
              className="flex items-center gap-2 cursor-pointer"
            >
              <ExternalLink className="h-4 w-4" />
              Open Full Chat
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
