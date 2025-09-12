"use client";

import * as React from "react";
import {
  BookOpen,
  Bot,
  CalendarSearchIcon,
  Command,
  FileTextIcon,
  LibraryBigIcon,
  LifeBuoy,
  ListTodoIcon,
  LucideCalculator,
  MessageCircle,
  NotebookTabsIcon,
  Send,
  SquareTerminal,
  Trophy,
} from "lucide-react";
import { Text } from "@/components/ui/typography";
import { NavMain } from "@/components/dashboard/nav-main";
import { NavSecondary } from "@/components/dashboard/nav-secondary";
import { NavUser } from "@/components/dashboard/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuth } from "@/lib/context/auth-provider";
import Link from "next/link";
import { NavUiTM } from "./nav-uitm";

const data = {
  navMain: [
    {
      title: "Class Tutor",
      url: "/dashboard/tutor",
      icon: SquareTerminal,
      iconColor: "text-blue-500",
      isActive: true,
      items: [
        {
          title: "Browse All Tutor Sessions",
          url: "/dashboard/tutor/browse",
        },
        {
          title: "Start a New Session",
          url: "/dashboard/tutor/create",
        },
      ],
    },
    {
      title: "Quiz",
      url: "/dashboard/quiz",
      icon: Bot,
      iconColor: "text-green-500",
      items: [
        {
          title: "Browse Quiz",
          url: "/dashboard/quiz/browse",
        },
        {
          title: "Create a quiz",
          url: "/dashboard/quiz/create",
        },
      ],
    },
    {
      title: "Notes",
      url: "/dashboard/notes",
      icon: NotebookTabsIcon,
      iconColor: "text-pink-500",
      items: [
        {
          title: "KawanStudy Notes",
          url: "/dashboard/notes/browse",
        },
        {
          title: "Upload Notes",
          url: "/dashboard/notes/upload",
        },
        {
          title: "My Notes",
          url: "/dashboard/notes/my-notes",
        },
      ],
    },
    {
      title: "Past Year Paper",
      url: "/dashboard/past-year",
      icon: BookOpen,
      iconColor: "text-purple-500",
      items: [
        {
          title: "KawanStudy Paper",
          url: "/dashboard/past-year/browse",
        },
      ],
    },
    {
      title: "CarryMark Calculator",
      url: "/dashboard/carrymark-calculator",
      icon: LucideCalculator,
      iconColor: "text-teal-500",
    },
    {
      title: "Schedule Manager",
      url: "/dashboard/schedule-manager",
      icon: ListTodoIcon,
      iconColor: "text-amber-500",
    },
  ],
  navSecondary: [
    {
      title: "Chat Center",
      url: "/dashboard/chat",
      icon: MessageCircle,
      iconColor: "text-cyan-500",
    },
    {
      title: "Leaderboard",
      url: "/dashboard/leaderboard",
      icon: Trophy,
      iconColor: "text-amber-500",
    },
    {
      title: "Get Support",
      url: "/dashboard/support",
      icon: LifeBuoy,
      iconColor: "text-pink-500",
    },
    // {
    //   title: "View Documentation",
    //   url: "/dashboard/documentation",
    //   icon: FilesIcon,
    // },
    {
      title: "Drop a Feedback",
      url: "/dashboard/feedback",
      icon: Send,
      iconColor: "text-indigo-500",
    },
  ],
  navUiTM: [
    {
      title: "UiTM E-Book Library",
      url: "/dashboard/notes/uitm-library",
      icon: LibraryBigIcon,
      iconColor: "text-emerald-500",
    },
    {
      title: "UiTM Past Year",
      url: "/dashboard/past-year/uitm-paper",
      icon: FileTextIcon,
      iconColor: "text-violet-500",
    },
    {
      title: "UiTM ICRESS Schedule",
      url: "/dashboard/uitm-schedule",
      icon: CalendarSearchIcon,
      iconColor: "text-teal-500",
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { claims, isAuthenticated } = useAuth();

  const user = claims
    ? {
        id: claims.sub || "",
        email: claims.email || "",
        user_metadata: {
          username: claims?.username || "",
          full_name: claims?.full_name || "",
          avatar_url: claims?.avatar_url || "",
          role: claims?.role || "user",
        },
        created_at: claims?.created_at || new Date().toISOString(),
        updated_at: claims?.updated_at || new Date().toISOString(),
      }
    : null;

  return (
    <Sidebar
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      {...props}
    >
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavUiTM items={data.navUiTM} className="mt-2" />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        {isAuthenticated && user ? (
          <NavUser user={user} />
        ) : (
          <div className="p-4 text-center text-sm text-muted-foreground">
            {claims ? "Loading user data..." : "Not authenticated"}
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
