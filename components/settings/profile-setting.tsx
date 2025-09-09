"use client";

import React, { useRef, useState, type ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Camera,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Trash2,
  RefreshCw,
  Linkedin,
  Github,
  Instagram,
  Globe,
  ImageIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectItem,
  SelectContent,
} from "../ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAuth } from "@/lib/context/auth-provider";
import type { Claims } from "@/lib/context/auth-provider";
import { toast } from "sonner";
import { profileSchema, ProfileFormData } from "@/lib/validations/profile";
import { Text } from "@/components/ui/typography";
import {
  ImageCrop,
  ImageCropApply,
  ImageCropContent,
  ImageCropReset,
} from "@/components/ui/shadcn-io/image-crop";

const ProfileSetting = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const headerImageInputRef = useRef<HTMLInputElement>(null);
  const { claims, setClaims } = useAuth();
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingHeaderImage, setUploadingHeaderImage] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setCroppedImage(null);
    }
  };

  const handleResetImage = () => {
    setSelectedFile(null);
    setCroppedImage(null);
  };

  // NOTE: we no longer early-return when no file is selected; the file input is
  // triggered via the "Change Photo" button and the cropper is shown when a
  // file is chosen.

  // Initialize form with default values from auth claims
  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: claims?.full_name || "",
      username: claims?.username || "",
      email: claims?.email || "",
      phone: claims?.phone || "",
      bio: claims?.bio || "",
      location: claims?.location || "",
      university: claims?.academic?.university || "",
      yearOfStudy:
        (claims?.academic?.year_of_study as ProfileFormData["yearOfStudy"]) ||
        "",
      major: claims?.academic?.major || "",
      avatar: claims?.avatar_url || "",
      headerImage: claims?.header_image_url || "",
      linkedinUrl:
        (claims?.linkedin_url !== "N/A" ? claims?.linkedin_url : "") || "",
      githubUrl: (claims?.github_url !== "N/A" ? claims?.github_url : "") || "",
      instagramUrl:
        (claims?.instagram_url !== "N/A" ? claims?.instagram_url : "") || "",
      tiktokUrl: (claims?.tiktok_url !== "N/A" ? claims?.tiktok_url : "") || "",
      websiteUrl:
        (claims?.website_url !== "N/A" ? claims?.website_url : "") || "",
    },
  });

  const { watch, formState, reset } = form;
  const { isSubmitting, isDirty } = formState;
  const watchedValues = watch();

  const onSubmit = async (data: ProfileFormData) => {
    try {
      // Transform form data to API format
      const apiPayload = {
        full_name: data.fullName,
        username: data.username,
        email: data.email,
        phone: data.phone || "",
        bio: data.bio || "",
        location: data.location || "",
        university: data.university || "",
        year_of_study: data.yearOfStudy || "",
        major: data.major || "",
        avatar_url: data.avatar || "/api/placeholder/100/100",
        header_image_url: data.headerImage || "",
        linkedin_url: data.linkedinUrl || "",
        github_url: data.githubUrl || "",
        instagram_url: data.instagramUrl || "",
        tiktok_url: data.tiktokUrl || "",
        website_url: data.websiteUrl || "",
      };

      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update profile");
      }

      // Update the auth context with new user data
      const updatedClaims: Claims = {
        sub: claims?.sub || "",
        email: data.email,
        full_name: data.fullName,
        username: data.username,
        phone: data.phone,
        bio: data.bio,
        location: data.location,
        avatar_url: data.avatar,
        header_image_url: data.headerImage,
        linkedin_url: data.linkedinUrl,
        github_url: data.githubUrl,
        instagram_url: data.instagramUrl,
        tiktok_url: data.tiktokUrl,
        website_url: data.websiteUrl,
        academic: {
          university: data.university,
          major: data.major,
          year_of_study: data.yearOfStudy,
        },
        role: claims?.role || "user",
        created_at: claims?.created_at,
        updated_at: new Date().toISOString(),
      };

      setClaims(updatedClaims);
      reset(data); // Reset form state to mark as "saved"

      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update profile. Please try again."
      );
    }
  };

  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setUploadingAvatar(true);

    try {
      // Create a FileReader to read the file
      const reader = new FileReader();

      const imageDataUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = (e) => {
          const result = e.target?.result as string;
          resolve(result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Simulate upload to server
      await new Promise((resolve) => setTimeout(resolve, 2000));

      form.setValue("avatar", imageDataUrl, { shouldDirty: true });
      toast.success("Profile picture updated successfully!");
    } catch (error) {
      console.error("Failed to upload avatar:", error);
      toast.error("Failed to upload image. Please try again.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleRemoveAvatar = async () => {
    setUploadingAvatar(true);

    try {
      // Simulate API call to remove avatar
      await new Promise((resolve) => setTimeout(resolve, 1000));

      form.setValue("avatar", "/api/placeholder/100/100", {
        shouldDirty: true,
      });
      toast.success("Profile picture removed successfully!");
    } catch (error) {
      console.error("Failed to remove avatar:", error);
      toast.error("Failed to remove profile picture. Please try again.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleHeaderImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setUploadingHeaderImage(true);

    try {
      // Create a FileReader to read the file
      const reader = new FileReader();

      const imageDataUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = (e) => {
          const result = e.target?.result as string;
          resolve(result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Simulate upload to server
      await new Promise((resolve) => setTimeout(resolve, 2000));

      form.setValue("headerImage", imageDataUrl, { shouldDirty: true });
      toast.success("Header image updated successfully!");
    } catch (error) {
      console.error("Failed to upload header image:", error);
      toast.error("Failed to upload image. Please try again.");
    } finally {
      setUploadingHeaderImage(false);
    }
  };

  const handleRemoveHeaderImage = async () => {
    setUploadingHeaderImage(true);

    try {
      // Simulate API call to remove header image
      await new Promise((resolve) => setTimeout(resolve, 1000));

      form.setValue("headerImage", "", {
        shouldDirty: true,
      });
      toast.success("Header image removed successfully!");
    } catch (error) {
      console.error("Failed to remove header image:", error);
      toast.error("Failed to remove header image. Please try again.");
    } finally {
      setUploadingHeaderImage(false);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const triggerHeaderImageUpload = () => {
    headerImageInputRef.current?.click();
  };

  const resetForm = () => {
    reset();
    toast.info("Changes have been reset");
  };

  // Calculate profile completion percentage
  const profileValues = Object.values(watchedValues);
  const completedFields = profileValues.filter(
    (value) => value && value.toString().trim() !== ""
  ).length;
  const completionPercentage = Math.round(
    (completedFields / profileValues.length) * 100
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Update your personal information and profile details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Section */}
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="relative">
                <Avatar className="h-20 w-20 border">
                  <AvatarImage
                    src={watchedValues.avatar}
                    alt={watchedValues.fullName}
                  />
                  <AvatarFallback className="text-lg">
                    {watchedValues.fullName
                      .split(" ")
                      .map((n: string) => n.charAt(0))
                      .join("")
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                {uploadingAvatar && (
                  <div className="absolute inset-0 bg-background bg-opacity-50 rounded-full flex items-center justify-center">
                    <RefreshCw className="h-6 w-6 text-foreground animate-spin" />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Text as="h3">Profile Picture</Text>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={triggerFileUpload}
                    disabled={uploadingAvatar}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Change Photo
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleRemoveAvatar}
                    disabled={
                      uploadingAvatar ||
                      watchedValues.avatar === "/api/placeholder/100/100"
                    }
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                </div>
                <Text as="p" styleVariant="muted">
                  JPG, PNG, GIF up to 5MB
                </Text>
              </div>
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Image crop UI - shown when a file is selected */}
            {selectedFile && !croppedImage && (
              <div className="w-full mt-4">
                <ImageCrop
                  aspect={1}
                  file={selectedFile}
                  maxImageSize={5 * 1024 * 1024}
                  onChange={() => {}}
                  onComplete={() => {}}
                  onCrop={(dataUrl: string) => setCroppedImage(dataUrl)}
                >
                  <ImageCropContent className="max-w-md" />
                  <div className="flex items-center gap-2 mt-2">
                    <ImageCropApply />
                    <ImageCropReset />
                    <Button
                      onClick={async () => {
                        if (!croppedImage) {
                          toast.error("Please make a crop before applying.");
                          return;
                        }
                        setUploadingAvatar(true);
                        try {
                          // simulate upload latency
                          await new Promise((r) => setTimeout(r, 800));
                          form.setValue("avatar", croppedImage, {
                            shouldDirty: true,
                          });
                          toast.success(
                            "Profile picture updated successfully!"
                          );
                          // close cropper
                          setSelectedFile(null);
                        } catch (err) {
                          console.error(err);
                          toast.error("Failed to apply cropped image");
                        } finally {
                          setUploadingAvatar(false);
                        }
                      }}
                      size="sm"
                      type="button"
                    >
                      Apply Crop
                    </Button>
                    <Button
                      onClick={handleResetImage}
                      size="icon"
                      type="button"
                      variant="ghost"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </ImageCrop>
              </div>
            )}

            {/* Preview of cropped image */}
            {croppedImage && (
              <div className="mt-4 flex items-center gap-4">
                <img
                  src={croppedImage}
                  alt="Cropped preview"
                  width={100}
                  height={100}
                  className="rounded"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      // commit preview to form
                      form.setValue("avatar", croppedImage, {
                        shouldDirty: true,
                      });
                      setSelectedFile(null);
                      setCroppedImage(null);
                      toast.success("Profile picture updated successfully!");
                    }}
                    size="sm"
                    type="button"
                  >
                    Use Image
                  </Button>
                  <Button
                    onClick={handleResetImage}
                    size="icon"
                    type="button"
                    variant="ghost"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Header Image Section */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium">Profile Header Image</h3>
                <p className="text-sm text-muted-foreground">
                  Upload a header image for your profile
                </p>
              </div>

              <div className="space-y-4">
                {/* Header Image Preview */}
                <div className="w-full h-32 rounded-lg border-2 border-dashed border-muted-foreground/25 overflow-hidden relative">
                  {watchedValues.headerImage ? (
                    <img
                      src={watchedValues.headerImage}
                      alt="Header"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <ImageIcon className="h-8 w-8 mx-auto mb-2" />
                        <p className="text-sm">No header image</p>
                      </div>
                    </div>
                  )}
                  {uploadingHeaderImage && (
                    <div className="absolute inset-0 bg-background bg-opacity-50 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  )}
                </div>

                {/* Header Image Actions */}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={triggerHeaderImageUpload}
                    disabled={uploadingHeaderImage}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    {watchedValues.headerImage
                      ? "Change Header"
                      : "Upload Header"}
                  </Button>
                  {watchedValues.headerImage && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={handleRemoveHeaderImage}
                      disabled={uploadingHeaderImage}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  )}
                </div>
                <Text as="p" styleVariant="muted">
                  JPG, PNG, GIF up to 5MB. Recommended size: 1200x300px
                </Text>
              </div>
            </div>

            {/* Hidden header image file input */}
            <input
              ref={headerImageInputRef}
              type="file"
              accept="image/*"
              onChange={handleHeaderImageUpload}
              className="hidden"
            />

            <Separator />

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Full Name <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Username <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Email Address <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          type="email"
                          placeholder="your.email@example.com"
                          className="pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="+1 (555) 123-4567"
                          className="pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell others about yourself..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <div className="flex justify-between text-xs text-gray-500">
                    <FormMessage />
                    <Text as="p" styleVariant="muted">
                      {field.value?.length || 0}/500
                    </Text>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="City, State/Country"
                        className="pl-10"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Academic Information</CardTitle>
            <CardDescription>
              Update your educational background and current studies
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="university"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>University</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Your university name"
                          className="pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="major"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Major</FormLabel>
                    <FormControl>
                      <Input placeholder="Your field of study" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="yearOfStudy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year of Study</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your year" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1st Year">1st Year</SelectItem>
                        <SelectItem value="2nd Year">2nd Year</SelectItem>
                        <SelectItem value="3rd Year">3rd Year</SelectItem>
                        <SelectItem value="4th Year">4th Year</SelectItem>
                        <SelectItem value="Graduate">Graduate</SelectItem>
                        <SelectItem value="PhD">PhD</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Social Media Links</CardTitle>
            <CardDescription>
              Add links to your social media profiles and personal website
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="linkedinUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>LinkedIn Profile</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="https://linkedin.com/in/your-profile"
                          className="pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="githubUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GitHub Profile</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="https://github.com/your-username"
                          className="pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="instagramUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instagram</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Instagram className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="https://instagram.com/your-username"
                          className="pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tiktokUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>TikTok</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="https://tiktok.com/@your-username"
                          className="pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="websiteUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Personal Website</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="https://your-website.com"
                          className="pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {isDirty && !isSubmitting && (
          <div className="sticky bottom-6 mt-6 bg-background border rounded-lg p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <Text as="h4">You have unsaved changes</Text>
                <Text as="p" styleVariant="muted">
                  Save your personalization preferences to apply changes
                </Text>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </div>
            </div>
          </div>
        )}

        {/* Profile Completion Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Profile Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Profile completeness</span>
                <span className="font-medium">{completionPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${completionPercentage}%`,
                  }}
                />
              </div>
              <p className="text-xs text-gray-500">
                Complete your profile to improve your study partner matching
              </p>
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
};

export default ProfileSetting;
