"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Save, FileText, Settings, Users, Tag } from "lucide-react";
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
import {
  ACADEMIC_LEVELS,
  LANGUAGES,
  SOURCE_TYPES,
  NoteFormData,
  VISIBILITY_OPTIONS, // Use VISIBILITY_OPTIONS instead of SHARING_OPTIONS
} from "@/types/notes";
import {
  noteFormSchema,
  type NoteFormInput,
} from "@/lib/validations/note-form";
import { useRouter } from "next/navigation";
// Define subjects with proper structure for the component
const SUBJECTS_OPTIONS = [
  { value: "Mathematics", label: "Mathematics" },
  { value: "Physics", label: "Physics" },
  { value: "Chemistry", label: "Chemistry" },
  { value: "Biology", label: "Biology" },
  { value: "Computer Science", label: "Computer Science" },
  { value: "Engineering", label: "Engineering" },
  { value: "Economics", label: "Economics" },
  { value: "Accounting", label: "Accounting" },
  { value: "Business Studies", label: "Business Studies" },
  { value: "History", label: "History" },
  { value: "Geography", label: "Geography" },
  { value: "Literature", label: "Literature" },
  { value: "Language Studies", label: "Language Studies" },
  { value: "Art & Design", label: "Art & Design" },
  { value: "Music", label: "Music" },
  { value: "Other", label: "Other" },
] as const;

interface NoteData {
  id: string;
  title: string;
  description: string;
  content?: string;
  content_type: "pdf" | "text";
  subject: string;
  topic: string;
  academic_level: string;
  institution: string;
  course: string;
  professor: string;
  semester: string;
  note_type: string;
  tags: string[];
  language: string;
  difficulty_level: string;
  visibility: string;
  target_audience: string;
  license: string;
  allow_download: boolean;
  allow_comments: boolean;
  source_type: string;
  source_reference: string;
  estimated_read_time: number;
  file_name?: string;
  file_url?: string;
  thumbnail_url?: string;
}

interface EditableNoteFormProps {
  note: NoteData;
  onSave: (data: NoteFormData) => Promise<void>;
  onDataChange: (hasChanges: boolean) => void;
  saving: boolean;
}

const DIFFICULTY_LEVELS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

