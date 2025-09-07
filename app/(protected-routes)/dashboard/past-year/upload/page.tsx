import React from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PaperUploadForm } from "@/components/papers/paper-upload-form";
import {
  Upload,
  FileText,
  BookOpen,
  Users,
  ArrowLeft,
  Eye,
} from "lucide-react";

const PaperUploadPage = () => {
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            Upload Past Year Papers
          </h1>
          <p className="text-muted-foreground">
            Share your past year papers with the community to help fellow
            students prepare for exams
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          asChild
        >
          <Link href="/dashboard/past-year/browse">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Browse
          </Link>
        </Button>
      </div>

      {/* Upload Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Upload Guidelines
          </CardTitle>
          <CardDescription>
            Please follow these guidelines to ensure your uploads are helpful
            and organized
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-medium">File Requirements</h4>
                  <p className="text-sm text-muted-foreground">
                    Upload clear, readable PDF files only. Maximum file size:
                    10MB
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Upload className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-medium">Naming Convention</h4>
                  <p className="text-sm text-muted-foreground">
                    Use descriptive titles including subject, year, and exam
                    type
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-medium">Community Benefit</h4>
                  <p className="text-sm text-muted-foreground">
                    Your contributions help thousands of students succeed
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <BookOpen className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-medium">Academic Integrity</h4>
                  <p className="text-sm text-muted-foreground">
                    Only upload papers you have permission to share
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Form */}
      <Card className=" max-w-4xl mx-auto p-0 bg-transparent border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            Upload Your Paper
          </CardTitle>
          <CardDescription>
            Fill in the details below to upload your past year paper
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PaperUploadForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default PaperUploadPage;
