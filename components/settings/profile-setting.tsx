"use client";

import React, { useRef, useState } from "react";
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
import { toast } from "sonner";
import { profileSchema, ProfileFormData } from "@/lib/validations/profile";

// Import Claims type from auth provider
type Claims = {
  sub: string;
  email: string;
  full_name?: string | "N/A";
  username?: string | "N/A";
  phone?: string | "N/A";
  bio?: string | "N/A";
  location?: string | "N/A";
  avatar_url?: string | "N/A";
  academic?: {
    university?: string | "N/A";
    major?: string | "N/A";
    year_of_study?: string | "N/A";
  };
  role: string | "N/A";
  created_at?: string | "N/A";
  updated_at?: string | "N/A";
};

const ProfileSetting = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { claims, setClaims } = useAuth();
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

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
      avatar: claims?.avatar_url || "/api/placeholder/100/100",
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

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
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
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                    <RefreshCw className="h-6 w-6 text-white animate-spin" />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <h3 className="font-medium">Profile Picture</h3>
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
                <p className="text-xs text-gray-500">JPG, PNG, GIF up to 5MB</p>
              </div>
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
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
                    <span>{field.value?.length || 0}/500</span>
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

        {isDirty && !isSubmitting && (
          <div className="sticky bottom-6 mt-6 bg-white border border-gray-200 rounded-lg p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">You have unsaved changes</h4>
                <p className="text-sm text-gray-600">
                  Save your notification preferences to apply changes
                </p>
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
