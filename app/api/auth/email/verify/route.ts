import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const verifyEmailOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6, "OTP must be 6 digits"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = verifyEmailOtpSchema.safeParse(body);

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

    // Parse verification data
    let verificationData: {
      userId?: string;
      email: string;
      otp: string;
      type?: string;
    };

    try {
      verificationData = JSON.parse(verification.value);
    } catch {
      return NextResponse.json(
        {
          status: "error",
          message: "Invalid verification data. Please try again.",
        },
        { status: 400 }
      );
    }

    // Verify OTP
    if (verificationData.otp !== otp) {
      return NextResponse.json(
        {
          status: "error",
          message: "Invalid verification code. Please check and try again.",
        },
        { status: 400 }
      );
    }

    // Verify email matches
    if (verificationData.email !== normalizedEmail) {
      return NextResponse.json(
        {
          status: "error",
          message: "Email mismatch. Please use the same email.",
        },
        { status: 400 }
      );
    }

    // Get or create user
    let user = await prisma.user.findFirst({
      where: { email: normalizedEmail },
    });

    if (!user) {
      // Create new user for email OTP login
      user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          firstName: normalizedEmail.split("@")[0],
          username: normalizedEmail.split("@")[0] + Math.random().toString(36).substring(7),
          role: "USER",
        },
      });
    }

    // Delete verification record
    await prisma.verification.delete({
      where: { id: verification.id },
    });

    // Create a session token for NextAuth sign-in
    const sessionToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    
    // Store session token
    await prisma.verification.create({
      data: {
        id: sessionToken,
        identifier: user.email,
        value: JSON.stringify({ 
          userId: user.id, 
          email: user.email,
          type: "session-token",
          verified: true 
        }),
        expiresAt: expiresAt,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      status: "success",
      message: "Email verified successfully. Signing you in...",
      email: user.email,
      sessionToken: sessionToken,
    });
  } catch (error) {
    console.error("Verify email OTP error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        status: "error",
        message: `Failed to verify OTP: ${errorMessage}`,
      },
      { status: 500 }
    );
  }
}
