"use client";

import React, { useState, Suspense, lazy } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Upload,
  BookOpen,
  Users,
  TrendingUp,
  Star,
  Clock,
  Eye,
  Download,
  Plus,
  Sparkles,
  Library,
  GraduationCap,
  FileText,
  Heart,
  Share2,
  Award,
  Loader2,
} from "lucide-react";
import Link from "next/link";

// Lazy load components for better performance
const KawanStudyNotes = lazy(() => import("@/components/notes/kawanstudy-note"));
const UiTMNotes = lazy(() => import("@/components/notes/uitm-notes"));

// Loading component
const LoadingSpinner = ({ message }: { message: string }) => (
  <div className="min-h-[400px] flex items-center justify-center">
    <div className="text-center">
      <Loader2 className="h-8 w-8 text-blue-600 mx-auto mb-4 animate-spin" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  </div>
);

// Mock data for featured content
const featuredNotes = [
  {
    id: "1",
    title: "Advanced Calculus Integration Techniques",
    author: "Dr. Sarah Chen",
    subject: "Mathematics",
    views: 2847,
    downloads: 892,
    rating: 4.9,
    thumbnail: "/placeholder-math.jpg",
    tags: ["Calculus", "Integration", "Advanced"],
    timeAgo: "2 days ago",
    trending: true,
  },
  {
    id: "2",
    title: "Organic Chemistry Reaction Mechanisms",
    author: "Prof. Michael Johnson",
    subject: "Chemistry",
    views: 1965,
    downloads: 743,
    rating: 4.8,
    thumbnail: "/placeholder-chemistry.jpg",
    tags: ["Organic", "Reactions", "Mechanisms"],
    timeAgo: "1 week ago",
    trending: true,
  },
  {
    id: "3",
    title: "Machine Learning Algorithms Guide",
    author: "Alex Rodriguez",
    subject: "Computer Science",
    views: 3521,
    downloads: 1205,
    rating: 4.95,
    thumbnail: "/placeholder-cs.jpg",
    tags: ["ML", "Algorithms", "AI"],
    timeAgo: "3 days ago",
    trending: true,
  },
];

const recentUploads = [
  {
    id: "1",
    title: "Quantum Physics Fundamentals",
    author: "Emma Wilson",
    subject: "Physics",
    uploadTime: "2 hours ago",
    isNew: true,
  },
  {
    id: "2",
    title: "Shakespeare Literary Analysis",
    author: "James Parker",
    subject: "Literature",
    uploadTime: "5 hours ago",
    isNew: true,
  },
  {
    id: "3",
    title: "Data Structures & Algorithms",
    author: "Maria Garcia",
    subject: "Computer Science",
    uploadTime: "1 day ago",
    isNew: false,
  },
];

const topUploaders = [
  { name: "Dr. Sarah Chen", notes: 47, likes: 2847, avatar: "/avatar1.jpg" },
  { name: "Prof. Michael Johnson", notes: 35, likes: 2103, avatar: "/avatar2.jpg" },
  { name: "Emma Wilson", notes: 28, likes: 1876, avatar: "/avatar3.jpg" },
];

const stats = [
  { label: "Total Notes", value: "12,847", icon: FileText, color: "text-blue-600" },
  { label: "Active Users", value: "3,254", icon: Users, color: "text-green-600" },
  { label: "Downloads", value: "89,432", icon: Download, color: "text-purple-600" },
  { label: "Subjects", value: "127", icon: GraduationCap, color: "text-orange-600" },
];

