"use client";
import React, { useState, useRef, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  Save,
  Eye,
  ArrowLeft,
  ArrowRight,
  Upload,
  X,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { QuestionKind, type Quiz, type Question } from "@/types/quiz";
import { QuizService } from "@/lib/services/quiz";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Form validation schema
const singleChoiceQuestionSchema = z.object({
  id: z.string(),
  text: z.string().min(1, "Question text is required"),
  options: z
    .array(z.string().min(1, "Option cannot be empty"))
    .min(2, "At least 2 options required"),
  correct: z.number().min(0),
  kind: z.literal(QuestionKind.Single).optional(),
  explanation: z.string().optional(),
});

const multipleChoiceQuestionSchema = z.object({
  id: z.string(),
  text: z.string().min(1, "Question text is required"),
  options: z
    .array(z.string().min(1, "Option cannot be empty"))
    .min(2, "At least 2 options required"),
  correct: z.array(z.number()).min(1, "At least one correct answer required"),
  kind: z.literal(QuestionKind.Multiple),
  explanation: z.string().optional(),
  minSelections: z.number().min(1).optional(),
  maxSelections: z.number().min(1).optional(),
});

const questionSchema = z.discriminatedUnion("kind", [
  singleChoiceQuestionSchema,
  multipleChoiceQuestionSchema,
]);

const quizSchema = z.object({
  title: z.string().min(1, "Quiz title is required"),
  description: z.string().optional(),
  thumbnailUrl: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
  subject: z.string().min(1, "Subject is required"),
  gradeLevel: z.string().optional(),
  timeLimitMinutes: z.number().min(1).optional(),
  shuffle: z.boolean().optional(),
  questions: z
    .array(questionSchema)
    .min(1, "At least one question is required"),
});

type QuizFormData = z.infer<typeof quizSchema>;

interface EditQuizPageProps {
  params: Promise<{
    "quiz-id": string;
  }>;
}

// Mock data for demonstration - replace with actual API call
const mockQuizData: Quiz = {
  id: "quiz_123",
  title: "Introduction to Calculus",
  description:
    "Test your understanding of calculus fundamentals including derivatives, integration, and their applications.",
  thumbnailUrl:
    "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=250&fit=crop&crop=center",
  subject: "Mathematics",
  gradeLevel: "12",
  playCount: 42,
  timeLimitMinutes: 15,
  shuffle: false,
  questions: [
    {
      id: "q1",
      text: "What is the derivative of x²?",
      options: ["x", "2x", "x²", "2"],
      correct: 1,
      kind: QuestionKind.Single,
      explanation: "The derivative of x² is 2x using the power rule.",
    },
    {
      id: "q2",
      text: "Which of the following are integration techniques? (Select all that apply)",
      options: [
        "Substitution",
        "Integration by parts",
        "Partial fractions",
        "Differentiation",
      ],
      correct: [0, 1, 2],
      kind: QuestionKind.Multiple,
      explanation:
        "Substitution, integration by parts, and partial fractions are all valid integration techniques. Differentiation is the opposite operation.",
      minSelections: 1,
      maxSelections: 3,
    },
  ],
};

const EditQuizPage: React.FC<EditQuizPageProps> = ({ params }) => {
  const router = useRouter();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<"details" | "questions">(
    "details"
  );
  const [previewMode, setPreviewMode] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [originalQuiz, setOriginalQuiz] = useState<Quiz | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resolvedParams = React.use(params);
  const quizId = resolvedParams["quiz-id"];

  const form = useForm<QuizFormData>({
    resolver: zodResolver(quizSchema),
    defaultValues: {
      title: "",
      description: "",
      thumbnailUrl: "",
      subject: "",
      gradeLevel: "",
      timeLimitMinutes: 10,
      shuffle: false,
      questions: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "questions",
  });

  // Load quiz data on component mount
  useEffect(() => {
    loadQuizData();
  }, [quizId]);

  // Watch for form changes to detect unsaved changes
  useEffect(() => {
    const subscription = form.watch(() => {
      setHasUnsavedChanges(true);
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const loadQuizData = async () => {
    try {
      setIsLoading(true);

      // Fetch quiz data from API
      const response = await QuizService.getQuiz(quizId);

      if (!response.success) {
        throw new Error("Failed to load quiz");
      }

      const quiz = response.data;

      // Check if user is the owner
      if (!quiz.isOwner) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to edit this quiz.",
          variant: "destructive",
        });
        router.push(`/dashboard/quiz/${quizId}`);
        return;
      }

      setOriginalQuiz(quiz);

      // Set form values with loaded data
      form.reset({
        title: quiz.title,
        description: quiz.description || "",
        thumbnailUrl: quiz.thumbnailUrl || "",
        subject: quiz.subject,
        gradeLevel: quiz.gradeLevel || "",
        timeLimitMinutes: quiz.timeLimitMinutes || 10,
        shuffle: quiz.shuffle || false,
        questions: quiz.questions.map((q) => ({
          id: q.id,
          text: q.text,
          options: q.options,
          correct: q.correct as any, // Type assertion for discriminated union
          kind: q.kind || QuestionKind.Single,
          explanation: q.explanation || "",
        })),
      });

      if (quiz.thumbnailUrl) {
        setThumbnailPreview(quiz.thumbnailUrl);
      }

      setHasUnsavedChanges(false);
    } catch (error) {
      console.error("Error loading quiz:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to load quiz data. Please try again.",
        variant: "destructive",
      });
      // Redirect to quiz list if quiz not found
      router.push("/dashboard/quiz");
    } finally {
      setIsLoading(false);
    }
  };

  const addQuestion = () => {
    append({
      id: crypto.randomUUID(),
      text: "",
      options: ["", ""],
      correct: 0,
      kind: QuestionKind.Single,
      explanation: "",
    });
    setHasUnsavedChanges(true);
  };

  const addOption = (questionIndex: number) => {
    const currentOptions = form.getValues(`questions.${questionIndex}.options`);
    form.setValue(`questions.${questionIndex}.options`, [
      ...currentOptions,
      "",
    ]);
    setHasUnsavedChanges(true);
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const currentOptions = form.getValues(`questions.${questionIndex}.options`);
    if (currentOptions.length > 2) {
      const newOptions = currentOptions.filter((_, i) => i !== optionIndex);
      form.setValue(`questions.${questionIndex}.options`, newOptions);

      // Adjust correct answer if needed
      const question = form.getValues(`questions.${questionIndex}`);
      if (question.kind === QuestionKind.Multiple) {
        const correctArray = Array.isArray(question.correct)
          ? question.correct
          : [];
        const newCorrect = correctArray
          .filter((idx) => idx !== optionIndex)
          .map((idx) => (idx > optionIndex ? idx - 1 : idx));
        form.setValue(`questions.${questionIndex}.correct`, newCorrect);
      } else {
        const correct =
          typeof question.correct === "number" ? question.correct : 0;
        if (correct >= optionIndex && correct > 0) {
          form.setValue(`questions.${questionIndex}.correct`, correct - 1);
        }
      }
      setHasUnsavedChanges(true);
    }
  };

  const changeQuestionType = (questionIndex: number, newKind: QuestionKind) => {
    const currentKind = form.getValues(`questions.${questionIndex}.kind`);
    if (currentKind !== newKind) {
      form.setValue(`questions.${questionIndex}.kind`, newKind);

      if (newKind === QuestionKind.Multiple) {
        const currentCorrect = form.getValues(
          `questions.${questionIndex}.correct`
        );
        const correctAsNumber =
          typeof currentCorrect === "number" ? currentCorrect : 0;
        form.setValue(`questions.${questionIndex}.correct`, [correctAsNumber]);
      } else {
        const currentCorrect = form.getValues(
          `questions.${questionIndex}.correct`
        );
        const correctAsArray = Array.isArray(currentCorrect)
          ? currentCorrect
          : [0];
        form.setValue(
          `questions.${questionIndex}.correct`,
          correctAsArray[0] || 0
        );
      }
      setHasUnsavedChanges(true);
    }
  };

  const toggleMultipleChoiceOption = (
    questionIndex: number,
    optionIndex: number
  ) => {
    const question = form.getValues(`questions.${questionIndex}`);
    if (question.kind === QuestionKind.Multiple) {
      const currentCorrect = Array.isArray(question.correct)
        ? question.correct
        : [];
      const isSelected = currentCorrect.includes(optionIndex);

      let newCorrect;
      if (isSelected) {
        newCorrect = currentCorrect.filter((idx) => idx !== optionIndex);
      } else {
        newCorrect = [...currentCorrect, optionIndex].sort((a, b) => a - b);
      }

      form.setValue(`questions.${questionIndex}.correct`, newCorrect);
      setHasUnsavedChanges(true);
    }
  };

  // File upload handlers
  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setThumbnailPreview(result);
        form.setValue("thumbnailUrl", result);
        setHasUnsavedChanges(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find((file) => file.type.startsWith("image/"));
    if (imageFile) {
      handleFileSelect(imageFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const clearThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview("");
    form.setValue("thumbnailUrl", "");
    setHasUnsavedChanges(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const onSubmit = async (data: QuizFormData) => {
    try {
      setIsSaving(true);

      // Update quiz using API
      const response = await QuizService.updateQuiz(quizId, data);

      toast({
        title: "Success",
        description: response.message || "Quiz updated successfully!",
      });

      setHasUnsavedChanges(false);
      router.push(`/dashboard/quiz/${quizId}`);
    } catch (error) {
      console.error("Error updating quiz:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update quiz. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    if (hasUnsavedChanges) {
      // Show confirmation dialog
      const confirmLeave = confirm(
        "You have unsaved changes. Are you sure you want to leave?"
      );
      if (!confirmLeave) return;
    }
    router.push(`/dashboard/quiz/${quizId}`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 max-w-4xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading quiz data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!originalQuiz) {
    return (
      <div className="container mx-auto py-6 max-w-4xl">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Quiz Not Found</h2>
              <p className="text-muted-foreground mb-4">
                The quiz you're trying to edit doesn't exist or you don't have
                permission to edit it.
              </p>
              <Button onClick={() => router.push("/dashboard/quiz")}>
                Back to Quizzes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (previewMode) {
    const formData = form.getValues();
    return (
      <div className="container mx-auto py-6 max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="outline" onClick={() => setPreviewMode(false)}>
            <ArrowLeft className="w-4 h-4" />
            Back to Edit
          </Button>
          {hasUnsavedChanges && (
            <Badge variant="destructive" className="ml-2">
              Unsaved Changes
            </Badge>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{formData.title}</CardTitle>
            {formData.description && (
              <CardDescription>{formData.description}</CardDescription>
            )}
            <div className="flex gap-2 mt-2">
              <Badge variant="secondary">{formData.subject}</Badge>
              {formData.gradeLevel && (
                <Badge variant="outline">Grade {formData.gradeLevel}</Badge>
              )}
              {formData.timeLimitMinutes && (
                <Badge variant="outline">{formData.timeLimitMinutes} min</Badge>
              )}
            </div>
            {(formData.thumbnailUrl || thumbnailPreview) && (
              <div className="mt-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={thumbnailPreview || formData.thumbnailUrl}
                  alt={`${formData.title} thumbnail`}
                  className="w-32 h-24 object-cover rounded-lg border"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
            )}
          </CardHeader>

          <CardContent className="space-y-6">
            {formData.questions.map((question, index) => (
              <div key={question.id} className="border rounded-lg p-4">
                <h3 className="font-medium mb-3">
                  Question {index + 1}: {question.text}
                </h3>
                <div className="space-y-2">
                  {question.options.map((option, optIndex) => {
                    const isCorrect =
                      question.kind === QuestionKind.Multiple
                        ? Array.isArray(question.correct) &&
                          question.correct.includes(optIndex)
                        : question.correct === optIndex;

                    return (
                      <div
                        key={optIndex}
                        className={`p-2 border rounded ${
                          isCorrect
                            ? "bg-green-50 border-green-200"
                            : "bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {question.kind === QuestionKind.Multiple ? (
                            <Checkbox checked={isCorrect} disabled />
                          ) : (
                            <RadioGroupItem
                              value={optIndex.toString()}
                              checked={isCorrect}
                              disabled
                            />
                          )}
                          <span
                            className={
                              isCorrect ? "font-medium text-green-800" : ""
                            }
                          >
                            {option}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {question.explanation && (
                  <div className="mt-3 p-2 bg-blue-50 rounded text-sm text-blue-800">
                    <strong>Explanation:</strong> {question.explanation}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Edit Quiz</h1>
          <p className="text-muted-foreground">
            Modify your quiz content and settings
          </p>
        </div>
        {hasUnsavedChanges && (
          <Badge variant="destructive" className="ml-2">
            Unsaved Changes
          </Badge>
        )}
      </div>

      <div className="mb-6 flex items-center gap-4">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="w-4 h-4" />
          Back to Quiz
        </Button>
        <Button
          variant={currentStep === "details" ? "default" : "outline"}
          onClick={() => setCurrentStep("details")}
        >
          1. Quiz Details
        </Button>
        <Button
          variant={currentStep === "questions" ? "default" : "outline"}
          onClick={() => setCurrentStep("questions")}
        >
          2. Questions
        </Button>
        <Button
          variant="outline"
          onClick={() => setPreviewMode(true)}
          disabled={!form.formState.isValid}
        >
          <Eye className="w-4 h-4" />
          Preview
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {currentStep === "details" && (
            <Card>
              <CardHeader>
                <CardTitle>Quiz Details</CardTitle>
                <CardDescription>
                  Update the basic information for your quiz
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quiz Title *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter quiz title..." />
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
                          {...field}
                          placeholder="Brief description of the quiz..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="thumbnailUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Thumbnail Image (Optional)</FormLabel>
                      <div className="space-y-4">
                        {thumbnailPreview && (
                          <div className="relative inline-block">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={thumbnailPreview}
                              alt="Thumbnail preview"
                              className="w-32 h-24 object-cover rounded-lg border"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute -top-2 -right-2 h-6 w-6 p-0"
                              onClick={clearThumbnail}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        )}

                        <div
                          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                            isDragging
                              ? "border-primary bg-primary/5"
                              : "border-muted-foreground/25 hover:border-primary/50"
                          }`}
                          onDrop={handleDrop}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onClick={openFileDialog}
                        >
                          <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            Drop an image file here or click to select
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            or
                          </span>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Enter image URL..."
                              className="flex-1"
                            />
                          </FormControl>
                        </div>

                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileInputChange}
                          className="hidden"
                        />
                      </div>
                      <FormDescription>
                        Upload an image file or provide a URL for your quiz
                        thumbnail
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
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a subject" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Mathematics">
                              Mathematics
                            </SelectItem>
                            <SelectItem value="Science">Science</SelectItem>
                            <SelectItem value="English">English</SelectItem>
                            <SelectItem value="History">History</SelectItem>
                            <SelectItem value="Computer Science">
                              Computer Science
                            </SelectItem>
                            <SelectItem value="Physics">Physics</SelectItem>
                            <SelectItem value="Chemistry">Chemistry</SelectItem>
                            <SelectItem value="Biology">Biology</SelectItem>
                            <SelectItem value="Geography">Geography</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="gradeLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Grade Level</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select grade level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Array.from({ length: 12 }, (_, i) => i + 1).map(
                              (grade) => (
                                <SelectItem
                                  key={grade}
                                  value={grade.toString()}
                                >
                                  Grade {grade}
                                </SelectItem>
                              )
                            )}
                            <SelectItem value="college">College</SelectItem>
                            <SelectItem value="university">
                              University
                            </SelectItem>
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
                    name="timeLimitMinutes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time Limit (minutes)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            max="180"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value) || 0)
                            }
                            placeholder="e.g., 10"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="shuffle"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Shuffle Questions</FormLabel>
                          <FormDescription>
                            Randomize question order for each attempt
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
              <CardFooter>
                <Button
                  type="button"
                  onClick={() => setCurrentStep("questions")}
                >
                  <ArrowRight className="w-4 h-4" />
                  Next: Edit Questions
                </Button>
              </CardFooter>
            </Card>
          )}

          {currentStep === "questions" && (
            <div className="space-y-6">
              {fields.map((field, questionIndex) => (
                <Card key={field.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Question {questionIndex + 1}</CardTitle>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          if (fields.length > 1) {
                            remove(questionIndex);
                            setHasUnsavedChanges(true);
                          }
                        }}
                        disabled={fields.length <= 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name={`questions.${questionIndex}.kind`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Question Type</FormLabel>
                          <Select
                            onValueChange={(value) =>
                              changeQuestionType(
                                questionIndex,
                                value as QuestionKind
                              )
                            }
                            value={field.value || QuestionKind.Single}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value={QuestionKind.Single}>
                                Single Choice
                              </SelectItem>
                              <SelectItem value={QuestionKind.Multiple}>
                                Multiple Choice
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`questions.${questionIndex}.text`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Question Text *</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Enter your question..."
                              className="min-h-[80px]"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-3">
                      <FormLabel>Answer Options *</FormLabel>
                      {form
                        .watch(`questions.${questionIndex}.options`)
                        .map((_, optionIndex) => (
                          <div key={optionIndex} className="space-y-2">
                            <div className="flex items-center gap-2">
                              <FormField
                                control={form.control}
                                name={`questions.${questionIndex}.options.${optionIndex}`}
                                render={({ field }) => (
                                  <FormItem className="flex-1">
                                    <FormControl>
                                      <Input
                                        {...field}
                                        placeholder={`Option ${
                                          optionIndex + 1
                                        }`}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              {form.watch(`questions.${questionIndex}.kind`) ===
                              QuestionKind.Multiple ? (
                                <Checkbox
                                  checked={
                                    Array.isArray(
                                      form.watch(
                                        `questions.${questionIndex}.correct`
                                      )
                                    ) &&
                                    (
                                      form.watch(
                                        `questions.${questionIndex}.correct`
                                      ) as number[]
                                    ).includes(optionIndex)
                                  }
                                  onCheckedChange={() =>
                                    toggleMultipleChoiceOption(
                                      questionIndex,
                                      optionIndex
                                    )
                                  }
                                />
                              ) : (
                                <RadioGroup
                                  value={form
                                    .watch(`questions.${questionIndex}.correct`)
                                    ?.toString()}
                                  onValueChange={(value) =>
                                    form.setValue(
                                      `questions.${questionIndex}.correct`,
                                      parseInt(value)
                                    )
                                  }
                                >
                                  <RadioGroupItem
                                    value={optionIndex.toString()}
                                    id={`q${questionIndex}-opt${optionIndex}`}
                                  />
                                </RadioGroup>
                              )}

                              {form.watch(`questions.${questionIndex}.options`)
                                .length > 2 && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    removeOption(questionIndex, optionIndex)
                                  }
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addOption(questionIndex)}
                      >
                        <Plus className="w-4 h-4" />
                        Add Option
                      </Button>
                    </div>

                    <FormField
                      control={form.control}
                      name={`questions.${questionIndex}.explanation`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Explanation (Optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Explain why this is the correct answer..."
                            />
                          </FormControl>
                          <FormDescription>
                            This will be shown to students after they answer
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              ))}

              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={addQuestion}>
                  <Plus className="w-4 h-4" />
                  Add Question
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep("details")}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Details
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button type="button" disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Update Quiz
                        </>
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Update Quiz</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to update this quiz? This will
                        save all your changes.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={form.handleSubmit(onSubmit)}>
                        Update Quiz
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
};

export default EditQuizPage;
