"use client";

import { GamificationDashboard } from "@/components/gamification/gamification-dashboard";
import { DailyClaimButton } from "@/components/dashboard/daily-claim-button";
import { UserProfileCard } from "@/components/ui/user-profile-card";
import { useAuth } from "@/lib/context/auth-provider";
import { useGamification } from "@/hooks/use-gamification";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ShoppingBag, 
  Coins, 
  BookOpen, 
  Users, 
  MessageSquare, 
  Trophy, 
  Calendar, 
  Bell, 
  Target, 
  Star,
  TrendingUp,
  Clock,
  FileText,
  Video,
  Settings,
  Gift,
  Zap,
  Brain,
  PenTool
} from "lucide-react";
import { useState, useEffect } from "react";

export default function ProtectedPage() {
  const { claims } = useAuth();
  const { userStats, achievements, dailyChallenges } = useGamification();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Sample notices - in a real app, these would come from an API
  const notices = [
    {
      id: 1,
      title: "📚 New Study Materials Available",
      message: "Check out the latest notes on Advanced Mathematics and Physics",
      timestamp: "2 hours ago",
      type: "info",
      urgent: false
    },
    {
      id: 2,
      title: "🎉 Weekly Leaderboard Results",
      message: "Congratulations to this week's top performers! See your ranking.",
      timestamp: "1 day ago",
      type: "success",
      urgent: false
    },
    {
      id: 3,
      title: "⚡ System Maintenance Tonight",
      message: "Scheduled maintenance from 11 PM to 1 AM. Plan accordingly.",
      timestamp: "3 hours ago",
      type: "warning",
      urgent: true
    }
  ];

  const quickStats = [
    {
      title: "Total Points",
      value: userStats?.profile?.total_points || 0,
      icon: Coins,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50"
    },
    {
      title: "Study Sessions",
      value: "12",
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Notes Created",
      value: "8",
      icon: FileText,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Current Level",
      value: userStats?.profile?.level || 1,
      icon: Star,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    }
  ];

  const quickActions = [
    {
      title: "Points Store",
      description: "Customize your profile",
      icon: ShoppingBag,
      href: "/dashboard/store",
      color: "bg-gradient-to-r from-purple-500 to-pink-500"
    },
    {
      title: "Study Notes",
      description: "Access your materials",
      icon: BookOpen,
      href: "/dashboard/notes",
      color: "bg-gradient-to-r from-blue-500 to-cyan-500"
    },
    {
      title: "Find Study Buddy",
      description: "Connect with peers",
      icon: Users,
      href: "/dashboard/peer",
      color: "bg-gradient-to-r from-green-500 to-emerald-500"
    },
    {
      title: "Take Quiz",
      description: "Test your knowledge",
      icon: Brain,
      href: "/dashboard/quiz",
      color: "bg-gradient-to-r from-orange-500 to-red-500"
    },
    {
      title: "Gamification",
      description: "View achievements & challenges",
      icon: Trophy,
      href: "/gamification",
      color: "bg-gradient-to-r from-yellow-500 to-orange-500"
    },
    {
      title: "Video Call",
      description: "Start group study",
      icon: Video,
      href: "/video-call",
      color: "bg-gradient-to-r from-indigo-500 to-blue-500"
    },
    {
      title: "Chat Room",
      description: "Join discussions",
      icon: MessageSquare,
      href: "/dashboard/chat",
      color: "bg-gradient-to-r from-teal-500 to-green-500"
    }
  ];

  const getNoticeIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return 'ℹ️';
    }
  };

  const getNoticeColors = (type: string, urgent: boolean) => {
    if (urgent) return "border-red-200 bg-red-50";
    switch (type) {
      case 'success': return "border-green-200 bg-green-50";
      case 'warning': return "border-yellow-200 bg-yellow-50";
      case 'error': return "border-red-200 bg-red-50";
      default: return "border-blue-200 bg-blue-50";
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {claims?.username || 'Student'}!</h1>
          <p className="text-muted-foreground">
            {currentTime.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {currentTime.toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </Badge>
        </div>
      </div>

      {/* Notice Board */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notice Board
          </CardTitle>
          <CardDescription>
            Latest updates and announcements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {notices.map((notice) => (
              <div
                key={notice.id}
                className={`p-3 rounded-lg border ${getNoticeColors(notice.type, notice.urgent)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span>{getNoticeIcon(notice.type)}</span>
                      <h4 className="font-medium text-sm">{notice.title}</h4>
                      {notice.urgent && (
                        <Badge variant="destructive" className="text-xs">
                          URGENT
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {notice.message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {notice.timestamp}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => (
          <Card key={index} className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* User Profile Preview */}
          {claims && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Your Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          )}

          {/* Quick Actions Grid */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Quick Actions
              </CardTitle>
              <CardDescription>
                Access your favorite features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {quickActions.map((action, index) => (
                  <Link key={index} href={action.href}>
                    <Card className="cursor-pointer transition-all hover:scale-105 hover:shadow-md">
                      <CardContent className="p-4">
                        <div className="flex flex-col items-center text-center space-y-2">
                          <div className={`p-3 rounded-full ${action.color} text-white`}>
                            <action.icon className="h-6 w-6" />
                          </div>
                          <h3 className="font-semibold text-sm">{action.title}</h3>
                          <p className="text-xs text-muted-foreground">
                            {action.description}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Daily Bonus */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5" />
                Daily Bonus
                <Badge variant="secondary" className="text-xs">
                  Limited Time
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DailyClaimButton />
            </CardContent>
          </Card>

          {/* Recent Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Recent Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {achievements?.slice(0, 3).map((achievement, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                    <div className="text-2xl">🏆</div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{achievement.achievement_title}</p>
                      <p className="text-xs text-muted-foreground">
                        {achievement.achievement_description}
                      </p>
                    </div>
                  </div>
                )) || (
                  <p className="text-sm text-muted-foreground">
                    No achievements yet. Start studying to unlock them!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Daily Challenges */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Today's Challenges
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dailyChallenges?.slice(0, 2).map((challenge, index) => (
                  <div key={index} className="p-3 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">{challenge.challenge_name}</h4>
                      <Badge variant="outline" className="text-xs">
                        {challenge.points_reward} pts
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {challenge.challenge_description}
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${challenge.progress_percentage || 0}%` }}
                      ></div>
                    </div>
                  </div>
                )) || (
                  <p className="text-sm text-muted-foreground">
                    Check back tomorrow for new challenges!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PenTool className="h-5 w-5" />
                Quick Links
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Link href="/dashboard/notifications">
                  <Button variant="ghost" className="w-full justify-start text-sm">
                    <Bell className="h-4 w-4 mr-2" />
                    Notifications
                  </Button>
                </Link>
                <Link href="/dashboard/leaderboard">
                  <Button variant="ghost" className="w-full justify-start text-sm">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Leaderboard
                  </Button>
                </Link>
                <Link href="/dashboard/settings">
                  <Button variant="ghost" className="w-full justify-start text-sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Gamification Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Your Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <GamificationDashboard />
        </CardContent>
      </Card>
    </div>
  );
}
