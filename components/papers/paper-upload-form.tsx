"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, Upload, FileText, Check, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface PaperUploadFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function PaperUploadForm({ onSuccess, onCancel }: PaperUploadFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [questionFile, setQuestionFile] = useState<File | null>(null);
  const [solutionFile, setSolutionFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    subject: "",
    academicLevel: "",
    year: new Date().getFullYear(),
    institution: "",
    courseCode: "",
    courseName: "",
    professor: "",
    semester: "",
    tags: "",
    paperType: "final-exam",
    language: "english",
    difficultyLevel: "intermediate",
    visibility: "public",
    allowDownload: true,
    allowComments: true,
    sourceAttribution: "",
    sourceType: "original",
  });

  const supabase = createClient();

  const subjects = [
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "Computer Science",
    "Engineering",
    "Medicine",
    "Business",
    "Economics",
    "Psychology",
    "History",
    "English",
    "Philosophy",
    "Law",
    "Art",
    "Other",
  ];

  const academicLevels = ["undergraduate", "graduate", "phd"];

  const paperTypes = [
    "final-exam",
    "midterm",
    "assignment",
    "project",
    "thesis",
    "other",
  ];

  const languages = ["english", "bahasa-malaysia", "chinese", "tamil", "other"];

  const difficultyLevels = ["beginner", "intermediate", "advanced"];

  const handleFileUpload = async (
    file: File,
    fileType: "questions" | "solutions"
  ) => {
    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${user.id}/${fileType}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("papers")
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("papers").getPublicUrl(filePath);

      return {
        fileName: file.name,
        fileSize: file.size,
        fileUrl: publicUrl,
        filePath,
      };
    } catch (error) {
      console.error(`Error uploading ${fileType} file:`, error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate required fields
      if (!formData.title || !formData.subject || !formData.academicLevel) {
        toast.error("Please fill in all required fields");
        return;
      }

      if (!questionFile) {
        toast.error("Please upload a question file");
        return;
      }

      // Upload question file
      const questionFileData = await handleFileUpload(
        questionFile,
        "questions"
      );

      // Upload solution file if provided
      let solutionFileData = null;
      if (solutionFile) {
        solutionFileData = await handleFileUpload(solutionFile, "solutions");
      }

      // Create paper
      const paperData = {
        title: formData.title,
        description: formData.description || null,
        subject: formData.subject,
        academicLevel: formData.academicLevel,
        year: formData.year,
        institution: formData.institution || null,
        courseCode: formData.courseCode || null,
        courseName: formData.courseName || null,
        professor: formData.professor || null,
        semester: formData.semester || null,
        tags: formData.tags
          ? formData.tags.split(",").map((tag) => tag.trim())
          : [],
        paperType: formData.paperType || null,
        language: formData.language,
        difficultyLevel: formData.difficultyLevel,
        questionFileName: questionFileData.fileName,
        questionFileSize: questionFileData.fileSize,
        questionFileUrl: questionFileData.fileUrl,
        questionFilePath: questionFileData.filePath,
        solutionFileName: solutionFileData?.fileName || null,
        solutionFileSize: solutionFileData?.fileSize || null,
        solutionFileUrl: solutionFileData?.fileUrl || null,
        solutionFilePath: solutionFileData?.filePath || null,
        hasSolution: !!solutionFile,
        visibility: formData.visibility,
        allowDownload: formData.allowDownload,
        allowComments: formData.allowComments,
        sourceAttribution: formData.sourceAttribution || null,
        sourceType: formData.sourceType,
      };

      const response = await fetch("/api/papers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paperData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to upload paper");
      }

      toast.success("Paper uploaded successfully!");
      onSuccess?.();
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to upload paper"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Upload Paper</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>

            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Enter paper title"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Brief description of the paper"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="subject">Subject *</Label>
                <Select
                  value={formData.subject}
                  onValueChange={(value) =>
                    setFormData({ ...formData, subject: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem
                        key={subject}
                        value={subject.toLowerCase().replace(/\s+/g, "_")}
                      >
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="academicLevel">Academic Level *</Label>
                <Select
                  value={formData.academicLevel}
                  onValueChange={(value) =>
                    setFormData({ ...formData, academicLevel: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {academicLevels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Course Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Course Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="institution">Institution</Label>
                <Input
                  id="institution"
                  value={formData.institution}
                  onChange={(e) =>
                    setFormData({ ...formData, institution: e.target.value })
                  }
                  placeholder="University or institution name"
                />
              </div>

              <div>
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  type="number"
                  value={formData.year}
                  onChange={(e) =>
                    setFormData({ ...formData, year: parseInt(e.target.value) })
                  }
                  min="2000"
                  max="2030"
                />
              </div>

              <div>
                <Label htmlFor="courseCode">Course Code</Label>
                <Input
                  id="courseCode"
                  value={formData.courseCode}
                  onChange={(e) =>
                    setFormData({ ...formData, courseCode: e.target.value })
                  }
                  placeholder="e.g., CS101"
                />
              </div>

              <div>
                <Label htmlFor="courseName">Course Name</Label>
                <Input
                  id="courseName"
                  value={formData.courseName}
                  onChange={(e) =>
                    setFormData({ ...formData, courseName: e.target.value })
                  }
                  placeholder="e.g., Introduction to Computer Science"
                />
              </div>

              <div>
                <Label htmlFor="professor">Professor</Label>
                <Input
                  id="professor"
                  value={formData.professor}
                  onChange={(e) =>
                    setFormData({ ...formData, professor: e.target.value })
                  }
                  placeholder="Professor name"
                />
              </div>

              <div>
                <Label htmlFor="semester">Semester</Label>
                <Input
                  id="semester"
                  value={formData.semester}
                  onChange={(e) =>
                    setFormData({ ...formData, semester: e.target.value })
                  }
                  placeholder="e.g., Fall 2024"
                />
              </div>
            </div>
          </div>

          {/* File Uploads */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Files</h3>

            <div>
              <Label htmlFor="questionFile">Question Paper * (PDF)</Label>
              <div className="mt-2">
                <Input
                  id="questionFile"
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setQuestionFile(e.target.files?.[0] || null)}
                  required
                />
                {questionFile && (
                  <div className="mt-2 flex items-center text-sm text-green-600">
                    <Check className="h-4 w-4 mr-1" />
                    {questionFile.name}
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="solutionFile">
                Solution Paper (PDF, Optional)
              </Label>
              <div className="mt-2">
                <Input
                  id="solutionFile"
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setSolutionFile(e.target.files?.[0] || null)}
                />
                {solutionFile && (
                  <div className="mt-2 flex items-center text-sm text-green-600">
                    <Check className="h-4 w-4 mr-1" />
                    {solutionFile.name}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Additional Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Additional Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="paperType">Paper Type *</Label>
                <Select
                  value={formData.paperType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, paperType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {paperTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="difficultyLevel">Difficulty Level</Label>
                <Select
                  value={formData.difficultyLevel}
                  onValueChange={(value) =>
                    setFormData({ ...formData, difficultyLevel: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    {difficultyLevels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="language">Language</Label>
              <Select
                value={formData.language}
                onValueChange={(value) =>
                  setFormData({ ...formData, language: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang} value={lang}>
                      {lang.charAt(0).toUpperCase() + lang.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) =>
                  setFormData({ ...formData, tags: e.target.value })
                }
                placeholder="e.g., calculus, derivatives, integration"
              />
            </div>

            {/* Permissions */}
            <div className="space-y-3">
              <h4 className="font-medium">Permissions</h4>

              <div className="flex items-center space-x-2">
                <Switch
                  id="allowDownload"
                  checked={formData.allowDownload}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, allowDownload: checked })
                  }
                />
                <Label htmlFor="allowDownload">Allow downloads</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="allowComments"
                  checked={formData.allowComments}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, allowComments: checked })
                  }
                />
                <Label htmlFor="allowComments">Allow comments</Label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Paper
                </>
              )}
            </Button>

            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
