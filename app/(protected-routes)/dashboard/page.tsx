"use client";

import { UserProfileCard } from "@/components/ui/user-profile-card";
import { useAuth } from "@/lib/context/auth-provider";
import { useGamification } from "@/hooks/use-gamification";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ShoppingBag,
  BookOpen,
  Users,
  MessageSquare,
  Trophy,
  Bell,
  Target,
  Star,
  Clock,
  Video,
  Zap,
  Brain,
  Award,
  CheckCircle,
  Flame,
  PlayCircle,
  ChevronRight,
  Lightbulb,
} from "lucide-react";
import { useState, useEffect } from "react";
import { DailyClaimButton } from "@/components/dashboard/daily-claim-button";
export default function ProtectedPage() {
  const { claims } = useAuth();
  const { userStats, achievements, dailyChallenges } = useGamification();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    const hour = new Date().getHours();

    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");

    return () => clearInterval(timer);
  }, []);

  // Enhanced notices with better categorization
  const notices = [
    {
      id: 1,
      title: "🎉 New Feature: AI Study Assistant",
      message: "Get personalized study recommendations powered by AI",
      type: "feature",
      urgent: false,
      timestamp: "2 hours ago",
      category: "Update",
    },
    {
      id: 2,
      title: "⚡ Server Maintenance Scheduled",
      message: "Brief maintenance window tonight from 2-3 AM EST",
      type: "warning",
      urgent: true,
      timestamp: "1 hour ago",
      category: "System",
    },
    {
      id: 3,
      title: "📚 Weekly Study Challenge",
      message: "Complete 5 quizzes this week to earn bonus points!",
      type: "success",
      urgent: false,
      timestamp: "3 hours ago",
      category: "Challenge",
    },
  ];

  // Enhanced quick stats with better design
  const quickStats = [
    {
      title: "Study Points",
      value: userStats?.profile?.total_points || 0,
      icon: Trophy,
      color: "text-primary",
      bgColor: "bg-secondary",
      trend: "+12%",
      description: "Total points earned",
    },
    {
      title: "Current Level",
      value: userStats?.profile?.level || 1,
      icon: Star,
      color: "text-primary",
      bgColor: "bg-secondary",
      trend: "+1",
      description: "Your current level",
    },
    {
      title: "Study Streak",
      value: 3, // Placeholder - can be connected to actual streak data later
      icon: Flame,
      color: "text-primary",
      bgColor: "bg-secondary",
      trend: "🔥",
      description: "Days in a row",
    },
    {
      title: "Achievements",
      value: achievements?.length || 0,
      icon: Award,
      color: "text-primary",
      bgColor: "bg-secondary",
      trend: "+2",
      description: "Unlocked badges",
    },
  ];

  const quickActions = [
    {
      title: "Points Store",
      description: "Customize your profile",
      icon: ShoppingBag,
      href: "/dashboard/store",
      color: "bg-primary",
    },
    {
      title: "Study Notes",
      description: "Access your materials",
      icon: BookOpen,
      href: "/dashboard/notes",
      color: "bg-primary",
    },
    {
      title: "Find Study Buddy",
      description: "Connect with peers",
      icon: Users,
      href: "/dashboard/peer",
      color: "bg-primary",
    },
    {
      title: "Take Quiz",
      description: "Test your knowledge",
      icon: Brain,
      href: "/dashboard/quiz",
      color: "bg-primary",
    },
    {
      title: "Gamification",
      description: "View achievements & challenges",
      icon: Trophy,
      href: "/gamification",
      color: "bg-primary",
    },
    {
      title: "Video Call",
      description: "Start group study",
      icon: Video,
      href: "/video-call",
      color: "bg-primary",
    },
    {
      title: "Chat Room",
      description: "Join discussions",
      icon: MessageSquare,
      href: "/dashboard/chat",
      color: "bg-primary",
    },
  ];

  const getNoticeIcon = (type: string) => {
    switch (type) {
      case "success":
        return "✅";
      case "warning":
        return "⚠️";
      case "error":
        return "❌";
      default:
        return "ℹ️";
    }
  };

  const getNoticeColors = (type: string, urgent: boolean) => {
    if (urgent) return "border-destructive bg-destructive/10";
    switch (type) {
      case "success":
        return "border-primary bg-primary/10";
      case "warning":
        return "border-primary bg-secondary";
      case "error":
        return "border-destructive bg-destructive/10";
      default:
        return "border-primary bg-secondary";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto space-y-8">
        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-lg bg-primary p-8 text-primary-foreground">
          <div className="relative z-10">
            <div className="flex flex-col-reverse  md:flex-row items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2">
                  {greeting},{" "}
                  {claims?.username || claims?.full_name || "Student"}! 👋
                </h1>
                <p className="text-primary-foreground/80 text-lg">
                  Ready to continue your learning journey?
                </p>
                <p className="text-primary-foreground/70 text-sm mt-1">
                  {currentTime.toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div className="text-right w-full md:w-1/4">
                <Badge
                  variant="secondary"
                  className="bg-primary/20 text-primary-foreground border-primary/30 mb-2"
                >
                  <Clock className="h-3 w-3 mr-1" />
                  {currentTime.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Badge>
                {claims && (
                  <div className="w-full">
                    <UserProfileCard
                      userId={claims.sub}
                      username={claims.username || "User"}
                      avatarUrl={claims.avatar_url || ""}
                      totalPoints={userStats?.profile?.total_points}
                      level={userStats?.profile?.level}
                      showStats={false}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-primary/10 rounded-full"></div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickStats.map((stat, index) => (
            <Card
              key={index}
              className="relative overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <CardContent>
                <div
                  className={`absolute inset-0 ${stat.bgColor} opacity-50`}
                ></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-card shadow-sm">
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                    {stat.trend && (
                      <Badge variant="outline" className="text-xs">
                        {stat.trend}
                      </Badge>
                    )}
                  </div>
                  <div>
                    <p className="text-3xl font-bold mb-1">{stat.value}</p>
                    <p className="text-sm font-medium text-foreground">
                      {stat.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {stat.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Notices & Quick Actions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Notice Board */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  📢 Latest Updates
                </CardTitle>
                <CardDescription>
                  Stay updated with the latest announcements
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {notices.map((notice) => (
                    <div
                      key={notice.id}
                      className={`relative p-4 rounded-xl border-l-4 ${getNoticeColors(
                        notice.type,
                        notice.urgent
                      )} hover:shadow-md transition-shadow`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">
                              {getNoticeIcon(notice.type)}
                            </span>
                            <h4 className="font-semibold">{notice.title}</h4>
                            {notice.urgent && (
                              <Badge
                                variant="destructive"
                                className="text-xs animate-pulse"
                              >
                                URGENT
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-xs">
                              {notice.category}
                            </Badge>
                          </div>
                          <p className="text-sm text-foreground mb-2">
                            {notice.message}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {notice.timestamp}
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions Grid */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Quick Actions
                </CardTitle>
                <CardDescription>
                  Jump into your favorite study activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {quickActions.map((action, index) => (
                    <Link key={index} href={action.href}>
                      <Card className="cursor-pointer transition-all duration-300 group">
                        <CardContent className="p-4">
                          <div className="flex flex-col items-center text-center space-y-3">
                            <div className="p-4 rounded-2xl bg-primary text-primary-foreground group-hover:scale-110 transition-transform">
                              <action.icon className="h-6 w-6" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-sm">
                                {action.title}
                              </h3>
                              <p className="text-xs text-muted-foreground">
                                {action.description}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Activity Feed & Challenges */}
          <div className="space-y-6">
            {/* Today's Challenges */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  🎯 Daily Challenges
                </CardTitle>
                <CardDescription>
                  Complete challenges to earn points!
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {dailyChallenges?.slice(0, 3).map((challenge, index) => (
                    <div
                      key={index}
                      className="space-y-3 p-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm">
                          {challenge.challenge_name}
                        </h4>
                        <Badge variant="outline" className="text-xs">
                          +{challenge.points_reward} pts
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {challenge.challenge_description}
                      </p>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Progress</span>
                          <span>{challenge.progress_percentage || 0}%</span>
                        </div>
                        <Progress
                          value={challenge.progress_percentage || 0}
                          className="h-2"
                        />
                      </div>
                      {!challenge.is_completed && (
                        <Button size="sm" className="w-full">
                          <PlayCircle className="h-4 w-4 mr-1" />
                          Continue
                        </Button>
                      )}
                      {challenge.is_completed && (
                        <Badge
                          variant="outline"
                          className="w-full justify-center text-primary"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Completed!
                        </Badge>
                      )}
                    </div>
                  )) || (
                    <div className="text-center py-6">
                      <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        No challenges yet. Check back tomorrow!
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            <DailyClaimButton />
            {/* Recent Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  🏆 Recent Achievements
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {achievements.length > 0 ? (
                    achievements?.slice(0, 3).map((achievement, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                      >
                        <div className="text-2xl">🏆</div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">
                            {achievement.achievement_title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {achievement.achievement_description}
                          </p>
                        </div>
                        <Badge variant="outline" className="bg-card">
                          {achievement.achievement_name}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6">
                      <Star className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Start studying to unlock achievements!
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Study Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Lightbulb className="h-5 w-5" />
                  💡 Study Tip of the Day
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-card p-4 rounded-lg shadow-sm">
                  <p className="text-sm text-foreground italic">
                    "Take regular breaks every 25-30 minutes to maintain focus
                    and improve retention. The Pomodoro Technique can boost your
                    productivity by up to 40%!"
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <Badge variant="outline" className="text-xs">
                      Study Method
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
