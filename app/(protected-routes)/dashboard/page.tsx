"use client";

import { GamificationDashboard } from "@/components/gamification/gamification-dashboard";
import { DailyClaimButton } from "@/components/dashboard/daily-claim-button";
import { UserProfileCard } from "@/components/ui/user-profile-card";
import { useAuth } from "@/lib/context/auth-provider";
import { useGamification } from "@/hooks/use-gamification";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Coins } from "lucide-react";

export default function ProtectedPage() {
  const { claims } = useAuth();
  const { userStats } = useGamification();

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>

      {/* User Profile Preview */}
      {claims && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Your Profile</h2>
          <div className="max-w-sm">
            <UserProfileCard
              userId={claims.sub}
              username={claims.username || 'User'}
              avatarUrl={claims.avatar_url || ''}
              totalPoints={userStats?.profile?.total_points}
              level={userStats?.profile?.level}
              showStats={true}
            />
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="flex gap-4">
          <Link href="/dashboard/store">
            <Button className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              Visit Points Store
            </Button>
          </Link>
        </div>
      </div>

      {/* Temporary Daily Claim Button */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-xl font-semibold">Daily Bonus</h2>
          <span className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
            Temporary Feature
          </span>
        </div>
        <DailyClaimButton />
      </div>

      {/* <GamificationDashboard /> */}
    </div>
  );
}
