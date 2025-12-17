import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { getBrevoClient, SendSmtpEmail } from "@/lib/brevo";
import { otpEmailTemplate } from "@/lib/email-templates";
import { env } from "@/lib/env";
import { v4 as uuidv4 } from "uuid";

const sendOtpSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["user", "teacher"]).optional().default("user"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = sendOtpSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          status: "error",
          message: validation.error.errors.map((e) => e.message).join(", "),
        },
        { status: 400 }
      );
    }

    const { firstName, lastName, username, email, password, role } = validation.data;
    const normalizedEmail = email.toLowerCase().trim();
    const normalizedUsername = username.toLowerCase().trim();
    const userRole = role || "user"; // Default to "user" (student)

    // Check if email already exists
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUserByEmail) {
      return NextResponse.json(
        {
          status: "error",
          message: "Email already exists. Please use a different email address.",
        },
        { status: 400 }
      );
    }

    // Check if username already exists
    const existingUserByUsername = await prisma.user.findUnique({
      where: { username: normalizedUsername },
    });

    if (existingUserByUsername) {
      return NextResponse.json(
        {
          status: "error",
          message: "Username already exists. Please choose a different username.",
        },
        { status: 400 }
      );
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store registration data in verification table
    const registrationData = {
      firstName,
      lastName,
      username: normalizedUsername,
      email: normalizedEmail,
      password, // Will be hashed during verification
      otp,
      role: userRole,
    };

    // Delete any existing verification for this email
    await prisma.verification.deleteMany({
      where: { identifier: normalizedEmail },
    });

    // Create new verification record (expires in 10 minutes)
    await prisma.verification.create({
      data: {
        id: uuidv4(),
        identifier: normalizedEmail,
        value: JSON.stringify(registrationData),
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Send OTP email
    if (!env.BREVO_API_KEY) {
      console.log(`[DEV] OTP for ${normalizedEmail}: ${otp}`);
      return NextResponse.json({
        status: "success",
        message: "OTP sent successfully (check console in dev mode)",
      });
    }

    try {
      const brevoClient = getBrevoClient();
      const sendSmtpEmail = new SendSmtpEmail();

      const senderEmail = env.BREVO_SENDER_EMAIL;
      const senderName = env.BREVO_SENDER_NAME || "Edupeak";

      if (!senderEmail) {
        throw new Error("BREVO_SENDER_EMAIL is required");
      }

      const accountType = userRole === "teacher" ? "Teacher" : "Student";
      sendSmtpEmail.subject = `Verify your ${accountType} Registration - Edupeak`;
      sendSmtpEmail.htmlContent = otpEmailTemplate({ otp });
      sendSmtpEmail.sender = { name: senderName, email: senderEmail };
      sendSmtpEmail.to = [{ email: normalizedEmail }];

      await brevoClient.sendTransacEmail(sendSmtpEmail);

      return NextResponse.json({
        status: "success",
        message: "Verification code sent to your email",
      });
    } catch (error: any) {
      console.error("Failed to send email:", error);
      return NextResponse.json(
        {
          status: "error",
          message: "Failed to send verification email. Please try again.",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}