const EditableNoteForm: React.FC<EditableNoteFormProps> = ({
  note,
  onSave,
  onDataChange,
  saving,
}) => {
  const [newTag, setNewTag] = useState("");
  const { push } = useRouter();
  const form = useForm<NoteFormInput>({
    resolver: zodResolver(noteFormSchema),
    defaultValues: {
      title: note.title || "",
      description: note.description || "",
      subject: note.subject || "",
      topic: note.topic || "",
      academicLevel: note.academic_level || "",
      institution: note.institution || "",
      course: note.course || "",
      professor: note.professor || "",
      semester: note.semester || "",
      noteType: note.note_type || "",
      tags: note.tags || [],
      language: note.language || "",
      format: note.content_type || "",
      difficulty: note.difficulty_level || "",
      sourceType: note.source_type || "",
      sourceReference: note.source_reference || "",
      sharingOption: note.visibility || "",
      allowDownload: note.allow_download ?? true,
      allowComments: note.allow_comments ?? true,
      estimatedReadTime: note.estimated_read_time || 0,
      textContent: note.content || "",
    },
  });

  // Watch for form changes
  const watchedValues = form.watch();
  useEffect(() => {
    const hasChanges = form.formState.isDirty;
    onDataChange(hasChanges);
  }, [watchedValues, form.formState.isDirty, onDataChange]);

  const handleSubmit = async (data: NoteFormInput) => {
    try {
      console.log("Form submission started with data:", data);

      const formData: NoteFormData = {
        title: data.title,
        description: data.description || "",
        subject: data.subject,
        topic: data.topic || "",
        academicLevel: data.academicLevel,
        institution: data.institution || "",
        course: data.course || "",
        professor: data.professor || "",
        semester: data.semester || "",
        noteType: note.note_type, // Use original note type (can't be changed)
        tags: data.tags,
        language: data.language,
        format: note.content_type, // Use original format (can't be changed)
        difficulty: data.difficulty || "",
        sourceType: data.sourceType,
        sourceReference: data.sourceReference || "",
        sharingOption: data.sharingOption,
        allowDownload: data.allowDownload ?? true,
        allowComments: data.allowComments ?? true,
        estimatedReadTime: Number(data.estimatedReadTime) || 0,
        textContent: data.textContent || "",
      };

      console.log("Calling onSave with:", formData);
      await onSave(formData);
      console.log("onSave completed successfully");
    } catch (error) {
      console.error("Error in handleSubmit:", error);
    } finally {
      push(`/dashboard/notes/${note.id}`);
    }
  };

  const addTag = () => {
    const tag = newTag.trim();
    if (tag && !form.getValues("tags").includes(tag)) {
      const currentTags = form.getValues("tags");
      form.setValue("tags", [...currentTags, tag], { shouldDirty: true });
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    const currentTags = form.getValues("tags");
    form.setValue(
      "tags",
      currentTags.filter((tag) => tag !== tagToRemove),
      { shouldDirty: true }
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => {
          console.log("Form submit event triggered");
          console.log("Form errors:", form.formState.errors);
          form.handleSubmit(handleSubmit, (errors) => {
            console.log("Form validation failed:", errors);
          })(e);
        }}
        className="space-y-6"
      >
        {/* Hidden fields for non-editable values */}
        <FormField
          control={form.control}
          name="noteType"
          render={({ field }) => <input type="hidden" {...field} />}
        />
        <FormField
          control={form.control}
          name="format"
          render={({ field }) => <input type="hidden" {...field} />}
        />

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter note title..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief description of your note..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Show content editor only for text notes */}
            {note.content_type === "text" && (
              <FormField
                control={form.control}
                name="textContent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Your note content..."
                        className="resize-none min-h-[200px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Edit your text content here. Rich text formatting is not
                      available in edit mode.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </CardContent>
        </Card>

        {/* Academic Context */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Academic Context
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SUBJECTS_OPTIONS.map((subject) => (
                          <SelectItem key={subject.value} value={subject.value}>
                            {subject.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="academicLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Academic Level *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ACADEMIC_LEVELS.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Topic</FormLabel>
                    <FormControl>
                      <Input placeholder="Specific topic..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="difficulty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Difficulty Level</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {DIFFICULTY_LEVELS.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="institution"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Institution</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="University/School name..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="course"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course</FormLabel>
                    <FormControl>
                      <Input placeholder="Course code/name..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="professor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Professor/Instructor</FormLabel>
                    <FormControl>
                      <Input placeholder="Professor name..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="semester"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Semester/Term</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Fall 2024..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Language</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {LANGUAGES.map((language) => (
                        <SelectItem key={language.value} value={language.value}>
                          {language.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Tags */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Tags
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Add a tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button type="button" onClick={addTag} variant="outline">
                Add
              </Button>
            </div>

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <div className="flex flex-wrap gap-2">
                    {field.value.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="cursor-pointer hover:bg-red-100"
                        onClick={() => removeTag(tag)}
                      >
                        {tag} ×
                      </Badge>
                    ))}
                    {field.value.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        No tags added yet
                      </p>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Sharing & Permissions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Sharing & Permissions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="sharingOption"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Visibility</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select visibility" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {VISIBILITY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="allowDownload"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Allow Downloads
                      </FormLabel>
                      <FormDescription>
                        Let others download your note
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="allowComments"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Allow Comments
                      </FormLabel>
                      <FormDescription>
                        Let others comment on your note
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Source & Attribution */}
        <Card>
          <CardHeader>
            <CardTitle>Source & Attribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sourceType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Source Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select source type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SOURCE_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="estimatedReadTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Read Time (minutes)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        value={field.value?.toString() || ""}
                        onChange={(e) =>
                          field.onChange(Number(e.target.value) || 0)
                        }
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="sourceReference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Source Reference</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Textbook, paper, or other reference..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Separator />

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button
            type="submit"
            disabled={saving || !form.formState.isDirty}
            className="min-w-[120px]"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default EditableNoteForm;
