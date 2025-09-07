"use client";

import React, { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageIcon, X, Camera, FileImage, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface ThumbnailUploadProps {
  onImageSelect: (file: File | null) => void;
  selectedImage?: File | null;
  className?: string;
  disabled?: boolean;
}

export function ThumbnailUpload({
  onImageSelect,
  selectedImage,
  className,
  disabled = false,
}: ThumbnailUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Create image preview when file is selected
  React.useEffect(() => {
    if (selectedImage) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(selectedImage);
    } else {
      setImagePreview(null);
    }
  }, [selectedImage]);

  const validateFile = (file: File): boolean => {
    setError(null);

    // Check file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setError("Please select a valid image file (JPEG, PNG, or WebP)");
      return false;
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError("Image size must be less than 5MB");
      return false;
    }

    return true;
  };

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const file = files[0];
      if (validateFile(file)) {
        onImageSelect(file);
      }
    },
    [onImageSelect]
  );

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (disabled) return;

      const files = e.dataTransfer.files;
      handleFiles(files);
    },
    [handleFiles, disabled]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    handleFiles(files);
  };

  const removeImage = () => {
    onImageSelect(null);
    setImagePreview(null);
    setError(null);
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Thumbnail Image{" "}
          <span className="text-muted-foreground">(Optional)</span>
        </label>
        <p className="text-xs text-muted-foreground">
          Upload an image to display as a thumbnail for your notes. Recommended
          size: 400x300px
        </p>
      </div>

      {imagePreview ? (
        // Image Preview
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="relative">
              <div className="aspect-video w-full overflow-hidden bg-background">
                <Image
                  src={imagePreview}
                  alt="Thumbnail preview"
                  width={400}
                  height={300}
                  className="w-full h-full object-cover aspect-video"
                />
              </div>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8"
                onClick={removeImage}
                disabled={disabled}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-3">
              <p className="text-sm font-medium">{selectedImage?.name}</p>
              <p className="text-xs text-muted-foreground">
                {selectedImage && (selectedImage.size / 1024).toFixed(1)} KB
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        // Upload Area
        <Card
          className={cn(
            "border-2 border-dashed transition-colors",
            dragActive && "border-primary bg-primary/5",
            disabled && "opacity-50 cursor-not-allowed",
            !disabled && "hover:border-primary/50 cursor-pointer"
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-background mb-4">
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
            </div>

            <h3 className="text-lg font-medium mb-2">Upload Thumbnail</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Drag and drop an image file here, or click to browse
            </p>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={disabled}
                asChild
              >
                <label className="cursor-pointer">
                  <Camera className="h-4 w-4 mr-2" />
                  Choose Image
                  <Input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleInputChange}
                    disabled={disabled}
                  />
                </label>
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={disabled}
                asChild
              >
                <label className="cursor-pointer">
                  <FileImage className="h-4 w-4 mr-2" />
                  Browse Files
                  <Input
                    type="file"
                    className="hidden"
                    accept=".jpg,.jpeg,.png,.webp"
                    onChange={handleInputChange}
                    disabled={disabled}
                  />
                </label>
              </Button>
            </div>

            <div className="mt-4 text-xs text-muted-foreground">
              <p>Supported formats: JPEG, PNG, WebP</p>
              <p>Maximum size: 5MB</p>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}
    </div>
  );
}

export default ThumbnailUpload;
