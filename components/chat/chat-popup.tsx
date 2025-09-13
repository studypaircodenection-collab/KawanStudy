"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MessageCircleIcon, ChevronUp, ChevronDown, X } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";
const mockChats = [
  {
    id: "1",
    name: "Alex Morgan",
    message: "Hey — did you finish the notes for chapter 3?",
    time: "2m",
    unread: 2,
    avatar: "https://i.pravatar.cc/40?img=1",
  },
  {
    id: "2",
    name: "Samira Khan",
    message: "I uploaded the past-year paper answers.",
    time: "1h",
    unread: 0,
    avatar: "https://i.pravatar.cc/40?img=2",
  },
  {
    id: "3",
    name: "Study Group",
    message: "Meeting tomorrow at 6pm — don't forget!",
    time: "Yesterday",
    unread: 5,
    avatar: "",
  },
  {
    id: "4",
    name: "Alex Morgan",
    message: "Hey — did you finish the notes for chapter 3?",
    time: "2m",
    unread: 2,
    avatar: "https://i.pravatar.cc/40?img=1",
  },
  {
    id: "5",
    name: "Samira Khan",
    message: "I uploaded the past-year paper answers.",
    time: "1h",
    unread: 0,
    avatar: "https://i.pravatar.cc/40?img=2",
  },
  {
    id: "6",
    name: "Study Group",
    message: "Meeting tomorrow at 6pm — don't forget!",
    time: "Yesterday",
    unread: 5,
    avatar: "",
  },
  {
    id: "7",
    name: "Alex Morgan",
    message: "Hey — did you finish the notes for chapter 3?",
    time: "2m",
    unread: 2,
    avatar: "https://i.pravatar.cc/40?img=1",
  },
  {
    id: "8",
    name: "Samira Khan",
    message: "I uploaded the past-year paper answers.",
    time: "1h",
    unread: 0,
    avatar: "https://i.pravatar.cc/40?img=2",
  },
  {
    id: "9",
    name: "Study Group",
    message: "Meeting tomorrow at 6pm — don't forget!",
    time: "Yesterday",
    unread: 5,
    avatar: "",
  },
];

const ChatPopup: React.FC = () => {
  const [open, setOpen] = useState(false);
  const unreadTotal = mockChats.reduce((s, c) => s + (c.unread || 0), 0);

  return (
    <div className="fixed bottom-0 right-0 z-50 w-[20rem] sm:w-[24rem]">
      {open ? (
        <Card className="rounded-none shadow-none border-0 py-4">
          <CardHeader className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <MessageCircleIcon className="w-5 h-5" />

              <div>
                <CardTitle className="text-sm">Chats</CardTitle>
                <div className="text-xs text-muted-foreground">
                  {unreadTotal} unread
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setOpen(false)}
                aria-label="Minimize chat"
              >
                <ChevronDown className="size-5" />
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            <div className="mb-2 flex items-center gap-2">
              <Input placeholder="Search chats" className="w-full" />
              <Button>new chat</Button>
            </div>

            <ScrollArea className="h-64 pr-1">
              {mockChats.map((c) => (
                <button
                  key={c.id}
                  className="w-full text-left flex items-center gap-3 px-2 py-2 hover:bg-accent/50 rounded-md"
                >
                  <Avatar>
                    {c.avatar ? (
                      <AvatarImage src={c.avatar} alt={c.name} />
                    ) : (
                      <AvatarFallback>{c.name.split(" ")[0][0]}</AvatarFallback>
                    )}
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-sm">{c.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {c.time}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {c.message}
                    </div>
                  </div>

                  {c.unread ? (
                    <div className="ml-2 inline-flex items-center justify-center min-w-[1.5rem] h-6 rounded-full bg-amber-500 text-white text-xs px-2">
                      {c.unread}
                    </div>
                  ) : null}
                </button>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>
      ) : (
        <Card className="rounded-none shadow-none border-0 py-4">
          <CardContent className="flex justify-between items-center gap-3 bg-card">
            <div className="flex items-center justify-start gap-2">
              <MessageCircleIcon className="w-5 h-5" />
              <div className="text-left">
                <CardTitle className="text-sm">Chats</CardTitle>
                <div className="text-xs text-muted-foreground">
                  {unreadTotal} unread
                </div>
              </div>
            </div>

            <Button
              aria-label="Open chat"
              onClick={() => setOpen(true)}
              variant={"ghost"}
              size={"icon"}
            >
              <ChevronUp className="size-5" />
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ChatPopup;
