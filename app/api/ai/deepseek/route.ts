import { NextRequest, NextResponse } from "next/server";
import {
  generateDeepSeekText,
  streamDeepSeekText,
  chatWithDeepSeek,
  streamChatWithDeepSeek,
  generateDeepSeekObject,
  DEEPSEEK_MODELS,
  type DeepSeekConfig,
} from "@/lib/ai/deepseek";
import { z } from "zod";

// Request validation schemas
const TextGenerationSchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
  config: z
    .object({
      model: z
        .enum([
          DEEPSEEK_MODELS.CHAT,
          DEEPSEEK_MODELS.CODER,
          DEEPSEEK_MODELS.REASONER,
        ])
        .optional(),
      temperature: z.number().min(0).max(2).optional(),
      maxTokens: z.number().min(1).max(4096).optional(),
      topP: z.number().min(0).max(1).optional(),
      frequencyPenalty: z.number().min(-2).max(2).optional(),
      presencePenalty: z.number().min(-2).max(2).optional(),
    })
    .optional(),
});

const ChatSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant", "system"]),
        content: z.string().min(1),
      })
    )
    .min(1, "At least one message is required"),
  config: z
    .object({
      model: z
        .enum([
          DEEPSEEK_MODELS.CHAT,
          DEEPSEEK_MODELS.CODER,
          DEEPSEEK_MODELS.REASONER,
        ])
        .optional(),
      temperature: z.number().min(0).max(2).optional(),
      maxTokens: z.number().min(1).max(4096).optional(),
      topP: z.number().min(0).max(1).optional(),
      frequencyPenalty: z.number().min(-2).max(2).optional(),
      presencePenalty: z.number().min(-2).max(2).optional(),
    })
    .optional(),
});

const ObjectGenerationSchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
  schema: z.any(), // Will be validated as a Zod schema
  config: z
    .object({
      model: z
        .enum([
          DEEPSEEK_MODELS.CHAT,
          DEEPSEEK_MODELS.CODER,
          DEEPSEEK_MODELS.REASONER,
        ])
        .optional(),
      temperature: z.number().min(0).max(2).optional(),
      maxTokens: z.number().min(1).max(4096).optional(),
    })
    .optional(),
});

// POST handler for various AI operations
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    // Check if API key is configured
    if (!process.env.DEEPSEEK_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error:
            "DeepSeek API key not configured. Please add DEEPSEEK_API_KEY to your environment variables.",
        },
        { status: 500 }
      );
    }

    switch (action) {
      case "generate-text": {
        const validation = TextGenerationSchema.safeParse(data);
        if (!validation.success) {
          return NextResponse.json(
            {
              success: false,
              error: "Invalid request data",
              details: validation.error.issues,
            },
            { status: 400 }
          );
        }

        const { prompt, config } = validation.data;
        const result = await generateDeepSeekText(prompt, config);

        return NextResponse.json(result);
      }

      case "stream-text": {
        const validation = TextGenerationSchema.safeParse(data);
        if (!validation.success) {
          return NextResponse.json(
            {
              success: false,
              error: "Invalid request data",
              details: validation.error.issues,
            },
            { status: 400 }
          );
        }

        const { prompt, config } = validation.data;
        const result = await streamDeepSeekText(prompt, config);

        if (!result.success) {
          return NextResponse.json(result);
        }

        // Return a streaming response
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
          async start(controller) {
            try {
              for await (const chunk of result.stream!) {
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ chunk })}\n\n`)
                );
              }
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`)
              );
            } catch (error) {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    error:
                      error instanceof Error ? error.message : "Stream error",
                  })}\n\n`
                )
              );
            } finally {
              controller.close();
            }
          },
        });

        return new Response(stream, {
          headers: {
            "Content-Type": "text/stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
          },
        });
      }

      case "chat": {
        const validation = ChatSchema.safeParse(data);
        if (!validation.success) {
          return NextResponse.json(
            {
              success: false,
              error: "Invalid request data",
              details: validation.error.issues,
            },
            { status: 400 }
          );
        }

        const { messages, config } = validation.data;
        const result = await chatWithDeepSeek(messages, config);

        return NextResponse.json(result);
      }

      case "stream-chat": {
        const validation = ChatSchema.safeParse(data);
        if (!validation.success) {
          return NextResponse.json(
            {
              success: false,
              error: "Invalid request data",
              details: validation.error.issues,
            },
            { status: 400 }
          );
        }

        const { messages, config } = validation.data;
        const result = await streamChatWithDeepSeek(messages, config);

        if (!result.success) {
          return NextResponse.json(result);
        }

        // Return a streaming response
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
          async start(controller) {
            try {
              for await (const chunk of result.stream!) {
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ chunk })}\n\n`)
                );
              }
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`)
              );
            } catch (error) {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    error:
                      error instanceof Error ? error.message : "Stream error",
                  })}\n\n`
                )
              );
            } finally {
              controller.close();
            }
          },
        });

        return new Response(stream, {
          headers: {
            "Content-Type": "text/stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
          },
        });
      }

      case "generate-object": {
        const validation = ObjectGenerationSchema.safeParse(data);
        if (!validation.success) {
          return NextResponse.json(
            {
              success: false,
              error: "Invalid request data",
              details: validation.error.issues,
            },
            { status: 400 }
          );
        }

        const { prompt, schema, config } = validation.data;

        // Convert the schema object back to a Zod schema
        // This is a simple example - you might need more sophisticated schema handling
        let zodSchema;
        try {
          zodSchema = z.object(schema);
        } catch (error) {
          return NextResponse.json(
            {
              success: false,
              error: "Invalid schema format",
            },
            { status: 400 }
          );
        }

        const result = await generateDeepSeekObject(prompt, zodSchema, config);

        return NextResponse.json(result);
      }

      default:
        return NextResponse.json(
          {
            success: false,
            error:
              "Invalid action. Supported actions: generate-text, stream-text, chat, stream-chat, generate-object",
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("DeepSeek API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}

// GET handler to return available models and configuration options
export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      models: Object.values(DEEPSEEK_MODELS),
      actions: [
        "generate-text",
        "stream-text",
        "chat",
        "stream-chat",
        "generate-object",
      ],
      configOptions: {
        temperature: { min: 0, max: 2, default: 0.7 },
        maxTokens: { min: 1, max: 4096, default: 2048 },
        topP: { min: 0, max: 1, default: 1 },
        frequencyPenalty: { min: -2, max: 2, default: 0 },
        presencePenalty: { min: -2, max: 2, default: 0 },
      },
    },
  });
}