export default function NotesPage() {
  const [activeView, setActiveView] = useState("overview");

  return (
    <div className="container mx-auto space-y-8">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20 rounded-2xl"></div>
        <div className="relative z-10 max-w-4xl">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-6 w-6" />
            <span className="text-lg font-medium">StudyPair Notes Hub</span>
          </div>
          <h1 className="text-4xl font-bold mb-4">
            Your Gateway to Academic Excellence
          </h1>
          <p className="text-xl text-white/90 mb-6 max-w-2xl">
            Discover, share, and access thousands of study notes from top students and educators worldwide.
          </p>
          <div className="flex gap-4">
            <Link href="/dashboard/notes/upload">
              <Button size="lg" className="bg-white text-black hover:bg-white/90">
                <Upload className="h-5 w-5 mr-2" />
                Upload Your Notes
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white/30 text-white hover:bg-white/10"
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
            {Array.from({length: 9}).map((_, i) => (
              <div key={i} className="w-3 h-3 bg-white rounded-full animate-pulse" 
                   style={{animationDelay: `${i * 0.1}s`}}></div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index} className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                  <IconComponent className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs value={activeView} onValueChange={setActiveView} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="browse" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Browse Notes
          </TabsTrigger>
          <TabsTrigger value="uitm" className="flex items-center gap-2">
            <Library className="h-4 w-4" />
            UiTM Resources
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8">
          {/* Featured Notes Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-6 w-6 text-orange-500" />
                <h2 className="text-2xl font-bold">Trending Notes</h2>
                <Badge variant="secondary" className="bg-orange-100 text-orange-700 animate-pulse">
                  <Star className="h-3 w-3 mr-1" />
                  Hot
                </Badge>
              </div>
              <Button variant="outline" onClick={() => setActiveView("browse")}>
                View All
              </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredNotes.map((note, index) => (
                <Link key={note.id} href={`/dashboard/notes/${note.id}`}>
                  <Card className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border-0 shadow-md">
                    <div className="relative">
                      <div className="aspect-video bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-t-lg flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10"></div>
                        <FileText className="h-16 w-16 text-gray-400 z-10" />
                        <div className="absolute top-2 left-2 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      </div>
                      {note.trending && (
                        <Badge className="absolute top-2 right-2 bg-gradient-to-r from-red-500 to-pink-500 animate-bounce">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Trending
                        </Badge>
                      )}
                      <div className="absolute -bottom-3 left-4">
                        <Badge className="bg-white shadow-lg text-gray-700 border">
                          {note.subject}
                        </Badge>
                      </div>
                    </div>
                  <CardContent className="p-6 pt-8">
                    <h3 className="font-bold text-lg mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {note.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      by <span className="font-medium text-blue-600">{note.author}</span>
                    </p>
                    
                    <div className="flex flex-wrap gap-1 mb-4">
                      {note.tags.slice(0, 3).map((tag, tagIndex) => (
                        <Badge 
                          key={tag} 
                          variant="outline" 
                          className="text-xs hover:bg-gray-100 transition-colors"
                          style={{ animationDelay: `${tagIndex * 0.1}s` }}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                          <Eye className="h-4 w-4" />
                          {note.views.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1 hover:text-green-600 transition-colors">
                          <Download className="h-4 w-4" />
                          {note.downloads}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{note.rating}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{note.timeAgo}</span>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-red-50">
                            <Heart className="h-4 w-4 hover:text-red-500 transition-colors" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-blue-50">
                            <Share2 className="h-4 w-4 hover:text-blue-500 transition-colors" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Recent Uploads */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <Clock className="h-6 w-6 text-green-500" />
                <h2 className="text-2xl font-bold">Recent Uploads</h2>
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  Fresh
                </Badge>
              </div>

              <div className="space-y-4">
                {recentUploads.map((upload, index) => (
                  <Link key={upload.id} href={`/dashboard/notes/${upload.id}`}>
                    <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 border-l-4 border-l-transparent hover:border-l-blue-500 cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white relative overflow-hidden">
                              <FileText className="h-6 w-6 z-10" />
                              <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                            </div>
                            <div>
                              <h3 className="font-semibold flex items-center gap-2">
                                {upload.title}
                                {upload.isNew && (
                                  <Badge className="bg-green-500 text-xs animate-pulse">NEW</Badge>
                                )}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                by <span className="font-medium text-blue-600">{upload.author}</span> • {upload.subject}
                              </p>
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {upload.uploadTime}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
                
                <Card className="border-dashed border-2 hover:border-solid hover:shadow-lg transition-all cursor-pointer group hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50">
                  <CardContent className="p-8 text-center">
                    <div className="relative">
                      <Plus className="h-12 w-12 text-muted-foreground mx-auto mb-4 group-hover:text-blue-600 group-hover:scale-110 transition-all duration-300" />
                      <div className="absolute inset-0 bg-blue-400/20 rounded-full scale-0 group-hover:scale-100 transition-transform duration-500"></div>
                    </div>
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-700 transition-colors">Share Your Knowledge</h3>
                    <p className="text-muted-foreground mb-4 group-hover:text-blue-600/80 transition-colors">
                      Upload your notes and help fellow students succeed
                    </p>
                    <Link href="/dashboard/notes/upload">
                      <Button className="group-hover:scale-105 transition-transform duration-200">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Notes
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Top Contributors */}
              <Card className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50 border-b">
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-yellow-500" />
                    Top Contributors
                    <Badge className="bg-yellow-100 text-yellow-700 text-xs">This Month</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-4">
                  {topUploaders.map((uploader, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full text-white font-bold text-sm relative overflow-hidden ${
                        index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                        index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-600' :
                        'bg-gradient-to-br from-orange-400 to-orange-600'
                      }`}>
                        <span className="z-10">#{index + 1}</span>
                        {index === 0 && (
                          <div className="absolute inset-0 bg-yellow-300/50 animate-pulse"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium group-hover:text-blue-600 transition-colors truncate">{uploader.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {uploader.notes} notes • {uploader.likes.toLocaleString()} likes
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="h-4 w-4 text-red-500 group-hover:scale-110 transition-transform" />
                        {index === 0 && <Sparkles className="h-3 w-3 text-yellow-500 animate-pulse" />}
                      </div>
                    </div>
                  ))}
                  <div className="pt-2 border-t">
                    <Button variant="ghost" className="w-full text-sm">
                      View Full Leaderboard
                    </Button>
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
                </CardContent>
              </Card>

              {/* Study Tip */}
              <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-purple-600" />
                    <span className="font-medium text-purple-800">Study Tip</span>
                  </div>
                  <p className="text-sm text-purple-700">
                    "Active recall is more effective than passive reading. Try to explain concepts without looking at your notes!"
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Call to Action */}
          <Card className="mt-8 overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white border-0">
            <CardContent className="p-8 text-center relative">
              <div className="absolute inset-0 bg-grid-white/10"></div>
              <div className="relative z-10">
                <Sparkles className="h-12 w-12 mx-auto mb-4 text-yellow-300" />
                <h3 className="text-2xl font-bold mb-2">Share Your Knowledge</h3>
                <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                  Join thousands of students sharing notes and building a collaborative learning community. 
                  Upload your first note today and help others succeed!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/dashboard/notes/upload">
                    <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 font-semibold">
                      <Upload className="mr-2 h-5 w-5" />
                      Upload Notes
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="border-white/30 text-white hover:bg-white/10 backdrop-blur"
                  >
                    <Heart className="mr-2 h-5 w-5" />
                    Join Community
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="browse">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Browse Community Notes</h2>
            <p className="text-muted-foreground">Explore thousands of study materials shared by students and educators worldwide.</p>
          </div>
          <Suspense fallback={<LoadingSpinner message="Loading community notes..." />}>
            <KawanStudyNotes />
          </Suspense>
        </TabsContent>

        <TabsContent value="uitm">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">UiTM Resources</h2>
            <p className="text-muted-foreground">Access UiTM's digital library including e-books, past year papers, and academic resources.</p>
          </div>
          <Suspense fallback={<LoadingSpinner message="Loading UiTM resources..." />}>
            <UiTMNotes />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}
