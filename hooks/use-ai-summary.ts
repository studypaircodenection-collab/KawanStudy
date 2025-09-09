import { useState, useEffect, useCallback } from "react";

interface AISummaryData {
  summary: string;
  trend_analysis: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  confidence_level?: "high" | "medium" | "low";
  last_updated: string;
  attempts_analyzed: number;
  from_cache: boolean;
}

interface UseAISummaryResult {
  data: AISummaryData | null;
  isLoading: boolean;
  error: string | null;
  generateSummary: () => Promise<void>;
  refetch: () => Promise<void>;
}

export function useAISummary(
  quizId: string,
  autoGenerate: boolean = false
): UseAISummaryResult {
  const [data, setData] = useState<AISummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchExistingSummary = useCallback(async () => {
    try {
      const response = await fetch(`/api/quiz/${quizId}/ai-summary`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setData(result.data);
          return true;
        }
      }
      return false;
    } catch (err) {
      console.error("Error fetching existing summary:", err);
      return false;
    }
  }, [quizId]);

  const generateSummary = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/quiz/${quizId}/ai-summary`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate AI summary");
      }

      const result = await response.json();
      if (result.success) {
        setData(result.data);
      } else {
        throw new Error(result.error || "Failed to generate AI summary");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      console.error("Error generating AI summary:", err);
    } finally {
      setIsLoading(false);
    }
  }, [quizId]);

  const refetch = useCallback(async () => {
    const hasExisting = await fetchExistingSummary();
    if (!hasExisting && autoGenerate) {
      await generateSummary();
    }
  }, [fetchExistingSummary, generateSummary, autoGenerate]);

  useEffect(() => {
    if (quizId) {
      refetch();
    }
  }, [quizId, refetch]);

  return {
    data,
    isLoading,
    error,
    generateSummary,
    refetch,
  };
}

export default useAISummary;
