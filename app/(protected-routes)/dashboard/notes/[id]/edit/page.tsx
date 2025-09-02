"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, File } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { notesService } from "@/lib/services/notes";
import EditableNoteForm from "@/components/notes/editable-note-form";
import { NoteFormData } from "@/types/notes";
import { toast } from "sonner";

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
  user_id: string;
  created_at: string;
  updated_at: string;
}

const EditNotePage = () => {
  const params = useParams();
  const router = useRouter();
  const noteId = params.id as string;

  const [note, setNote] = useState<NoteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Load note data
  useEffect(() => {
    const loadNote = async () => {
      try {
        setLoading(true);
        const response = await notesService.getNoteById(noteId);
        
        if (response.note) {
          setNote(response.note);
        } else {
          setError("Note not found or you don't have permission to edit it");
        }
      } catch (err) {
        console.error("Error loading note:", err);
        setError("Failed to load note");
      } finally {
        setLoading(false);
      }
    };

    if (noteId) {
      loadNote();
    }
  }, [noteId]);

  // Handle form submission
  const handleSave = async (formData: NoteFormData) => {
    if (!note) return;

    try {
      setSaving(true);
      
      // Prepare update data with restrictions
      const updateData = {
        title: formData.title,
        description: formData.description,
        subject: formData.subject,
        topic: formData.topic,
        academic_level: formData.academicLevel,
        institution: formData.institution,
        course: formData.course,
        professor: formData.professor,
        semester: formData.semester,
        tags: formData.tags,
        language: formData.language,
        difficulty_level: formData.difficulty,
        visibility: formData.sharingOption,
        allow_download: formData.allowDownload,
        allow_comments: formData.allowComments,
        source_reference: formData.sourceReference,
        estimated_read_time: formData.estimatedReadTime,
        // Only include content for text notes
        ...(note.content_type === "text" && { content: formData.textContent }),
      };

      const result = await notesService.updateNote(noteId, updateData);
      
      if (result.note) {
        setNote(result.note);
        setHasUnsavedChanges(false);
        toast.success("Note updated successfully!");
      }
    } catch (err) {
      console.error("Error updating note:", err);
      toast.error("Failed to update note. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Handle back navigation with unsaved changes warning
  const handleBack = () => {
    if (hasUnsavedChanges) {
      if (confirm("You have unsaved changes. Are you sure you want to leave?")) {
        router.back();
      }
    } else {
      router.back();
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
            <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="h-96 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
          <Alert>
            <AlertDescription>
              {error || "Note not found"}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Edit Note</h1>
              <p className="text-muted-foreground">
                Update your note details and settings
              </p>
            </div>
          </div>

          {hasUnsavedChanges && (
            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
              Unsaved Changes
            </Badge>
          )}
        </div>

        {/* Restrictions Notice */}
        <Alert>
          <AlertDescription className="space-y-2">
            <p className="font-medium">Edit Restrictions:</p>
            <ul className="text-sm space-y-1 ml-4">
              <li>• You cannot change the note type ({note.content_type === "pdf" ? "PDF" : "Text Editor"})</li>
              {note.content_type === "pdf" && (
                <li>• You cannot replace or modify the uploaded PDF file</li>
              )}
              <li>• File uploads and content type remain unchanged</li>
            </ul>
          </AlertDescription>
        </Alert>

        {/* Note Type Indicator */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              {note.content_type === "pdf" ? (
                <File className="h-5 w-5 text-red-500" />
              ) : (
                <FileText className="h-5 w-5 text-blue-500" />
              )}
              Note Type: {note.content_type === "pdf" ? "PDF Document" : "Text Editor"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  Original file: {note.file_name || "Text content"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Created: {new Date(note.created_at).toLocaleDateString()}
                </p>
              </div>
              <Badge variant={note.content_type === "pdf" ? "destructive" : "default"}>
                {note.content_type.toUpperCase()}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Editable Form */}
        <EditableNoteForm
          note={note}
          onSave={handleSave}
          onDataChange={setHasUnsavedChanges}
          saving={saving}
        />
      </div>
    </div>
  );
};

export default EditNotePage;