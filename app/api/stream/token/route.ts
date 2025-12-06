import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { StreamClient } from "getstream";
import { env } from "@/lib/env";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check environment variables directly for debugging
    // Support both STREAM_SECRET_KEY and STREAM_API_SECRET for compatibility
    const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
    const secretKey = process.env.STREAM_SECRET_KEY || process.env.STREAM_API_SECRET;
    
    console.log("Stream.io env check:", {
      hasApiKey: !!apiKey,
      hasSecretKey: !!secretKey,
      apiKeyLength: apiKey?.length || 0,
      secretKeyLength: secretKey?.length || 0,
      apiKeyPrefix: apiKey?.substring(0, 10) || "none",
    });

    if (!apiKey || !secretKey) {
      return NextResponse.json(
        { 
          error: "Stream.io not configured",
          message: "Please set NEXT_PUBLIC_STREAM_API_KEY and STREAM_SECRET_KEY environment variables",
          debug: {
            hasApiKey: !!apiKey,
            hasSecretKey: !!secretKey,
            note: "Make sure to restart your dev server after adding env variables"
          }
        },
        { status: 500 }
      );
    }

    const streamClient = new StreamClient(
      apiKey,
      secretKey
    );

    // generateUserToken expects an object with user_id property, not a string
    const token = streamClient.generateUserToken({ user_id: session.user.id });

    return NextResponse.json({ token });
  } catch (error) {
    console.error("Error generating Stream token:", error);
    return NextResponse.json(
      { error: "Failed to generate token" },
      { status: 500 }
    );
  }
}

