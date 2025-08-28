"use client";

import React from "react";
import { toast } from "sonner";
import FeedbackForm from "@/components/feedback/feedback-form";
import { FeedbackFormData, FeedbackSubmissionResponse } from "@/lib/validations/feedback";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  Mail,
  ExternalLink,
  Heart,
  Bug,
  Lightbulb,
  Users,
} from "lucide-react";

export default function FeedbackPage() {
  const handleFeedbackSubmit = async (data: FeedbackFormData) => {
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to submit feedback");
      }

      const result: FeedbackSubmissionResponse = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || "Failed to submit feedback");
      }
      
      console.log("Feedback submitted successfully:", result);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      throw error; // Re-throw to let the form handle the error
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            We Value Your Feedback
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Help us make StudyPair better by sharing your thoughts, reporting issues, 
            or suggesting new features. Every piece of feedback matters to us.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Feedback Statistics */}
          <div className="lg:col-span-3 grid md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="flex items-center p-6">
                <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full mr-4">
                  <Bug className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">247</p>
                  <p className="text-sm text-muted-foreground">Bugs Fixed</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center p-6">
                <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full mr-4">
                  <Lightbulb className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">89</p>
                  <p className="text-sm text-muted-foreground">Features Added</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center p-6">
                <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full mr-4">
                  <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">1.2k+</p>
                  <p className="text-sm text-muted-foreground">Satisfied Users</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Feedback Form */}
          <div className="lg:col-span-2">
            <FeedbackForm onSubmit={handleFeedbackSubmit} />
          </div>

          {/* Sidebar Information */}
          <div className="space-y-6">
            {/* Quick Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  Quick Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Badge variant="outline" className="mb-2">Bug Reports</Badge>
                  <p className="text-sm text-muted-foreground">
                    Include steps to reproduce, expected vs actual behavior, and your browser/device info.
                  </p>
                </div>
                <div>
                  <Badge variant="outline" className="mb-2">Feature Requests</Badge>
                  <p className="text-sm text-muted-foreground">
                    Describe the problem you're trying to solve and why this feature would be helpful.
                  </p>
                </div>
                <div>
                  <Badge variant="outline" className="mb-2">UI/UX Issues</Badge>
                  <p className="text-sm text-muted-foreground">
                    Screenshots are extremely helpful for design and usability feedback.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Alternative Contact Methods */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Other Ways to Reach Us
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Email Support</p>
                    <p className="text-sm text-muted-foreground">
                      support@studypair.com
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Community Forum</p>
                    <p className="text-sm text-muted-foreground">
                      Join discussions with other users
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Response Time */}
            <Card>
              <CardHeader>
                <CardTitle>Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Critical Issues</span>
                    <Badge variant="destructive">24 hours</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Bug Reports</span>
                    <Badge variant="secondary">2-3 days</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Feature Requests</span>
                    <Badge variant="outline">1 week</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">General Feedback</span>
                    <Badge variant="outline">1 week</Badge>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Response times may vary during peak periods or holidays.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Thank You Message */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 rounded-lg p-6 text-center">
          <Heart className="h-8 w-8 text-red-500 mx-auto mb-3" />
          <h3 className="text-xl font-semibold mb-2">Thank You!</h3>
          <p className="text-muted-foreground">
            Your feedback helps us create a better learning experience for everyone. 
            We appreciate you taking the time to help us improve StudyPair.
          </p>
        </div>
      </div>
    </div>
  );
}
