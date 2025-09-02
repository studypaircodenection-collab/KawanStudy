import { NextRequest, NextResponse } from "next/server";
import { feedbackSchema } from "@/lib/validations/feedback";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate the feedback data
    const validatedData = feedbackSchema.parse(body);

    // Here you would typically:
    // 1. Save to database
    // 2. Send email notification
    // 3. Create ticket in support system
    // 4. Log to monitoring service

    // For now, we'll just log it and simulate processing
    console.log("Feedback received:", {
      ...validatedData,
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get("user-agent"),
      ip:
        request.headers.get("x-forwarded-for") ||
        request.headers.get("x-real-ip"),
    });

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 500));

    // In a real implementation, you might want to:
    // - Store in Supabase
    // - Send email via Resend or similar service
    // - Create Slack notification
    // - Log to external monitoring service

    return NextResponse.json(
      {
        success: true,
        message: "Feedback submitted successfully",
        id: `feedback_${Date.now()}`, // In real app, this would be a proper ID
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing feedback:", error);

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid feedback data",
          errors: error,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}

// Optional: Handle GET requests to retrieve feedback (for admin panel)
export async function GET() {
  try {
    // This would typically require authentication and authorization
    // For now, just return a placeholder response
    return NextResponse.json(
      {
        message: "Feedback API is working",
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in feedback GET endpoint:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
