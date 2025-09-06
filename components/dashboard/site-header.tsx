"use client";

import { SidebarIcon, Trophy } from "lucide-react";
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
    window.addEventListener('points-updated', handlePointsUpdate);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handlePointsUpdate);

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      window.removeEventListener('points-updated', handlePointsUpdate);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handlePointsUpdate);
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
        <DashboardBreadcrumbs />
        <SearchForm />
        
        {/* Points Display */}
        {claims && (
          <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-full">
            <Trophy className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
              {statsLoading ? "..." : userStats?.profile?.total_points?.toLocaleString() || "0"}
            </span>
          </div>
        )}
        
        <Button size={"icon"} variant={"ghost"} asChild>
          <Link href="/dashboard/chat">
            <MessageCircleIcon />
          </Link>
        </Button>
        <NotificationPopup />
      </div>
    </header>
  );
}
