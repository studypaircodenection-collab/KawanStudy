"use client";
import React, { useState, useRef } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Plus,
  Trash2,
  Save,
  Eye,
  ArrowLeft,
  ArrowRight,
  Upload,
  X,
} from "lucide-react";
import { QuestionKind, type Quiz, type Question } from "@/types/quiz";
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

const CreateQuizPage = () => {
  const [currentStep, setCurrentStep] = useState<"details" | "questions">(
    "details"
  );
  const [previewMode, setPreviewMode] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      questions: [
        {
          id: crypto.randomUUID(),
          text: "",
          options: ["", ""],
          correct: 0,
          kind: QuestionKind.Single,
          explanation: "",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "questions",
  });

  const addQuestion = () => {
    append({
      id: crypto.randomUUID(),
      text: "",
      options: ["", ""],
      correct: 0,
      kind: QuestionKind.Single,
      explanation: "",
    });
  };

  const addOption = (questionIndex: number) => {
    const currentOptions = form.getValues(`questions.${questionIndex}.options`);
    form.setValue(`questions.${questionIndex}.options`, [
      ...currentOptions,
      "",
    ]);
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const currentOptions = form.getValues(`questions.${questionIndex}.options`);
    if (currentOptions.length > 2) {
      const newOptions = currentOptions.filter((_, i) => i !== optionIndex);
      form.setValue(`questions.${questionIndex}.options`, newOptions);

      // Adjust correct answer if needed
      const question = form.getValues(`questions.${questionIndex}`);
      if (question.kind === QuestionKind.Multiple) {
        // For multiple choice, filter out the removed option index and adjust others
        const correctArray = Array.isArray(question.correct)
          ? question.correct
          : [];
        const newCorrect = correctArray
          .filter((idx) => idx !== optionIndex)
          .map((idx) => (idx > optionIndex ? idx - 1 : idx));
        form.setValue(`questions.${questionIndex}.correct`, newCorrect);
      } else {
        // For single choice, adjust if the correct answer was affected
        const correct =
          typeof question.correct === "number" ? question.correct : 0;
        if (correct >= optionIndex && correct > 0) {
          form.setValue(`questions.${questionIndex}.correct`, correct - 1);
        }
      }
    }
  };

  const changeQuestionType = (questionIndex: number, newKind: QuestionKind) => {
    const currentKind = form.getValues(`questions.${questionIndex}.kind`);
    if (currentKind !== newKind) {
      form.setValue(`questions.${questionIndex}.kind`, newKind);

      if (newKind === QuestionKind.Multiple) {
        // Convert single choice to multiple choice
        const currentCorrect = form.getValues(
          `questions.${questionIndex}.correct`
        );
        const correctAsNumber =
          typeof currentCorrect === "number" ? currentCorrect : 0;
        form.setValue(`questions.${questionIndex}.correct`, [correctAsNumber]);
      } else {
        // Convert multiple choice to single choice
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
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const onSubmit = (data: QuizFormData) => {
    console.log("Quiz data:", data);
    // TODO: Save quiz to database
    alert("Quiz created successfully! (This would save to database)");
  };

  if (previewMode) {
    const formData = form.getValues();
    return (
      <div className="container mx-auto py-6 max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="outline" onClick={() => setPreviewMode(false)}>
            <ArrowLeft className="w-4 h-4" />
            Back to Edit
          </Button>
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
                        : optIndex === question.correct;

                    return (
                      <div
                        key={optIndex}
                        className={`p-2 rounded border ${
                          isCorrect
                            ? "bg-green-50 border-green-200 text-green-800"
                            : "bg-gray-50"
                        }`}
                      >
                        {option}
                        {isCorrect && (
                          <Badge variant="default" className="ml-2">
                            Correct
                          </Badge>
                        )}
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Create New Quiz</h1>
        <p className="text-muted-foreground">
          Build an engaging quiz for your students
        </p>
      </div>

      <div className="mb-6 flex items-center gap-4">
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
                  Set up the basic information for your quiz
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
                        <Input placeholder="Enter quiz title..." {...field} />
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
                          placeholder="Brief description of the quiz..."
                          {...field}
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
                        {/* Drag and Drop Area */}
                        <div
                          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                            isDragging
                              ? "border-primary bg-primary/5"
                              : "border-muted-foreground/25 hover:border-muted-foreground/50"
                          }`}
                          onDrop={handleDrop}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                        >
                          {thumbnailPreview || field.value ? (
                            <div className="relative">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={thumbnailPreview || field.value}
                                alt="Quiz thumbnail preview"
                                className="w-32 h-24 object-cover rounded-lg border mx-auto"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute -top-2 -right-2"
                                onClick={clearThumbnail}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                              <div className="space-y-1">
                                <p className="text-sm font-medium">
                                  Drop image here or click to upload
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  PNG, JPG, GIF up to 10MB
                                </p>
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={openFileDialog}
                              >
                                Choose File
                              </Button>
                            </div>
                          )}
                        </div>

                        {/* Hidden file input */}
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileInputChange}
                          className="hidden"
                        />

                        {/* URL Input Alternative */}
                        <div className="space-y-2">
                          <p className="text-sm font-medium">
                            Or enter image URL:
                          </p>
                          <FormControl>
                            <Input
                              type="url"
                              placeholder="https://example.com/image.jpg"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                // Clear file preview when URL is entered
                                if (
                                  e.target.value &&
                                  !e.target.value.startsWith("data:")
                                ) {
                                  setThumbnailPreview("");
                                  setThumbnailFile(null);
                                }
                              }}
                            />
                          </FormControl>
                        </div>
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
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select subject" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="math">Mathematics</SelectItem>
                            <SelectItem value="science">Science</SelectItem>
                            <SelectItem value="english">English</SelectItem>
                            <SelectItem value="history">History</SelectItem>
                            <SelectItem value="geography">Geography</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
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
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select grade" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Array.from({ length: 12 }, (_, i) => (
                              <SelectItem key={i + 1} value={String(i + 1)}>
                                Grade {i + 1}
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
                    name="timeLimitMinutes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time Limit (minutes)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            placeholder="10"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
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
                            Randomize question order
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
                  Next: Add Questions
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
                      <CardTitle className="text-lg">
                        Question {questionIndex + 1}
                      </CardTitle>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => remove(questionIndex)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
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
                            defaultValue={field.value || QuestionKind.Single}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select question type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value={QuestionKind.Single}>
                                Single Choice (One correct answer)
                              </SelectItem>
                              <SelectItem value={QuestionKind.Multiple}>
                                Multiple Choice (Multiple correct answers)
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
                              placeholder="Enter your question..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div>
                      <FormLabel>Answer Options *</FormLabel>
                      <div className="space-y-2 mt-2">
                        {form
                          .watch(`questions.${questionIndex}.options`)
                          .map((_, optionIndex) => {
                            const question = form.watch(
                              `questions.${questionIndex}`
                            );
                            const isMultiple =
                              question.kind === QuestionKind.Multiple;
                            const isSelected = isMultiple
                              ? Array.isArray(question.correct) &&
                                question.correct.includes(optionIndex)
                              : question.correct === optionIndex;

                            return (
                              <div
                                key={optionIndex}
                                className="flex gap-2 items-center"
                              >
                                <FormField
                                  control={form.control}
                                  name={`questions.${questionIndex}.options.${optionIndex}`}
                                  render={({ field }) => (
                                    <FormItem className="flex-1">
                                      <FormControl>
                                        <Input
                                          placeholder={`Option ${
                                            optionIndex + 1
                                          }`}
                                          {...field}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                {isMultiple ? (
                                  <Button
                                    type="button"
                                    variant={isSelected ? "default" : "outline"}
                                    size="sm"
                                    onClick={() =>
                                      toggleMultipleChoiceOption(
                                        questionIndex,
                                        optionIndex
                                      )
                                    }
                                  >
                                    {isSelected ? "✓" : ""}
                                  </Button>
                                ) : (
                                  <FormField
                                    control={form.control}
                                    name={`questions.${questionIndex}.correct`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormControl>
                                          <Button
                                            type="button"
                                            variant={
                                              field.value === optionIndex
                                                ? "default"
                                                : "outline"
                                            }
                                            size="sm"
                                            onClick={() =>
                                              field.onChange(optionIndex)
                                            }
                                          >
                                            {field.value === optionIndex
                                              ? "✓"
                                              : ""}
                                          </Button>
                                        </FormControl>
                                      </FormItem>
                                    )}
                                  />
                                )}

                                {form.watch(
                                  `questions.${questionIndex}.options`
                                ).length > 2 && (
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    onClick={() =>
                                      removeOption(questionIndex, optionIndex)
                                    }
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            );
                          })}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => addOption(questionIndex)}
                        disabled={
                          form.watch(`questions.${questionIndex}.options`)
                            .length >= 6
                        }
                      >
                        <Plus className="w-4 h-4" />
                        Add Option
                      </Button>
                      {form.watch(`questions.${questionIndex}.kind`) ===
                        QuestionKind.Multiple && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Select multiple correct answers by clicking the
                          checkmark buttons
                        </p>
                      )}
                    </div>

                    <FormField
                      control={form.control}
                      name={`questions.${questionIndex}.explanation`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Explanation (Optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Explain why this is the correct answer..."
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            This will be shown after the user answers
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

                <Button type="submit">
                  <Save className="w-4 h-4" />
                  Create Quiz
                </Button>
              </div>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
};

export default CreateQuizPage;
