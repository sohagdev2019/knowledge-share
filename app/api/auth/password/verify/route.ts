import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { signIn } from "@/lib/auth";

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
    const user = await prisma.user.findFirst({
      where: { id: loginData.userId },
      include: {
        accounts: {
          where: {
            providerId: "credential",
          },
        },
      },
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

    // Get the password from the account for NextAuth signIn
    const credentialAccount = user.accounts.find(
      (acc) => acc.providerId === "credential" && acc.password
    );

    if (!credentialAccount || !credentialAccount.password) {
      await prisma.verification.delete({
        where: { id: verification.id },
      });
      return NextResponse.json(
        {
          status: "error",
          message: "Password account not found.",
        },
        { status: 404 }
      );
    }

    // Delete verification record
    await prisma.verification.delete({
      where: { id: verification.id },
    });

    // Create a temporary session token for NextAuth sign-in
    // This allows the client to complete the sign-in without requiring the password again
    const sessionToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    
    // Store session token in verification table with user info
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

    // Create NextAuth session directly
    try {
      // Use signIn to create session
      // We'll create a special request for this
      const baseUrl = process.env.NEXTAUTH_URL || req.nextUrl.origin;
      const callbackUrl = new URL("/api/auth/callback/credentials", baseUrl);
      
      // Create a form-encoded request body
      const formData = new URLSearchParams();
      formData.append("email", user.email);
      formData.append("password", sessionToken); // Use session token as password
      formData.append("csrfToken", "verified-otp"); // Special marker
      
      // For now, return the session token and let client handle sign-in
      // The client will use a special API route to create the session
      return NextResponse.json({
        status: "success",
        message: "OTP verified successfully. Signing you in...",
        email: user.email,
        sessionToken: sessionToken,
      });
    } catch (error) {
      console.error("Error creating session:", error);
      return NextResponse.json({
        status: "success",
        message: "OTP verified successfully.",
        email: user.email,
        sessionToken: sessionToken,
      });
    }
  } catch (error) {
    console.error("Verify password OTP error:", error);
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
