"use client";

import { GamificationDashboard } from "@/components/gamification/gamification-dashboard";
import { DailyClaimButton } from "@/components/dashboard/daily-claim-button";

export default function ProtectedPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
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
