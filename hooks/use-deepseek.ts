"use client";

import { useState, useCallback } from "react";
import { DEEPSEEK_MODELS, type DeepSeekConfig } from "@/lib/ai/deepseek";

export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: Date;
}

export interface UseDeepSeekOptions {
  defaultConfig?: DeepSeekConfig;
  onError?: (error: string) => void;
  onSuccess?: (response: any) => void;
}

export function useDeepSeek(options: UseDeepSeekOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<string | null>(null);

  const { defaultConfig = {}, onError, onSuccess } = options;

  const makeRequest = useCallback(
    async (action: string, data: any, config: DeepSeekConfig = {}) => {
      setIsLoading(true);
      setError(null);
      setResponse(null);

      try {
        const requestBody = {
          action,
          ...data,
          config: { ...defaultConfig, ...config },
        };

        const response = await fetch("/api/ai/deepseek", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || "Request failed");
        }

        setResponse(result.text || result.object || "Success");
        onSuccess?.(result);
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        setError(errorMessage);
        onError?.(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [defaultConfig, onError, onSuccess]
  );

  // Generate text
  const generateText = useCallback(
    async (prompt: string, config: DeepSeekConfig = {}) => {
      return makeRequest("generate-text", { prompt }, config);
    },
    [makeRequest]
  );

  // Chat with conversation
  const chat = useCallback(
    async (messages: Message[], config: DeepSeekConfig = {}) => {
      const formattedMessages = messages.map(({ role, content }) => ({
        role,
        content,
      }));
      return makeRequest("chat", { messages: formattedMessages }, config);
    },
    [makeRequest]
  );

  // Generate structured object
  const generateObject = useCallback(
    async (prompt: string, schema: any, config: DeepSeekConfig = {}) => {
      return makeRequest("generate-object", { prompt, schema }, config);
    },
    [makeRequest]
  );

  return {
    isLoading,
    error,
    response,
    generateText,
    chat,
    generateObject,
    clearError: () => setError(null),
    clearResponse: () => setResponse(null),
  };
}

// Hook for streaming responses
export function useDeepSeekStream(options: UseDeepSeekOptions = {}) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamedText, setStreamedText] = useState<string>("");

  const { defaultConfig = {}, onError } = options;

  const streamText = useCallback(
    async (
      prompt: string,
      config: DeepSeekConfig = {},
      onChunk?: (chunk: string) => void
    ) => {
      setIsStreaming(true);
      setError(null);
      setStreamedText("");

      try {
        const requestBody = {
          action: "stream-text",
          prompt,
          config: { ...defaultConfig, ...config },
        };

        const response = await fetch("/api/ai/deepseek", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Request failed");
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("Response body is not readable");
        }

        let accumulatedText = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = new TextDecoder().decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));

                if (data.error) {
                  throw new Error(data.error);
                }

                if (data.done) {
                  setIsStreaming(false);
                  return accumulatedText;
                }

                if (data.chunk) {
                  accumulatedText += data.chunk;
                  setStreamedText(accumulatedText);
                  onChunk?.(data.chunk);
                }
              } catch (parseError) {
                // Ignore parsing errors for incomplete chunks
              }
            }
          }
        }

        return accumulatedText;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        setError(errorMessage);
        onError?.(errorMessage);
        throw err;
      } finally {
        setIsStreaming(false);
      }
    },
    [defaultConfig, onError]
  );

  const streamChat = useCallback(
    async (
      messages: Message[],
      config: DeepSeekConfig = {},
      onChunk?: (chunk: string) => void
    ) => {
      setIsStreaming(true);
      setError(null);
      setStreamedText("");

      try {
        const formattedMessages = messages.map(({ role, content }) => ({
          role,
          content,
        }));
        const requestBody = {
          action: "stream-chat",
          messages: formattedMessages,
          config: { ...defaultConfig, ...config },
        };

        const response = await fetch("/api/ai/deepseek", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Request failed");
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("Response body is not readable");
        }

        let accumulatedText = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = new TextDecoder().decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));

                if (data.error) {
                  throw new Error(data.error);
                }

                if (data.done) {
                  setIsStreaming(false);
                  return accumulatedText;
                }

                if (data.chunk) {
                  accumulatedText += data.chunk;
                  setStreamedText(accumulatedText);
                  onChunk?.(data.chunk);
                }
              } catch (parseError) {
                // Ignore parsing errors for incomplete chunks
              }
            }
          }
        }

        return accumulatedText;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        setError(errorMessage);
        onError?.(errorMessage);
        throw err;
      } finally {
        setIsStreaming(false);
      }
    },
    [defaultConfig, onError]
  );

  return {
    isStreaming,
    error,
    streamedText,
    streamText,
    streamChat,
    clearError: () => setError(null),
    clearStreamedText: () => setStreamedText(""),
  };
}
