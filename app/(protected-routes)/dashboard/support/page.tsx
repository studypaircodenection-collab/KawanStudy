"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Search,
  MessageCircle,
  Phone,
  Mail,
  Clock,
  HelpCircle,
  BookOpen,
  Video,
  FileText,
  AlertCircle,
  ExternalLink,
  Users,
  Settings,
  CreditCard,
  Shield,
} from "lucide-react";
import Link from "next/link";

const SupportPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const supportCategories = [
    { id: "all", name: "All Topics", icon: HelpCircle },
    { id: "account", name: "Account & Login", icon: Users },
    { id: "features", name: "Using Features", icon: Settings },
    { id: "billing", name: "Billing & Plans", icon: CreditCard },
    { id: "technical", name: "Technical Issues", icon: AlertCircle },
    { id: "privacy", name: "Privacy & Security", icon: Shield },
  ];

  const faqs = [
    {
      category: "account",
      question: "How do I reset my password?",
      answer:
        "Go to the login page and click 'Forgot Password'. Enter your email address and we'll send you a reset link within 5 minutes.",
    },
    {
      category: "account",
      question: "Can I change my email address?",
      answer:
        "Yes, go to Settings > Account Settings > Email Address. You'll need to verify your new email address before the change takes effect.",
    },
    {
      category: "features",
      question: "How do I find a study partner?",
      answer:
        "Use the Peer Search feature in your dashboard. You can filter by subject, study level, and availability to find the perfect match.",
    },
    {
      category: "features",
      question: "How does the gamification system work?",
      answer:
        "Earn points by completing study sessions, sharing notes, and helping peers. Points unlock achievements and improve your leaderboard ranking.",
    },
    {
      category: "features",
      question: "How can I share my notes with others?",
      answer:
        "Go to the Notes section, select your note, and click 'Share'. You can choose to share with specific users or make it publicly available.",
    },
    {
      category: "technical",
      question: "The video chat isn't working properly",
      answer:
        "Check your browser permissions for camera and microphone. Try refreshing the page or using a different browser. Chrome and Firefox work best.",
    },
    {
      category: "technical",
      question: "I'm experiencing slow loading times",
      answer:
        "Clear your browser cache, check your internet connection, or try switching to a different network. Contact us if the issue persists.",
    },
    {
      category: "billing",
      question: "How can I cancel my subscription?",
      answer:
        "Go to Settings > Billing > Manage Subscription. You can cancel anytime and your access continues until the end of your billing period.",
    },
    {
      category: "billing",
      question: "What payment methods do you accept?",
      answer:
        "We accept all major credit cards, PayPal, and bank transfers. Student discounts are available with valid verification.",
    },
    {
      category: "privacy",
      question: "How is my data protected?",
      answer:
        "We use industry-standard encryption and never share your personal information. Read our Privacy Policy for complete details.",
    },
    {
      category: "privacy",
      question: "Can I delete my account permanently?",
      answer:
        "Yes, go to Settings > Account > Delete Account. This action is irreversible and will permanently remove all your data.",
    },
  ];

  const quickLinks = [
    {
      title: "Video Tutorials",
      description: "Step-by-step guides for all features",
      icon: Video,
      link: "/tutorials",
      badge: "Popular",
    },
    {
      title: "User Guide",
      description: "Complete documentation",
      icon: BookOpen,
      link: "/user-guide",
    },
    {
      title: "API Documentation",
      description: "For developers and integrations",
      icon: FileText,
      link: "/api-docs",
    },
    {
      title: "Community Forum",
      description: "Connect with other users",
      icon: Users,
      link: "/community",
      badge: "Active",
    },
  ];

  const filteredFaqs = faqs.filter(
    (faq) =>
      (selectedCategory === "all" || faq.category === selectedCategory) &&
      (searchQuery === "" ||
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            How Can We Help You?
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get instant answers to common questions, access our knowledge base,
            or contact our support team directly.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Card>
            <CardContent className="text-center">
              <Mail className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Email Support</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Send us a detailed message
              </p>
              <div className="flex items-center justify-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Response in 2-4 hours</span>
              </div>
              <Button variant="outline" className="w-full">
                <Mail className="w-4 h-4 mr-2" />
                Send Email
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="text-center">
              <Phone className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Phone Support</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Speak with our team directly
              </p>
              <div className="flex items-center justify-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Mon-Fri 9AM-6PM</span>
              </div>
              <Button variant="outline" className="w-full">
                <Phone className="w-4 h-4 mr-2" />
                +1 (555) 123-4567
              </Button>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="faq" className="w-full">
          <TabsList className="grid w-full mb-2 grid-cols-2">
            <TabsTrigger value="faq">FAQ</TabsTrigger>
            <TabsTrigger value="guides">Guides & Tutorials</TabsTrigger>
          </TabsList>

          <TabsContent value="faq" className="space-y-6">
            {/* Search and Filter */}
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search frequently asked questions..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {supportCategories.map((category) => {
                  const IconComponent = category.icon;
                  return (
                    <Button
                      key={category.id}
                      variant={
                        selectedCategory === category.id ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      <IconComponent className="w-4 h-4 mr-2" />
                      {category.name}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* FAQ List */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedCategory === "all"
                    ? "Frequently Asked Questions"
                    : `${
                        supportCategories.find((c) => c.id === selectedCategory)
                          ?.name
                      } Questions`}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {filteredFaqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-left">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent>
                        <p className="text-muted-foreground">{faq.answer}</p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>

                {filteredFaqs.length === 0 && (
                  <div className="text-center py-12">
                    <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      No Results Found
                    </h3>
                    <p className="text-muted-foreground">
                      Try adjusting your search or browse other categories
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="guides" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              {quickLinks.map((link, index) => {
                const IconComponent = link.icon;
                return (
                  <Card key={index} className="relative">
                    {link.badge && (
                      <Badge
                        className="absolute top-4 right-4"
                        variant="secondary"
                      >
                        {link.badge}
                      </Badge>
                    )}
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                          <IconComponent className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold mb-2">
                            {link.title}
                          </h3>
                          <p className="text-muted-foreground mb-4">
                            {link.description}
                          </p>
                          <Button variant="outline" size="sm" className="gap-2">
                            Learn More
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>

        {/* Still Need Help Section */}
        <Card className="mt-8">
          <CardContent className="p-8 text-center">
            <MessageCircle className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold mb-2">Still Need Help?</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Can&aspos;t find what you&aspos;re looking for? Our support team is here to
              help. We typically respond within 2-4 hours during business hours.
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/dashboard/feedback">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Drop a feedback
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SupportPage;
