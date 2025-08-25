import { z } from "zod";

export const profileSchema = z.object({
  fullName: z
    .string()
    .min(1, "Full name is required")
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must be less than 100 characters"),

  username: z
    .string()
    .min(1, "Username is required")
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be less than 30 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    ),

  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),

  phone: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val.trim() === "") return true;
        const cleanPhone = val.replace(/[\s\-\(\)]/g, "");
        return /^[\+]?[1-9][\d]{0,15}$/.test(cleanPhone);
      },
      {
        message: "Please enter a valid phone number",
      }
    ),

  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),

  location: z
    .string()
    .max(100, "Location must be less than 100 characters")
    .optional(),

  university: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val.trim() === "") return true;
        return val.trim().length >= 2;
      },
      {
        message: "University name must be at least 2 characters",
      }
    ),

  yearOfStudy: z
    .enum([
      "1st Year",
      "2nd Year",
      "3rd Year",
      "4th Year",
      "Graduate",
      "PhD",
      "",
    ])
    .optional(),

  major: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val.trim() === "") return true;
        return val.trim().length >= 2;
      },
      {
        message: "Major must be at least 2 characters",
      }
    ),

  avatar: z.string().optional(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

// API payload schema for backend
export const profileApiSchema = z.object({
  full_name: z.string(),
  username: z.string(),
  email: z.string(),
  phone: z.string().optional(),
  bio: z.string().optional(),
  location: z.string().optional(),
  university: z.string().optional(),
  year_of_study: z.string().optional(),
  major: z.string().optional(),
  avatar_url: z.string().optional(),
});

export type ProfileApiData = z.infer<typeof profileApiSchema>;
