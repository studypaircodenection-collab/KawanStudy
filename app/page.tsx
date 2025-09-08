import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Trophy,
  BookOpen,
  MessageCircle,
  Calendar,
  Star,
  ArrowRight,
  Play,
  Target,
  Brain,
  Zap,
  ChevronRight,
} from "lucide-react";
import Header from "@/components/website/header";
import Footer from "@/components/website/footer";
import { Text } from "@/components/ui/typography";
import async from "./(protected-routes)/dashboard/notes/browse/[username]/page";

const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <Header />

      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <Text as="h1">
              Smart Tutoring Platform for{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Modern Students
              </span>
            </Text>
            <Text as="h3" className="my-4 text-muted-foreground font-normal">
              Connect with study partners, earn achievements, and transform your
              learning journey with our intelligent peer-to-peer tutoring
              ecosystem.
            </Text>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90"
                asChild
              >
                <Link href="/auth/sign-up">
                  Start Learning Today
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Text as="h2">Everything You Need to Excel</Text>
            <Text
              as="p"
              className="text-xl text-muted-foreground max-w-2xl my-2 mx-auto"
            >
              Comprehensive tools designed to make learning collaborative,
              engaging, and effective.
            </Text>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: "Peer-to-Peer Tutoring",
                description:
                  "Smart matching algorithm connects you with compatible study partners for effective collaboration.",
                color: "blue",
              },
              {
                icon: Trophy,
                title: "Gamification System",
                description:
                  "Earn points, badges, and climb leaderboards while staying motivated in your learning journey.",
                color: "purple",
              },
              {
                icon: Brain,
                title: "AI-Powered Quizzes",
                description:
                  "Adaptive quiz generation that adjusts difficulty based on your performance and learning pace.",
                color: "green",
              },
              {
                icon: MessageCircle,
                title: "Real-time Chat",
                description:
                  "Persistent messaging system to stay connected with your study partners and discussion groups.",
                color: "orange",
              },
              {
                icon: Calendar,
                title: "Schedule Manager",
                description:
                  "Intelligent scheduling tools to organize study sessions, assignments, and academic deadlines.",
                color: "red",
              },
              {
                icon: BookOpen,
                title: "Study Materials",
                description:
                  "Upload, share, and collaborate on notes, PDFs, and past year papers with annotation tools.",
                color: "indigo",
              },
            ].map((feature, index) => (
              <Card key={index} className=" border-0 shadow-none">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <feature.icon className="h-6 w-6 text-secondary-foreground" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Text as="p" styleVariant="muted">
                    {feature.description}
                  </Text>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-muted/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              How StudyPair Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get started in minutes and transform your study experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Create Your Profile",
                description:
                  "Sign up and set your academic interests, subjects, and learning goals to get personalized matches.",
                icon: Target,
              },
              {
                step: "02",
                title: "Find Study Partners",
                description:
                  "Our smart algorithm connects you with compatible peers based on subjects, schedules, and learning styles.",
                icon: Users,
              },
              {
                step: "03",
                title: "Start Learning Together",
                description:
                  "Collaborate through video calls, chat, shared notes, and gamified challenges to achieve your goals.",
                icon: Zap,
              },
            ].map((step, index) => (
              <div key={index} className="text-center relative">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                  <step.icon className="h-8 w-8 text-primary-foreground" />
                </div>
                <Badge variant="outline" className="mb-4">
                  {step.step}
                </Badge>
                <h3 className="text-xl font-semibold mb-4">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
                {index < 2 && (
                  <ChevronRight className="hidden md:block absolute top-8 -right-4 h-6 w-6 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-primary-foreground">
            {[
              { number: "10,000+", label: "Active Students" },
              { number: "50,000+", label: "Study Sessions" },
              { number: "95%", label: "Success Rate" },
              { number: "24/7", label: "Platform Access" },
            ].map((stat, index) => (
              <div key={index}>
                <div className="text-3xl md:text-4xl font-bold mb-2">
                  {stat.number}
                </div>
                <div className="text-primary-foreground/80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Ready to Transform Your Studies?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join StudyPair today and experience the future of collaborative
            learning.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90"
              asChild
            >
              <Link href="/auth/sign-up">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>

            <Button size="lg" variant="outline" asChild>
              <Link href="/auth/login">Sign In to Your Account</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Home;
