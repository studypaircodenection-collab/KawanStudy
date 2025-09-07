"use client";

import React, { useState, useEffect, lazy } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Upload,
  BookOpen,
  Users,
  TrendingUp,
  Clock,
  Download,
  Plus,
  Sparkles,
  Library,
  Loader2,
  BarChart3,
  Activity,
  AlertCircle,
  Heart,
  Award,
  GraduationCap,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { notesService } from "@/lib/services/notes";
import NoteCard from "@/components/notes/note-card";

// Lazy load components for better performance
const KawanStudyNotes = lazy(
  () => import("@/components/notes/kawanstudy-note")
);
const UiTMNotes = lazy(() => import("@/components/notes/uitm-notes"));

// Loading component
const LoadingSpinner = ({ message }: { message: string }) => (
  <div className="min-h-[400px] flex items-center justify-center">
    <div className="text-center">
      <Loader2 className="h-8 w-8 text-primary mx-auto mb-4 animate-spin" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  </div>
);

// Error component
const ErrorDisplay = ({
  message,
  retry,
}: {
  message: string;
  retry?: () => void;
}) => (
  <Alert variant="destructive" className="my-4">
    <AlertCircle className="h-4 w-4" />
    <AlertDescription className="flex items-center justify-between">
      <span>{message}</span>
      {retry && (
        <Button variant="outline" size="sm" onClick={retry}>
          Try Again
        </Button>
      )}
    </AlertDescription>
  </Alert>
);

// Types for real data
interface NotesStats {
  total_notes: number;
  active_users: number;
  total_downloads: number;
  total_subjects: number;
}

interface TrendingNote {
  id: string;
  title: string;
  description: string;
  subject: string;
  noteType: string;
  tags: string[];
  createdAt: string;
  estimatedReadTime: number;
  viewCount?: number;
  downloadCount?: number;
  likeCount?: number;
  thumbnailUrl?: string;
  userProfile?: {
    id: string;
    username: string;
    fullName: string;
    avatarUrl: string;
  };
}

interface RecentUpload {
  id: string;
  title: string;
  description: string;
  subject: string;
  createdAt: string;
  userProfile?: {
    username: string;
    fullName: string;
  };
}

interface TopContributor {
  id: string;
  username: string;
  fullName: string;
  avatarUrl?: string;
  noteCount: number;
  totalLikes: number;
  totalDownloads: number;
}

