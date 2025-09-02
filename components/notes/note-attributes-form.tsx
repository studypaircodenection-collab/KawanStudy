"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
  NOTE_TYPES,
  SUBJECTS,
  LANGUAGES,
  NOTE_FORMATS,
  SHARING_OPTIONS,
  SOURCE_TYPES,
  NoteFormData,
} from "@/types/notes";
import {
  noteFormSchema,
  type NoteFormInput,
} from "@/lib/validations/note-form";
import { X, Plus } from "lucide-react";

interface NoteAttributesFormProps {
  formData: NoteFormData;
  onChange: (field: keyof NoteFormData, value: any) => void;
  className?: string;
}

export function NoteAttributesForm({
  formData,
  onChange,
  className,
}: NoteAttributesFormProps) {
  const [newTag, setNewTag] = React.useState("");

  const form = useForm<NoteFormInput>({
    resolver: zodResolver(noteFormSchema),
    values: {
      title: formData.title || "",
      description: formData.description || "",
      subject: formData.subject || "",
      topic: formData.topic || "",
      academicLevel: formData.academicLevel || "",
      institution: formData.institution || "",
      course: formData.course || "",
      professor: formData.professor || "",
      semester: formData.semester || "",
      noteType: formData.noteType || "",
      tags: formData.tags || [],
      language: formData.language || "",
      format: formData.format || "",
      difficulty: formData.difficulty || "",
      sourceType: formData.sourceType || "",
      sourceReference: formData.sourceReference || "",
      sharingOption: formData.sharingOption || "",
      allowDownload: formData.allowDownload ?? true,
      allowComments: formData.allowComments ?? true,
      estimatedReadTime: formData.estimatedReadTime || 0,
      textContent: formData.textContent || "",
    },
  });

  const { watch, setValue } = form;
  const watchedTags = watch("tags") || [];

  // Sync form values with external formData
  React.useEffect(() => {
    const subscription = watch((value) => {
      Object.keys(value).forEach((key) => {
        const typedKey = key as keyof NoteFormData;
        if (
          value[typedKey] !== undefined &&
          value[typedKey] !== formData[typedKey]
        ) {
          onChange(typedKey, value[typedKey]);
        }
      });
    });
    return () => subscription.unsubscribe();
  }, [watch, onChange, formData]);

  const addTag = () => {
    if (
      newTag.trim() &&
      !watchedTags.includes(newTag.trim()) &&
      watchedTags.length < 10
    ) {
      const newTags = [...watchedTags, newTag.trim()];
      setValue("tags", newTags, { shouldValidate: true });
      onChange("tags", newTags);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = watchedTags.filter((tag: string) => tag !== tagToRemove);
    setValue("tags", newTags, { shouldValidate: true });
    onChange("tags", newTags);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div className={className}>
      <Form {...form}>
        <div className="space-y-6">
          <div className="grid gap-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter a descriptive title for your notes"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            onChange("title", e.target.value);
                          }}
                        />
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
                          placeholder="Brief description of the content"
                          rows={3}
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            onChange("description", e.target.value);
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Optional description to help others understand your
                        notes
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject *</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            onChange("subject", value);
                          }}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select subject" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {SUBJECTS.map((subject) => (
                              <SelectItem key={subject} value={subject}>
                                {subject}
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
                    name="topic"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Topic/Chapter</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Specific topic or chapter"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              onChange("topic", e.target.value);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Academic Context */}
            <Card>
              <CardHeader>
                <CardTitle>Academic Context</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="academicLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Academic Level *</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            onChange("academicLevel", value);
                          }}
                          value={field.value}
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

                  <FormField
                    control={form.control}
                    name="noteType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Note Type *</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            onChange("noteType", value);
                          }}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {NOTE_TYPES.map((type) => (
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
                            placeholder="Your school/university"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              onChange("institution", e.target.value);
                            }}
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
                        <FormLabel>Course/Class</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Course code or class name"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              onChange("course", e.target.value);
                            }}
                          />
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
                        <FormLabel>Professor/Teacher</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Instructor name"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              onChange("professor", e.target.value);
                            }}
                          />
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
                        <FormLabel>Semester/Year</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Fall 2024"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              onChange("semester", e.target.value);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Classification & Tags */}
            <Card>
              <CardHeader>
                <CardTitle>Classification & Tags</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="tags"
                  render={() => (
                    <FormItem>
                      <FormLabel>Tags</FormLabel>
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-2">
                          {watchedTags.map((tag: string) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="flex items-center gap-1"
                            >
                              {tag}
                              <button
                                type="button"
                                onClick={() => removeTag(tag)}
                                className="hover:bg-red-100 rounded-full p-0.5"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Input
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Add a tag"
                            className="flex-1"
                            disabled={watchedTags.length >= 10}
                          />
                          <Button
                            type="button"
                            onClick={addTag}
                            size="sm"
                            disabled={
                              watchedTags.length >= 10 || !newTag.trim()
                            }
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <FormDescription>
                        Add up to 10 tags to help categorize your notes
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="language"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Language *</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            onChange("language", value);
                          }}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {LANGUAGES.map((language) => (
                              <SelectItem
                                key={language.value}
                                value={language.value}
                              >
                                {language.label}
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
                    name="format"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Format *</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            onChange("format", value);
                          }}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select format" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {NOTE_FORMATS.map((format: string) => (
                              <SelectItem key={format} value={format}>
                                {format}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="difficulty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Difficulty Level</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          onChange("difficulty", value);
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select difficulty" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Beginner">Beginner</SelectItem>
                          <SelectItem value="Intermediate">
                            Intermediate
                          </SelectItem>
                          <SelectItem value="Advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Source & Attribution */}
            <Card>
              <CardHeader>
                <CardTitle>Source & Attribution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="sourceType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Source Type *</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          onChange("sourceType", value);
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select source type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SOURCE_TYPES.map((source) => (
                            <SelectItem key={source.value} value={source.value}>
                              {source.label}
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
                  name="sourceReference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Source Reference</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Book title, author, page numbers, DOI, etc."
                          rows={2}
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            onChange("sourceReference", e.target.value);
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Provide proper attribution for your sources
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Sharing & Permissions */}
            <Card>
              <CardHeader>
                <CardTitle>Sharing & Permissions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="sharingOption"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sharing Option *</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          onChange("sharingOption", value);
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select sharing option" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SHARING_OPTIONS.map((option: string) => (
                            <SelectItem key={option} value={option}>
                              {option}
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
                  name="allowDownload"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Allow Downloads
                        </FormLabel>
                        <FormDescription>
                          Let others download your notes
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={(value) => {
                            field.onChange(value);
                            onChange("allowDownload", value);
                          }}
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
                          Let others comment on your notes
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={(value) => {
                            field.onChange(value);
                            onChange("allowComments", value);
                          }}
                        />
                      </FormControl>
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
                          min="0"
                          max="1440"
                          value={String(field.value || 0)}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 0;
                            field.onChange(value);
                            onChange("estimatedReadTime", value);
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        How long it takes to read through these notes
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </Form>
    </div>
  );
}

export default NoteAttributesForm;
