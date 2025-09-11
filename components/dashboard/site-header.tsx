"use client";

import {
  CirclePlusIcon,
  Command,
  MoreHorizontalIcon,
  ShoppingBag,
  SidebarIcon,
  Trophy,
} from "lucide-react";
import DashboardBreadcrumbs from "@/components/dashboard/dashboard-breadcrumbs";
import { SearchForm } from "@/components/dashboard/search-form";
import NotificationPopup from "./notification-popup";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useSidebar } from "@/components/ui/sidebar";
import { useGamification } from "@/hooks/use-gamification";
import { useAuth } from "@/lib/context/auth-provider";
import Link from "next/link";
import { MessageCircleIcon } from "lucide-react";
import { useEffect, useRef } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSubTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
} from "../ui/dropdown-menu";
import { Text } from "../ui/typography";

export function SiteHeader() {
  const { toggleSidebar } = useSidebar();
  const { claims } = useAuth();
  const { userStats, statsLoading, refreshStats } = useGamification();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Real-time updates for points
  useEffect(() => {
    if (!claims) return;

    // Refresh stats immediately when component mounts
    refreshStats();

    // Set up periodic refresh every 30 seconds
    intervalRef.current = setInterval(() => {
      refreshStats();
    }, 30000);

    // Listen for custom points update events
    const handlePointsUpdate = () => {
      refreshStats();
    };

    // Listen for page visibility changes to refresh when user comes back
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refreshStats();
      }
    };

    // Add event listeners
    window.addEventListener("points-updated", handlePointsUpdate);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handlePointsUpdate);

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      window.removeEventListener("points-updated", handlePointsUpdate);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handlePointsUpdate);
    };
  }, [claims, refreshStats]);

  return (
    <header className="bg-background sticky top-0 z-50 flex !w-full items-center border-b">
      <div className="flex h-(--header-height) w-full items-center gap-2 px-4">
        <Button
          className="h-8 w-8"
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
        >
          <SidebarIcon />
        </Button>
        <Separator orientation="vertical" className="mr-2 h-4" />
        <div className="flex w-full justify-between items-center gap-4">
          <Link href="/dashboard" className="items-center gap-2 hidden md:flex">
            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
              <Command className="size-4" />
            </div>
            <div className="text-left text-sm leading-tight">
              <Text as="p" className="font-bold text-lg">
                kawanstudy
              </Text>
            </div>
          </Link>

          <SearchForm />
          {/* Points Display & Store */}

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-full">
              <Trophy className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                {statsLoading
                  ? "..."
                  : userStats?.profile?.total_points?.toLocaleString()}
              </span>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size={"icon"}
                  variant={"ghost"}
                  className="flex md:hidden"
                >
                  <MoreHorizontalIcon className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="m-2">
                <DropdownMenuLabel>All Actions</DropdownMenuLabel>
                <DropdownMenuGroup>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      Create or Upload
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="m-2">
                      <DropdownMenuGroup>
                        <DropdownMenuItem asChild>
                          <Link href={"/dashboard/quiz/create"}>New Quiz</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={"/dashboard/notes/upload"}>
                            New Notes
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={"/dashboard/past-year/"}>
                            New Past Year Paper
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  <DropdownMenuItem asChild>
                    <Link href={"/dashboard/store"}>Point Store</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={"/dashboard/chat"}>Messages</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={"/dashboard/notifications"}>Notifications</Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="hidden md:flex ml-auto items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                asChild
                className="relative hover:bg-accent transition-colors"
              >
                <Link href="/dashboard/store">
                  <ShoppingBag className="h-5 w-5" />
                  <span className="sr-only">Points Store</span>
                </Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size={"icon"}
                    variant={"ghost"}
                    className="relative hover:bg-accent transition-colors"
                  >
                    <CirclePlusIcon className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Create or Upload</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                      <Link href={"/dashboard/quiz/create"}>New Quiz</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={"/dashboard/notes/upload"}>New Notes</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={"/dashboard/past-year/"}>
                        New Past Year Paper
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button size={"icon"} variant={"ghost"} asChild>
                <Link href="/dashboard/chat">
                  <MessageCircleIcon />
                </Link>
              </Button>
              <NotificationPopup />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
