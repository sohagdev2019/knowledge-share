import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { headers } from "next/headers";
import { randomBytes } from "crypto";
import { serializeSignedCookie } from "better-call";
import { env } from "@/lib/env";

const verifyPasswordOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6, "OTP must be 6 digits"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = verifyPasswordOtpSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          status: "error",
          message: validation.error.errors.map((e) => e.message).join(", "),
        },
        { status: 400 }
      );
    }

    const { email, otp } = validation.data;
    const normalizedEmail = email.toLowerCase().trim();

    // Find verification record
    const verification = await prisma.verification.findFirst({
      where: {
        identifier: normalizedEmail,
        expiresAt: {
          gt: new Date(), // Not expired
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!verification) {
      return NextResponse.json(
        {
          status: "error",
          message: "Invalid or expired verification code. Please request a new one.",
        },
        { status: 400 }
      );
    }

    // Parse login data
    let loginData: {
      userId: string;
      email: string;
      otp: string;
    };

    try {
      loginData = JSON.parse(verification.value);
    } catch {
      return NextResponse.json(
        {
          status: "error",
          message: "Invalid verification data. Please try logging in again.",
        },
        { status: 400 }
      );
    }

    // Verify OTP
    if (loginData.otp !== otp) {
      return NextResponse.json(
        {
          status: "error",
          message: "Invalid verification code. Please check and try again.",
        },
        { status: 400 }
      );
    }

    // Double-check email matches
    if (loginData.email !== normalizedEmail) {
      return NextResponse.json(
        {
          status: "error",
          message: "Email mismatch. Please use the same email you used to login.",
        },
        { status: 400 }
      );
    }

    // Verify user still exists
    const user = await prisma.user.findUnique({
      where: { id: loginData.userId },
    });

    if (!user) {
      await prisma.verification.delete({
        where: { id: verification.id },
      });
      return NextResponse.json(
        {
          status: "error",
          message: "User not found. Please try again.",
        },
        { status: 404 }
      );
    }

    // Create session manually using Better Auth's format
    const headerList = await headers();
    
    // Generate session token (Better Auth uses base64url encoded random bytes)
    const sessionToken = randomBytes(32).toString("base64url");
    
    // Calculate expiration (30 days)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    
    // Get user agent and IP from request
    const userAgent = headerList.get("user-agent") || null;
    const ipAddress = headerList.get("x-forwarded-for") || 
                     headerList.get("x-real-ip") || 
                     null;

    // Create session in database
    await prisma.session.create({
      data: {
        id: sessionToken,
        token: sessionToken,
        userId: loginData.userId,
        expiresAt: expiresAt,
        createdAt: new Date(),
        updatedAt: new Date(),
        userAgent: userAgent,
        ipAddress: ipAddress?.split(",")[0] || null, // Take first IP if multiple
      },
    });

    // Delete verification record
    await prisma.verification.delete({
      where: { id: verification.id },
    });

    // Set session cookie using Better Auth's cookie name
    const response = NextResponse.json({
      status: "success",
      message: "Login successful! Redirecting...",
    });

    const shouldUseSecurePrefix =
      env.BETTER_AUTH_URL?.startsWith("https://") ||
      process.env.NODE_ENV === "production";
    const cookieName = `${
      shouldUseSecurePrefix ? "__Secure-" : ""
    }better-auth.session_token`;
    const signedCookie = await serializeSignedCookie(
      cookieName,
      sessionToken,
      env.BETTER_AUTH_SECRET,
      {
        httpOnly: true,
        secure: shouldUseSecurePrefix,
        sameSite: "lax",
        path: "/",
        maxAge: 30 * 24 * 60 * 60, // 30 days
      }
    );
    response.headers.append("Set-Cookie", signedCookie);

    return response;
  } catch (error) {
    console.error("Verify password OTP error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        status: "error",
        message: `Failed to login: ${errorMessage}`,
      },
      { status: 500 }
    );
  }
}

