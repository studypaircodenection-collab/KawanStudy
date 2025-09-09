import { createOpenAI } from "@ai-sdk/openai";
import { generateText, streamText, generateObject } from "ai";
import { z } from "zod";

// Initialize DeepSeek AI client
const deepseek = createOpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com",
});

// Available models
export const DEEPSEEK_MODELS = {
  CHAT: "deepseek-chat",
  CODER: "deepseek-coder",
  REASONER: "deepseek-reasoner",
} as const;

export type DeepSeekModel =
  (typeof DEEPSEEK_MODELS)[keyof typeof DEEPSEEK_MODELS];

// Configuration interface
export interface DeepSeekConfig {
  model?: DeepSeekModel;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

// Default configuration
const DEFAULT_CONFIG: Required<DeepSeekConfig> = {
  model: DEEPSEEK_MODELS.CHAT,
  temperature: 0.7,
  maxTokens: 2048,
  topP: 1,
  frequencyPenalty: 0,
  presencePenalty: 0,
};

// Generate text response
export async function generateDeepSeekText(
  prompt: string,
  config: DeepSeekConfig = {}
) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  try {
    const { text } = await generateText({
      model: deepseek(finalConfig.model),
      prompt,
      temperature: finalConfig.temperature,
      maxOutputTokens: finalConfig.maxTokens,
      topP: finalConfig.topP,
      frequencyPenalty: finalConfig.frequencyPenalty,
      presencePenalty: finalConfig.presencePenalty,
    });

    return { success: true, text, error: null };
  } catch (error) {
    console.error("DeepSeek text generation error:", error);
    return {
      success: false,
      text: null,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

// Stream text response
export async function streamDeepSeekText(
  prompt: string,
  config: DeepSeekConfig = {}
) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  try {
    const result = await streamText({
      model: deepseek(finalConfig.model),
      prompt,
      temperature: finalConfig.temperature,
      maxOutputTokens: finalConfig.maxTokens,
      topP: finalConfig.topP,
      frequencyPenalty: finalConfig.frequencyPenalty,
      presencePenalty: finalConfig.presencePenalty,
    });

    return { success: true, stream: result.textStream, error: null };
  } catch (error) {
    console.error("DeepSeek text streaming error:", error);
    return {
      success: false,
      stream: null,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

// Generate structured object
export async function generateDeepSeekObject<T>(
  prompt: string,
  schema: z.ZodSchema<T>,
  config: DeepSeekConfig = {}
) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  try {
    const { object } = await generateObject({
      model: deepseek(finalConfig.model),
      prompt,
      schema,
      temperature: finalConfig.temperature,
      maxTokens: finalConfig.maxTokens,
    });

    return { success: true, object, error: null };
  } catch (error) {
    console.error("DeepSeek object generation error:", error);
    return {
      success: false,
      object: null,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

// Chat with conversation history
export async function chatWithDeepSeek(
  messages: Array<{ role: "user" | "assistant" | "system"; content: string }>,
  config: DeepSeekConfig = {}
) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  try {
    const { text } = await generateText({
      model: deepseek(finalConfig.model),
      messages,
      temperature: finalConfig.temperature,
      maxOutputTokens: finalConfig.maxTokens,
      topP: finalConfig.topP,
      frequencyPenalty: finalConfig.frequencyPenalty,
      presencePenalty: finalConfig.presencePenalty,
    });

    return { success: true, text, error: null };
  } catch (error) {
    console.error("DeepSeek chat error:", error);
    return {
      success: false,
      text: null,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

// Stream chat with conversation history
export async function streamChatWithDeepSeek(
  messages: Array<{ role: "user" | "assistant" | "system"; content: string }>,
  config: DeepSeekConfig = {}
) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  try {
    const result = await streamText({
      model: deepseek(finalConfig.model),
      messages,
      temperature: finalConfig.temperature,
      maxOutputTokens: finalConfig.maxTokens,
      topP: finalConfig.topP,
      frequencyPenalty: finalConfig.frequencyPenalty,
      presencePenalty: finalConfig.presencePenalty,
    });

    return { success: true, stream: result.textStream, error: null };
  } catch (error) {
    console.error("DeepSeek stream chat error:", error);
    return {
      success: false,
      stream: null,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