export default function NotesPage() {
  const [activeView, setActiveView] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Real data states
  const [stats, setStats] = useState<NotesStats | null>(null);
  const [trendingNotes, setTrendingNotes] = useState<TrendingNote[]>([]);
  const [recentUploads, setRecentUploads] = useState<RecentUpload[]>([]);
  const [topContributors, setTopContributors] = useState<TopContributor[]>([]);

  // Fetch dashboard stats
  const fetchStats = async () => {
    try {
      const response = await fetch("/api/dashboard/notes-stats");
      if (!response.ok) throw new Error("Failed to fetch stats");
      return await response.json();
    } catch (error) {
      console.error("Error fetching stats:", error);
      return {
        total_notes: 0,
        active_users: 0,
        total_downloads: 0,
        total_subjects: 0,
      };
    }
  };

  // Fetch trending notes (most liked/viewed in last week)
  const fetchTrendingNotes = async () => {
    try {
      const result = await notesService.searchNotes(
        "",
        {},
        "view_count",
        "desc",
        1,
        6
      );
      return result.notes;
    } catch (error) {
      console.error("Error fetching trending notes:", error);
      return [];
    }
  };

  // Fetch recent uploads
  const fetchRecentUploads = async () => {
    try {
      const result = await notesService.searchNotes(
        "",
        {},
        "created_at",
        "desc",
        1,
        5
      );
      return result.notes.map((note) => ({
        id: note.id,
        title: note.title,
        description: note.description,
        subject: note.subject,
        createdAt: note.createdAt,
        userProfile: note.userProfile,
      }));
    } catch (error) {
      console.error("Error fetching recent uploads:", error);
      return [];
    }
  };

  // Fetch top contributors
  const fetchTopContributors = async () => {
    try {
      const response = await fetch("/api/dashboard/top-contributors?limit=5");
      if (!response.ok) throw new Error("Failed to fetch contributors");
      return await response.json();
    } catch (error) {
      console.error("Error fetching top contributors:", error);
      return [];
    }
  };

  // Load all dashboard data
  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [statsData, trending, recent, contributors] = await Promise.all([
        fetchStats(),
        fetchTrendingNotes(),
        fetchRecentUploads(),
        fetchTopContributors(),
      ]);

      setStats(statsData);
      setTrendingNotes(trending);
      setRecentUploads(recent);
      setTopContributors(contributors);
    } catch (err) {
      console.error("Dashboard load error:", err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return `${Math.floor(diffInHours / 168)}w ago`;
  };

  if (loading) {
    return (
      <div className="container mx-auto space-y-8">
        <LoadingSpinner message="Loading dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto space-y-8">
        <ErrorDisplay message={error} retry={loadDashboardData} />
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-8">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-primary via-primary/90 to-secondary rounded-2xl p-8 text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 bg-black/10 rounded-2xl"></div>
        <div className="relative z-10 max-w-4xl">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-6 w-6" />
            <span className="text-lg font-medium">KawanStudy Notes Hub</span>
          </div>
          <h1 className="text-4xl font-bold mb-4">
            Your Gateway to Academic Excellence
          </h1>
          <p className="text-xl text-primary-foreground/90 mb-6 max-w-2xl">
            Discover, share, and access thousands of study notes from top
            students and educators worldwide.
          </p>
          <div className="flex gap-4">
            <Link href="/dashboard/notes/upload">
              <Button
                size="lg"
                className="bg-background text-primary hover:bg-background/90"
              >
                <Upload className="h-5 w-5 mr-2" />
                Upload Your Notes
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
              onClick={() => setActiveView("browse")}
            >
              <BookOpen className="h-5 w-5 mr-2" />
              Browse Notes
            </Button>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-8 right-8 opacity-20">
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className="w-3 h-3 bg-primary-foreground rounded-full animate-pulse"
                style={{ animationDelay: `${i * 0.1}s` }}
              ></div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats &&
          [
            {
              label: "Total Notes",
              value: formatNumber(stats.total_notes),
              icon: FileText,
              color: "text-cyan-600",
            },
            {
              label: "Active Users",
              value: formatNumber(stats.active_users),
              icon: Users,
              color: "text-emerald-600",
            },
            {
              label: "Downloads",
              value: formatNumber(stats.total_downloads),
              icon: Download,
              color: "text-purple-600",
            },
            {
              label: "Subjects",
              value: formatNumber(stats.total_subjects),
              icon: GraduationCap,
              color: "text-orange-600",
            },
          ].map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Card key={index} className="relative overflow-hidden shadow-lg">
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {stat.label}
                      </p>
                      <p className="text-3xl font-bold">{stat.value}</p>
                    </div>
                    <IconComponent className={`h-8 w-8 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
      </div>

      {/* Featured Notes Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-6 w-6 text-orange-500" />
            <h2 className="text-2xl font-bold">Trending Notes</h2>
          </div>
          {trendingNotes.length > 0 && (
            <Button variant="outline" asChild>
              <Link href={"/dashboard/notes/browse"}>View All</Link>
            </Button>
          )}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trendingNotes.length > 0 ? (
            trendingNotes
              .slice(0, 6)
              .map((note) => <NoteCard key={note.id} note={note} />)
          ) : (
            <div className="col-span-full text-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No trending notes yet
              </h3>
              <p className="text-muted-foreground mb-4">
                Be the first to upload a note and get it trending!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Uploads */}
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {recentUploads.length > 0 ? (
              <>
                {" "}
                <div className="flex items-center gap-3 mb-6">
                  <Clock className="h-6 w-6 text-green-500" />
                  <h2 className="text-2xl font-bold">Recent Uploads</h2>
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-700"
                  >
                    Fresh
                  </Badge>
                </div>
                {recentUploads.map((upload) => (
                  <Link
                    key={upload.id}
                    href={`/dashboard/notes/${upload.id}`}
                    className="my-4 block"
                  >
                    <Card className=" transition-all duration-300 cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center text-white relative overflow-hidden">
                              <FileText className="h-6 w-6 z-10" />
                              <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold flex items-center gap-2">
                                {upload.title}
                                <Badge className="bg-green-500 text-xs animate-pulse">
                                  NEW
                                </Badge>
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                by{" "}
                                <span className="font-medium text-primary">
                                  {upload.userProfile?.fullName ||
                                    upload.userProfile?.username ||
                                    "Unknown"}
                                </span>{" "}
                                • {upload.subject}
                              </p>
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {formatTimeAgo(upload.createdAt)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </>
            ) : null}

            <Card className="border-dashed border-2 transition-all cursor-pointer group">
              <CardContent className="p-8 text-center">
                <div className="relative">
                  <Plus className="h-12 w-12 text-muted-foreground mx-auto mb-4 group-hover:text-primary group-hover:scale-110 transition-all duration-300" />
                </div>
                <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                  Share Your Knowledge
                </h3>
                <p className="text-muted-foreground mb-4 group-hover:text-primary/80 transition-colors">
                  Upload your notes and help fellow students succeed
                </p>

                <Button
                  asChild
                  className="group-hover:scale-105 transition-transform duration-200"
                >
                  <Link href="/dashboard/notes/upload">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Notes
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Top Contributors */}
          <Card className="overflow-hidden pt-0">
            <CardHeader className="py-8 bg-gradient-to-r  border-b">
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-500" />
                Top Contributors
                <Badge className="bg-yellow-100 text-yellow-700 text-xs">
                  This Month
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {topContributors.length > 0 ? (
                topContributors.map((contributor, index) => (
                  <div
                    key={contributor.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
                  >
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full text-white font-bold text-sm relative overflow-hidden ${
                        index === 0
                          ? "bg-gradient-to-br from-yellow-400 to-yellow-600"
                          : index === 1
                          ? "bg-gradient-to-br from-gray-400 to-gray-600"
                          : "bg-gradient-to-br from-orange-400 to-orange-600"
                      }`}
                    >
                      <span className="z-10">#{index + 1}</span>
                      {index === 0 && (
                        <div className="absolute inset-0 bg-yellow-300/50 animate-pulse"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/dashboard/profile/${contributor.username}`}
                        className="font-medium group-hover:text-primary transition-colors truncate"
                      >
                        {contributor.fullName || contributor.username}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {contributor.noteCount} notes •{" "}
                        {formatNumber(contributor.totalLikes)} likes
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {index === 0 && (
                        <Sparkles className="h-3 w-3 text-yellow-500 animate-pulse" />
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground text-sm">
                    No contributors yet
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Dashboard Analytics Widget */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Quick Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-primary/5 rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {stats ? formatNumber(stats.total_notes) : "---"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Total Notes
                  </div>
                </div>
                <div className="text-center p-3 bg-primary/5 rounded-lg">
                  <div className="text-2xl font-bold text-primary ">
                    {stats ? formatNumber(stats.total_downloads) : "---"}
                  </div>
                  <div className="text-xs text-muted-foreground">Downloads</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/dashboard/notes/upload" className="block">
                <Button className="w-full justify-start" variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload New Notes
                </Button>
              </Link>
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => setActiveView("browse")}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Browse All Notes
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => setActiveView("uitm")}
              >
                <Library className="h-4 w-4 mr-2" />
                UiTM Resources
              </Button>
              <Link href="/dashboard/notes/my-notes" className="block">
                <Button className="w-full justify-start" variant="outline">
                  <Activity className="h-4 w-4 mr-2" />
                  My Notes
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Study Tip */}
      {/* <Card className="w-full bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="font-medium text-primary">Study Tip</span>
          </div>
          <p className="text-sm text-foreground/80">
            &ldquo;Active recall is more effective than passive reading. Try to
            explain concepts without looking at your notes!&rdquo;
          </p>
        </CardContent>
      </Card> */}
    </div>
  );
}
