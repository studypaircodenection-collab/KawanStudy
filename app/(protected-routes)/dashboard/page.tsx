import { GamificationDashboard } from "@/components/gamification/gamification-dashboard";

export default async function ProtectedPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Track your progress and achievements
        </p>
      </div>
      <GamificationDashboard />
    </div>
  );
}
