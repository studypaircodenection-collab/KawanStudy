// Types for the Notes Upload System
export interface NoteUpload {
  id?: string;
  title: string;
  description: string;
  content?: string; // For rich text notes
  contentType: "pdf" | "text";

  // Academic Context
  subject: string;
  topic: string;
  academicLevel: "high-school" | "undergraduate" | "graduate" | "professional";
  gradeYear?: string;
  institution?: string;

  // Classification
  tags: string[];
  noteType:
    | "lecture-notes"
    | "summary"
    | "cheat-sheet"
    | "practice-problems"
    | "solutions"
    | "mind-map"
    | "other";
  language: "english" | "bahasa-malaysia" | "chinese" | "tamil" | "other";
  difficultyLevel: "beginner" | "intermediate" | "advanced";

  // Sharing
  visibility: "public" | "friends-only" | "private";
  targetAudience: "students" | "educators" | "general";
  license: "cc-by" | "cc-by-sa" | "cc-by-nc" | "all-rights-reserved";

  // Source & Attribution
  sourceAttribution?: string;
  professor?: string;
  semester?: string;

  // File information (for PDF uploads)
  fileName?: string;
  fileSize?: number;
  fileUrl?: string;

  // Metadata
  createdAt?: Date;
  updatedAt?: Date;
  userId?: string;
}

export interface NoteUploadFormData
  extends Omit<NoteUpload, "id" | "createdAt" | "updatedAt" | "userId"> {
  file?: File;
}

// Form data interface for the upload form
export interface NoteFormData {
  title: string;
  description: string;
  subject: string;
  topic: string;
  academicLevel: string;
  institution: string;
  course: string;
  professor: string;
  semester: string;
  noteType: string;
  tags: string[];
  language: string;
  format: string;
  difficulty: string;
  sourceType: string;
  sourceReference: string;
  sharingOption: string;
  allowDownload: boolean;
  allowComments: boolean;
  estimatedReadTime: number;
  textContent: string;
}

// Predefined options for form fields
export const SUBJECTS = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Computer Science",
  "Engineering",
  "Economics",
  "Accounting",
  "Business Studies",
  "History",
  "Geography",
  "Literature",
  "Language Studies",
  "Art & Design",
  "Music",
  "Other",
] as const;

export const ACADEMIC_LEVELS = [
  { value: "high-school", label: "High School" },
  { value: "undergraduate", label: "Undergraduate" },
  { value: "graduate", label: "Graduate" },
  { value: "professional", label: "Professional" },
] as const;

export const NOTE_TYPES = [
  { value: "lecture-notes", label: "Lecture Notes" },
  { value: "summary", label: "Summary" },
  { value: "cheat-sheet", label: "Cheat Sheet" },
  { value: "practice-problems", label: "Practice Problems" },
  { value: "solutions", label: "Solutions" },
  { value: "mind-map", label: "Mind Map" },
  { value: "other", label: "Other" },
] as const;

export const LANGUAGES = [
  { value: "english", label: "English" },
  { value: "bahasa-malaysia", label: "Bahasa Malaysia" },
  { value: "chinese", label: "Chinese" },
  { value: "tamil", label: "Tamil" },
  { value: "other", label: "Other" },
] as const;

export const NOTE_FORMATS = [
  "Handwritten",
  "Typed",
  "Diagram/Visual",
  "Mixed Format",
] as const;

export const SHARING_OPTIONS = [
  "Public",
  "Private",
  "Friends Only",
  "Institution Only",
] as const;

export const DIFFICULTY_LEVELS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
] as const;

export const VISIBILITY_OPTIONS = [
  {
    value: "public",
    label: "Public",
    description: "Anyone can view and download",
  },
  {
    value: "friends-only",
    label: "Friends Only",
    description: "Only your study buddies can access",
  },
  { value: "private", label: "Private", description: "Only you can access" },
] as const;

export const TARGET_AUDIENCES = [
  { value: "students", label: "Students" },
  { value: "educators", label: "Educators" },
  { value: "general", label: "General Public" },
] as const;

export const LICENSE_OPTIONS = [
  { value: "cc-by", label: "Creative Commons - Attribution" },
  { value: "cc-by-sa", label: "Creative Commons - Share Alike" },
  { value: "cc-by-nc", label: "Creative Commons - Non-Commercial" },
  { value: "all-rights-reserved", label: "All Rights Reserved" },
] as const;

export const SOURCE_TYPES = [
  { value: "original", label: "Original Work" },
  { value: "textbook", label: "From Textbook" },
  { value: "lecture", label: "From Lecture" },
  { value: "research", label: "Research Paper" },
  { value: "other", label: "Other" },
] as const;
