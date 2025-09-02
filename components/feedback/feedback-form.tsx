"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  feedbackSchema,
  FeedbackFormData,
  feedbackTypes,
  priorityLevels,
} from "@/lib/validations/feedback";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  Bug,
  Lightbulb,
  Palette,
  Zap,
  AlertCircle,
  Send,
  Loader2,
} from "lucide-react";

const feedbackIcons = {
  bug: Bug,
  feature: Lightbulb,
  ui: Palette,
  performance: Zap,
  general: MessageSquare,
  other: AlertCircle,
};

const priorityColors = {
  low: "bg-green-100 text-green-800 border-green-300",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-300",
  high: "bg-orange-100 text-orange-800 border-orange-300",
  critical: "bg-red-100 text-red-800 border-red-300",
};

interface FeedbackFormProps {
  onSubmit?: (data: FeedbackFormData) => Promise<void>;
}

export default function FeedbackForm({ onSubmit }: FeedbackFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [browserInfo, setBrowserInfo] = useState<string>("");

  const form = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      feedbackType: "",
      subject: "",
      description: "",
      priority: "medium",
      currentPage: "",
      contactEmail: "",
      browserInfo: "",
      additionalInfo: "",
    },
  });

  // Collect browser information
  useEffect(() => {
    if (typeof window !== "undefined") {
      const info = `${navigator.userAgent} | Screen: ${window.screen.width}x${window.screen.height} | Viewport: ${window.innerWidth}x${window.innerHeight}`;
      setBrowserInfo(info);
      form.setValue("browserInfo", info);
      form.setValue("currentPage", window.location.pathname);
    }
  }, [form]);

  const handleSubmit = async (data: FeedbackFormData) => {
    try {
      setIsSubmitting(true);

      if (onSubmit) {
        await onSubmit(data);
      } else {
        // Default submission logic - could be replaced with API call
        console.log("Feedback submitted:", data);

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      toast.success("Feedback submitted successfully!", {
        description: "Thank you for helping us improve our platform.",
      });

      form.reset();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("Failed to submit feedback", {
        description: "Please try again or contact support directly.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedType = form.watch("feedbackType");
  const selectedPriority = form.watch("priority");

  return (
    <Card className="w-full mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-blue-600" />
          Submit Feedback
        </CardTitle>
        <CardDescription>
          Help us improve your experience by reporting issues, suggesting
          features, or sharing your thoughts.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            {/* Feedback Type */}
            <FormField
              control={form.control}
              name="feedbackType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What type of feedback do you have?</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select feedback type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {feedbackTypes.map((type) => {
                        const Icon = feedbackIcons[type.value];
                        return (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              <div>
                                <div className="font-medium">{type.label}</div>
                                <div className="text-xs text-muted-foreground">
                                  {type.description}
                                </div>
                              </div>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Subject */}
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Brief summary of your feedback"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide a clear, concise title for your feedback
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Please provide detailed information about your feedback..."
                      className="min-h-[120px] resize-vertical"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {selectedType === "bug" &&
                      "Describe what happened, what you expected, and steps to reproduce the issue."}
                    {selectedType === "feature" &&
                      "Explain the feature you'd like to see and why it would be helpful."}
                    {selectedType === "ui" &&
                      "Describe the design or usability issue you encountered."}
                    {selectedType === "performance" &&
                      "Describe when and where you experienced slowness or lag."}
                    {(selectedType === "general" || selectedType === "other") &&
                      "Share your thoughts, suggestions, or any other feedback."}
                    {!selectedType &&
                      "Please provide as much detail as possible."}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Priority */}
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority Level</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {priorityLevels.map((priority) => (
                        <SelectItem key={priority.value} value={priority.value}>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                priorityColors[
                                  priority.value as keyof typeof priorityColors
                                ]
                              }`}
                            >
                              {priority.label}
                            </Badge>
                            <span>{priority.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Contact Email */}
            <FormField
              control={form.control}
              name="contactEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Email (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="your.email@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Leave your email if you&apos;d like us to follow up with you
                    about this feedback.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Additional Information */}
            <FormField
              control={form.control}
              name="additionalInfo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Information (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any other details that might be helpful..."
                      className="min-h-[80px] resize-vertical"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Screenshots, error messages, or any other relevant
                    information.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* System Information */}
            {browserInfo && (
              <div className="bg-muted/50 p-3 rounded-lg">
                <h4 className="text-sm font-medium mb-2">System Information</h4>
                <p className="text-xs text-muted-foreground break-all">
                  {browserInfo}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Current Page: {form.getValues("currentPage")}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting Feedback...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Feedback
                </>
              )}
            </Button>

            {/* Selected Priority Badge */}
            {selectedPriority && (
              <div className="flex items-center justify-center">
                <Badge
                  variant="outline"
                  className={`${
                    priorityColors[
                      selectedPriority as keyof typeof priorityColors
                    ]
                  } border-2`}
                >
                  {
                    priorityLevels.find((p) => p.value === selectedPriority)
                      ?.label
                  }{" "}
                  Priority
                </Badge>
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
