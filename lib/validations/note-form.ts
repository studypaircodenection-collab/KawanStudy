import { z } from "zod";

export const noteFormSchema = z.object({
  // Basic Information
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be less than 200 characters"),
  description: z
    .string()
    .max(1000, "Description must be less than 1000 characters")
    .or(z.literal(""))
    .optional(),

  // Academic Context
  subject: z.string().min(1, "Subject is required"),
  topic: z
    .string()
    .max(100, "Topic must be less than 100 characters")
    .or(z.literal(""))
    .optional(),
  academicLevel: z.string().min(1, "Academic level is required"),
  institution: z.string().max(100).or(z.literal("")).optional(),
  course: z.string().max(100).or(z.literal("")).optional(),
  professor: z.string().max(100).or(z.literal("")).optional(),
  semester: z.string().max(50).or(z.literal("")).optional(),

  // Classification
  noteType: z.string().min(1, "Note type is required"),
  tags: z.array(z.string().min(1).max(30)).max(10, "Maximum 10 tags allowed"),
  language: z.string().min(1, "Language is required"),
  format: z.string().min(1, "Format is required"),
  difficulty: z.string().optional(),

  // Source & Attribution
  sourceType: z.string().min(1, "Source type is required"),
  sourceReference: z.string().max(500).or(z.literal("")).optional(),

  // Sharing & Permissions
  sharingOption: z.string().min(1, "Sharing option is required"),
  allowDownload: z.boolean().default(true),
  allowComments: z.boolean().default(true),

  // Metadata
  estimatedReadTime: z.coerce.number().min(0).max(1440).default(0), // 👈 coerce string -> number
  textContent: z.string().optional(),
});

// Full type (everything resolved with defaults)
export type NoteFormSchema = z.infer<typeof noteFormSchema>;

// Partial type for defaults and form initialization
export type NoteFormInput = z.input<typeof noteFormSchema>;

// Default values for the form
export const noteFormDefaults: Partial<NoteFormSchema> = {
  // Basic Information
  title: "",
  description: "", // ✅ allowed because schema accepts "" or string

  // Academic Context
  subject: "",
  topic: "", // ✅ same reason
  academicLevel: "",
  institution: "",
  course: "",
  professor: "",
  semester: "",

  // Classification
  noteType: "",
  tags: [],
  language: "",
  format: "",
  difficulty: "",

  // Source & Attribution
  sourceType: "",
  sourceReference: "",

  // Sharing & Permissions
  sharingOption: "",
  allowDownload: true,
  allowComments: true,

  // Metadata
  estimatedReadTime: 0, // ✅ coerced into number if string input
  textContent: "",
};
