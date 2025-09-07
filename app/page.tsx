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
  Github,
} from "lucide-react";

const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-background sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                <BookOpen className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                StudyPair
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#features"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                How It Works
              </a>
              <a
                href="#testimonials"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Reviews
              </a>
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
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-4">
              🏆 CodeNection 2025 Hackathon Winner
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Smart Tutoring Platform for{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Modern Students
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Connect with study partners, earn achievements, and transform your
              learning journey with our intelligent peer-to-peer tutoring
              ecosystem.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register">
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  Start Learning Today
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline">
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Everything You Need to Excel
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive tools designed to make learning collaborative,
              engaging, and effective.
            </p>
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
              <Card
                key={index}
                className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md"
              >
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <feature.icon className="h-6 w-6 text-secondary-foreground" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
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
                  Step {step.step}
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

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              What Students Say
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join thousands of students who have transformed their academic
              journey with StudyPair.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Chen",
                role: "Computer Science Student",
                content:
                  "StudyPair helped me find amazing study partners and improved my grades significantly. The gamification keeps me motivated!",
                rating: 5,
              },
              {
                name: "Ahmed Rahman",
                role: "Engineering Student",
                content:
                  "The AI-powered quizzes are incredible. They adapt to my learning pace and help me identify weak areas effectively.",
                rating: 5,
              },
              {
                name: "Emily Johnson",
                role: "Business Student",
                content:
                  "Best study platform I've used. The scheduling tools and real-time collaboration features are game-changers.",
                rating: 5,
              },
            ].map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-5 w-5 text-yellow-400 fill-current"
                      />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4">"{testimonial.content}"</p>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {testimonial.role}
                    </div>
                  </div>
                </CardContent>
              </Card>
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
            <Link href="/auth/register">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline">
                Sign In to Your Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary text-secondary-foreground py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold">StudyPair</span>
              </div>
              <p className="text-secondary-foreground/80 mb-4">
                Smart tutoring platform revolutionizing peer-to-peer learning
                for modern students.
              </p>
              <div className="flex space-x-4">
                <Github className="h-5 w-5 text-secondary-foreground/60 hover:text-secondary-foreground cursor-pointer" />
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-secondary-foreground/80">
                <li>
                  <a href="#" className="hover:text-secondary-foreground">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-secondary-foreground">
                    How It Works
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-secondary-foreground">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-secondary-foreground">
                    Mobile App
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-secondary-foreground/80">
                <li>
                  <a href="#" className="hover:text-secondary-foreground">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-secondary-foreground">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-secondary-foreground">
                    Community
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-secondary-foreground">
                    Status
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-secondary-foreground/80">
                <li>
                  <a href="#" className="hover:text-secondary-foreground">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-secondary-foreground">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-secondary-foreground">
                    Cookie Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-secondary-foreground">
                    GDPR
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-secondary-foreground/20 pt-8 text-center text-secondary-foreground/60">
            <p>
              &copy; 2025 StudyPair. All rights reserved. Built for CodeNection
              2025 Hackathon.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
