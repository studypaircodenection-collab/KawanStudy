"use client";

import * as React from "react";
import {
  BookOpen,
  Bot,
  Command,
  FilesIcon,
  LifeBuoy,
  ListTodoIcon,
  LucideCalculator,
  NotebookTabsIcon,
  Send,
  SquareTerminal,
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

const data = {
  navMain: [
    {
      title: "Class Tutor",
      url: "/dashboard/tutor",
      icon: SquareTerminal,
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
      items: [
        {
          title: "Browse Notes",
          url: "/dashboard/notes/browse",
        },
        {
          title: "Upload Notes",
          url: "/dashboard/notes/upload",
        },
        {
          title: "Favourite Notes",
          url: "/dashboard/notes/favourite",
        },
      ],
    },
    {
      title: "Past Year Paper",
      url: "/dashboard/past-year",
      icon: BookOpen,
    },
    {
      title: "CarryMark Calculator",
      url: "/dashboard/carrymark-calculator",
      icon: LucideCalculator,
    },
    {
      title: "Schedule Generator",
      url: "/dashboard/schedule-generator",
      icon: ListTodoIcon,
    },
  ],
  navSecondary: [
    {
      title: "Get Support",
      url: "/dashboard/support",
      icon: LifeBuoy,
    },
    {
      title: "View Documentation",
      url: "/dashboard/documentation",
      icon: FilesIcon,
    },
    {
      title: "Drop a Feedback",
      url: "/dashboard/feedback",
      icon: Send,
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
        app_metadata: claims?.app_metadata || {},
        aud: claims?.aud || "authenticated",
        created_at: claims?.created_at || new Date().toISOString(),
        updated_at: claims?.updated_at || new Date().toISOString(),
      }
    : null;

  return (
    <Sidebar
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <Text as="p" className="font-bold text-lg">
                    kawanstudy
                  </Text>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
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
