import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { getBrevoClient, SendSmtpEmail } from "@/lib/brevo";
import { otpEmailTemplate } from "@/lib/email-templates";
import { env } from "@/lib/env";
import { v4 as uuidv4 } from "uuid";

const passwordLoginSchema = z.object({
  identifier: z.string().min(1, "Username or email is required"), // Can be username or email
  password: z.string().min(1, "Password is required"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = passwordLoginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          status: "error",
          message: validation.error.errors.map((e) => e.message).join(", "),
        },
        { status: 400 }
      );
    }

    const { identifier, password } = validation.data;
    const normalizedIdentifier = identifier.toLowerCase().trim();

    // Find user by email or username
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: normalizedIdentifier },
          { username: normalizedIdentifier },
        ],
      },
      include: {
        accounts: {
          where: {
            providerId: "credential",
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          status: "error",
          message: "Invalid username/email or password.",
        },
        { status: 401 }
      );
    }

    // Check if user has a credential account with password
    const credentialAccount = user.accounts.find(
      (acc) => acc.providerId === "credential" && acc.password
    );

    if (!credentialAccount || !credentialAccount.password) {
      return NextResponse.json(
        {
          status: "error",
          message: "Password login not available for this account. Please use email OTP login.",
        },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(
      password,
      credentialAccount.password
    );

    if (!isPasswordValid) {
      return NextResponse.json(
        {
          status: "error",
          message: "Invalid username/email or password.",
        },
        { status: 401 }
      );
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store login data in verification table
    const loginData = {
      userId: user.id,
      email: user.email,
      otp,
    };

    // Delete any existing verification for this email
    await prisma.verification.deleteMany({
      where: { identifier: user.email },
    });

    // Create new verification record (expires in 10 minutes)
    await prisma.verification.create({
      data: {
        id: uuidv4(),
        identifier: user.email,
        value: JSON.stringify(loginData),
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Send OTP email
    if (!env.BREVO_API_KEY) {
      console.log(`[DEV] OTP for ${user.email}: ${otp}`);
      return NextResponse.json({
        status: "success",
        message: "OTP sent successfully (check console in dev mode)",
        email: user.email,
      });
    }

    try {
      const brevoClient = getBrevoClient();
      const sendSmtpEmail = new SendSmtpEmail();

      const senderEmail = env.BREVO_SENDER_EMAIL;
      const senderName = env.BREVO_SENDER_NAME || "KnowledgeShare";

      if (!senderEmail) {
        throw new Error("BREVO_SENDER_EMAIL is required");
      }

      sendSmtpEmail.subject = "Your KnowledgeShare login code";
      sendSmtpEmail.htmlContent = otpEmailTemplate({ otp });
      sendSmtpEmail.sender = { name: senderName, email: senderEmail };
      sendSmtpEmail.to = [{ email: user.email }];

      await brevoClient.sendTransacEmail(sendSmtpEmail);

      return NextResponse.json({
        status: "success",
        message: "Verification code sent to your email",
        email: user.email,
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
    console.error("Password login send OTP error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}

