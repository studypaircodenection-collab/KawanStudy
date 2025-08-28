import { z } from "zod";

export const feedbackSchema = z.object({
  feedbackType: z
    .string()
    .min(1, "Please select a feedback type"),

  subject: z
    .string()
    .min(1, "Subject is required")
    .min(5, "Subject must be at least 5 characters")
    .max(100, "Subject must be less than 100 characters"),

  description: z
    .string()
    .min(1, "Description is required")
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description must be less than 2000 characters"),

  priority: z
    .string()
    .min(1, "Please select a priority level"),

  currentPage: z
    .string()
    .optional(),

  contactEmail: z
    .string()
    .optional()
    .refine((val) => {
      if (!val || val.trim() === "") return true;
      return z.string().email().safeParse(val).success;
    }, "Please enter a valid email address"),

  browserInfo: z
    .string()
    .optional(),

  additionalInfo: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) return true;
      return val.length <= 500;
    }, "Additional information must be less than 500 characters"),
});

export type FeedbackFormData = z.infer<typeof feedbackSchema>;

export const feedbackTypes = [
  { value: "bug", label: "Bug Report", description: "Report a technical issue or error" },
  { value: "feature", label: "Feature Request", description: "Suggest a new feature or improvement" },
  { value: "ui", label: "UI/UX Issue", description: "Report design or usability problems" },
  { value: "performance", label: "Performance Issue", description: "Report slow loading or lag" },
  { value: "general", label: "General Feedback", description: "General comments or suggestions" },
  { value: "other", label: "Other", description: "Something else not covered above" },
] as const;

export const priorityLevels = [
  { value: "low", label: "Low", description: "Minor issue, doesn't affect functionality" },
  { value: "medium", label: "Medium", description: "Moderate issue, some impact on user experience" },
  { value: "high", label: "High", description: "Important issue, significant impact" },
  { value: "critical", label: "Critical", description: "Urgent issue, blocks important functionality" },
] as const;

// API Response Types
export interface FeedbackSubmissionResponse {
  success: boolean;
  message: string;
  id?: string;
  errors?: any;
}
