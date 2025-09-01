"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { FileUpload } from "@/components/notes/file-upload";
import { RichTextEditor } from "@/components/notes/rich-text-editor";
import { NoteAttributesForm } from "@/components/notes/note-attributes-form";
import { ThumbnailUpload } from "@/components/notes/thumbnail-upload";
import { NoteFormData } from "@/types/notes";
import { notesService } from "@/lib/services/notes";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Upload, FileText, CheckCircle, AlertCircle, Save } from "lucide-react";

export default function UploadNotesPage() {
  const [activeTab, setActiveTab] = useState<"pdf" | "text">("pdf");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const { push } = useRouter();

  // Form data state
  const [formData, setFormData] = useState<NoteFormData>({
    title: "",
    description: "",
    subject: "",
    topic: "",
    academicLevel: "",
    institution: "",
    course: "",
    professor: "",
    semester: "",
    noteType: "",
    tags: [],
    language: "",
    format: "",
    difficulty: "",
    sourceType: "",
    sourceReference: "",
    sharingOption: "",
    allowDownload: true,
    allowComments: true,
    estimatedReadTime: 0,
    textContent: "",
  });

  // Handle form field changes
  const handleFormChange = (field: keyof NoteFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle file selection and auto-populate title
  React.useEffect(() => {
    if (uploadedFile && !formData.title) {
      const fileName = uploadedFile.name.replace(/\.[^/.]+$/, ""); // Remove extension
      handleFormChange("title", fileName);
    }
  }, [uploadedFile, formData.title]);

  // Validate form
  const validateForm = (): boolean => {
    const requiredFields = ["title", "subject", "academicLevel"];

    for (const field of requiredFields) {
      if (!formData[field as keyof NoteFormData]) {
        return false;
      }
    }

    // Check if we have either a file or text content
    if (activeTab === "pdf" && !uploadedFile) {
      return false;
    }

    if (activeTab === "text" && !formData.textContent.trim()) {
      return false;
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      setSubmitStatus("error");
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const result = await notesService.uploadNote(
        formData,
        uploadedFile,
        activeTab,
        thumbnailFile
      );

      if (result.success) {
        toast.success("Your notes have been uploaded successfully!");
        push("/dashboard/notes/browse");
      } else {
        toast.error("Upload failed");
        throw new Error(result.error || "Upload failed");
      }
    } catch (error) {
      toast.error("Upload failed");
      console.error("Error submitting note:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid = validateForm();

  return (
    <div className="container mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Upload Notes</h1>
        <p className="text-muted-foreground">
          Share your knowledge with the community by uploading your study notes
          or creating new content.
        </p>
      </div>

      {/* Status Alerts */}
      {submitStatus === "success" && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Your notes have been uploaded successfully! They will be reviewed
            and published shortly.
          </AlertDescription>
        </Alert>
      )}

      {submitStatus === "error" && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Please fill in all required fields and ensure you have content to
            upload.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upload Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Choose Upload Type</CardTitle>
              <CardDescription>
                Select whether you want to upload a PDF file or create
                text-based notes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs
                value={activeTab}
                onValueChange={(value) => setActiveTab(value as "pdf" | "text")}
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="pdf" className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Upload PDF
                  </TabsTrigger>
                  <TabsTrigger value="text" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Create Text Notes
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="pdf" className="mt-6">
                  <FileUpload
                    onFileSelect={setUploadedFile}
                    selectedFile={uploadedFile}
                  />
                </TabsContent>

                <TabsContent value="text" className="mt-6">
                  <RichTextEditor
                    content={formData.textContent}
                    onChange={(content) =>
                      handleFormChange("textContent", content)
                    }
                    placeholder="Start writing your notes here..."
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Thumbnail Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Add Thumbnail</CardTitle>
              <CardDescription>
                Upload an image to make your notes more attractive and easier to
                identify in search results.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ThumbnailUpload
                onImageSelect={setThumbnailFile}
                selectedImage={thumbnailFile}
                disabled={isSubmitting}
              />
            </CardContent>
          </Card>

          {/* Note Attributes Form */}
          <NoteAttributesForm formData={formData} onChange={handleFormChange} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6 sticky top-20 h-fit">
          {/* Upload Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upload Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Type:</span>
                  <Badge variant="secondary">
                    {activeTab === "pdf" ? "PDF Upload" : "Text Notes"}
                  </Badge>
                </div>

                {uploadedFile && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">File:</span>
                    <span
                      className="font-medium truncate max-w-32"
                      title={uploadedFile.name}
                    >
                      {uploadedFile.name}
                    </span>
                  </div>
                )}

                {thumbnailFile && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Thumbnail:</span>
                    <span
                      className="font-medium truncate max-w-32"
                      title={thumbnailFile.name}
                    >
                      {thumbnailFile.name}
                    </span>
                  </div>
                )}

                {formData.title && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Title:</span>
                    <span
                      className="font-medium truncate max-w-32"
                      title={formData.title}
                    >
                      {formData.title}
                    </span>
                  </div>
                )}

                {formData.subject && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subject:</span>
                    <span className="font-medium">{formData.subject}</span>
                  </div>
                )}

                {formData.tags.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-sm text-muted-foreground">Tags:</span>
                    <div className="flex flex-wrap gap-1">
                      {formData.tags.slice(0, 3).map((tag: string) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {formData.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{formData.tags.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t">
                <Button
                  onClick={handleSubmit}
                  disabled={!isValid || isSubmitting}
                  className="w-full"
                  size="lg"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Upload Notes
                    </>
                  )}
                </Button>

                {!isValid && (
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Please fill in required fields to continue
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Upload Guidelines */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upload Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="space-y-1">
                <h4 className="font-medium">File Requirements:</h4>
                <ul className="text-muted-foreground space-y-1 ml-4">
                  <li>• PDF files only, max 10MB</li>
                  <li>• Clear, readable content</li>
                  <li>• Original or properly attributed</li>
                </ul>
              </div>

              <div className="space-y-1">
                <h4 className="font-medium">Content Guidelines:</h4>
                <ul className="text-muted-foreground space-y-1 ml-4">
                  <li>• Use descriptive titles</li>
                  <li>• Add relevant tags</li>
                  <li>• Provide proper attribution</li>
                  <li>• Choose appropriate sharing settings</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
