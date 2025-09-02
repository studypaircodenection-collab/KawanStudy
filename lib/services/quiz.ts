import { Quiz } from "@/types/quiz";

const API_BASE = "/api/quiz";

export interface QuizFormData {
  title: string;
  description?: string;
  thumbnailUrl?: string;
  subject: string;
  gradeLevel?: string;
  timeLimitMinutes?: number;
  shuffle?: boolean;
  questions: {
    id: string;
    text: string;
    options: string[];
    correct: number | number[];
    kind?: "single" | "multiple";
    explanation?: string;
    tags?: string[];
    timeLimitSeconds?: number;
  }[];
  metadata?: Record<string, string | number | boolean>;
}

export interface QuizListResponse {
  success: boolean;
  data: Quiz[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface QuizResponse {
  success: boolean;
  data: Quiz & {
    createdBy?: any;
    isOwner?: boolean;
    attemptsCount?: number;
    bestScore?: number;
  };
}

export interface CreateQuizResponse {
  success: boolean;
  data: {
    id: string;
    message: string;
  };
}

export interface UpdateQuizResponse {
  success: boolean;
  message: string;
}

export class QuizService {
  // Get all quizzes with pagination and filtering
  static async getQuizzes(params?: {
    page?: number;
    limit?: number;
    subject?: string;
    gradeLevel?: string;
    search?: string;
    createdBy?: string;
  }): Promise<QuizListResponse> {
    const searchParams = new URLSearchParams();

    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.subject) searchParams.set("subject", params.subject);
    if (params?.gradeLevel) searchParams.set("gradeLevel", params.gradeLevel);
    if (params?.search) searchParams.set("search", params.search);
    if (params?.createdBy) searchParams.set("createdBy", params.createdBy);

    const response = await fetch(`${API_BASE}?${searchParams.toString()}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch quizzes: ${response.statusText}`);
    }

    return response.json();
  }

  // Get a specific quiz by ID
  static async getQuiz(id: string): Promise<QuizResponse> {
    const response = await fetch(`${API_BASE}/${id}`);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Quiz not found");
      }
      throw new Error(`Failed to fetch quiz: ${response.statusText}`);
    }

    return response.json();
  }

  // Create a new quiz
  static async createQuiz(quizData: QuizFormData): Promise<CreateQuizResponse> {
    const response = await fetch(API_BASE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(quizData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `Failed to create quiz: ${response.statusText}`
      );
    }

    return response.json();
  }

  // Update an existing quiz
  static async updateQuiz(
    id: string,
    quizData: QuizFormData
  ): Promise<UpdateQuizResponse> {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(quizData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `Failed to update quiz: ${response.statusText}`
      );
    }

    return response.json();
  }

  // Delete a quiz
  static async deleteQuiz(
    id: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `Failed to delete quiz: ${response.statusText}`
      );
    }

    return response.json();
  }

  // Get user's own quizzes
  static async getUserQuizzes(userId?: string): Promise<QuizListResponse> {
    return this.getQuizzes({ createdBy: userId });
  }
}
