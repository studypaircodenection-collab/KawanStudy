import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  ArrowRight,
  CheckCircle,
  Users,
  Trophy,
  Brain,
  MessageCircle,
  Target,
  Zap,
  Github,
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                <BookOpen className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold">StudyPair</span>
            </Link>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="">
                Home
              </Link>
              <Link href="/about" className="font-medium">
                About
              </Link>
              <Link href="/contact" className="">
                Contact
              </Link>
              <Link href="/auth/login">
                <Button variant="outline" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-4">
              🎯 Our Mission
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Revolutionizing Education Through{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Peer Collaboration
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              StudyPair was born from the vision to make quality education
              accessible, engaging, and collaborative. We're building the future
              of peer-to-peer learning with intelligent technology and human
              connection.
            </p>
          </div>
        </div>
      </section>

      {/* Problem & Solution */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                The Challenge We're Solving
              </h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mt-0.5">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  </div>
                  <p className="text-gray-600">
                    Students struggle to find effective tutoring resources and
                    compatible study partners
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mt-0.5">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  </div>
                  <p className="text-gray-600">
                    Traditional tutoring is expensive, difficult to schedule,
                    and lacks personalization
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mt-0.5">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  </div>
                  <p className="text-gray-600">
                    Academic isolation leads to decreased motivation and poor
                    learning outcomes
                  </p>
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Our Solution
              </h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-0.5" />
                  <p className="text-gray-600">
                    Smart matching algorithm connects compatible study partners
                    instantly
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-0.5" />
                  <p className="text-gray-600">
                    Gamified learning system keeps students motivated and
                    engaged
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-0.5" />
                  <p className="text-gray-600">
                    Comprehensive tools for collaborative learning and progress
                    tracking
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8">
              Our Story
            </h2>
            <div className="prose prose-lg mx-auto text-gray-600">
              <p className="mb-6">
                StudyPair was created during the CodeNection 2025 Hackathon with
                a simple but powerful vision: to democratize access to quality
                tutoring and make learning a collaborative, engaging experience.
              </p>
              <p className="mb-6">
                Our team recognized that traditional tutoring models were
                failing students - they were expensive, inflexible, and often
                didn't provide the personalized attention students needed. We
                believed that peer-to-peer learning, enhanced by intelligent
                technology, could be the answer.
              </p>
              <p>
                Today, StudyPair serves thousands of students worldwide, helping
                them connect, learn, and succeed together. We're proud to be
                part of the educational revolution that puts students at the
                center of their learning journey.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Deep Dive */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              What Makes StudyPair Special
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Every feature is designed with student success in mind.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {[
              {
                icon: Brain,
                title: "AI-Powered Learning",
                description:
                  "Our intelligent algorithms adapt to your learning style, creating personalized quiz questions and study recommendations that evolve with your progress.",
                features: [
                  "Adaptive difficulty",
                  "Personalized content",
                  "Performance analytics",
                  "Smart recommendations",
                ],
              },
              {
                icon: Users,
                title: "Smart Matching",
                description:
                  "Advanced compatibility algorithms consider your subjects, schedule, learning style, and goals to find the perfect study partners.",
                features: [
                  "Subject compatibility",
                  "Schedule alignment",
                  "Learning style matching",
                  "Goal synchronization",
                ],
              },
              {
                icon: Trophy,
                title: "Gamification Engine",
                description:
                  "Stay motivated with our comprehensive reward system featuring points, badges, daily challenges, and competitive leaderboards.",
                features: [
                  "Daily challenges",
                  "Achievement badges",
                  "Progress tracking",
                  "Leaderboards",
                ],
              },
              {
                icon: MessageCircle,
                title: "Seamless Communication",
                description:
                  "Real-time messaging, video calls, screen sharing, and collaborative tools keep you connected with your study partners.",
                features: [
                  "Real-time chat",
                  "Video calling",
                  "Screen sharing",
                  "File sharing",
                ],
              },
            ].map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{feature.description}</p>
                  <ul className="space-y-2">
                    {feature.features.map((item, i) => (
                      <li key={i} className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-gray-600">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Vision & Future */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Our Vision for the Future
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              We're building more than just a platform - we're creating a global
              community of learners where knowledge flows freely and every
              student has the opportunity to succeed.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <Target className="h-8 w-8 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Global Reach</h3>
                <p className="text-blue-100 text-sm">
                  Connecting students worldwide
                </p>
              </div>
              <div className="text-center">
                <Zap className="h-8 w-8 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">AI Innovation</h3>
                <p className="text-blue-100 text-sm">
                  Cutting-edge learning technology
                </p>
              </div>
              <div className="text-center">
                <Users className="h-8 w-8 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Community First</h3>
                <p className="text-blue-100 text-sm">
                  Fostering collaborative learning
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Join the Learning Revolution
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Be part of a community that believes in the power of collaborative
            learning.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Start Your Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline">
                Get in Touch
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <Link href="/" className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">StudyPair</span>
              </Link>
              <p className="text-gray-400 mb-4">
                Smart tutoring platform revolutionizing peer-to-peer learning
                for modern students.
              </p>
              <div className="flex space-x-4">
                <Github className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer" />
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/" className="hover:text-white">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-white">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Community
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Status
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Cookie Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    GDPR
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>
              &copy; 2025 StudyPair. All rights reserved. Built for CodeNection
              2025 Hackathon.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
