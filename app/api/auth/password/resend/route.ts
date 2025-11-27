import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getBrevoClient, SendSmtpEmail } from "@/lib/brevo";
import { env } from "@/lib/env";
import { otpEmailTemplate } from "@/lib/email-templates";

const resendSchema = z.object({
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = resendSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          status: "error",
          message: validation.error.errors.map((e) => e.message).join(", "),
        },
        { status: 400 }
      );
    }

    const normalizedEmail = validation.data.email.toLowerCase().trim();

    const verification = await prisma.verification.findFirst({
      where: {
        identifier: normalizedEmail,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!verification) {
      return NextResponse.json(
        {
          status: "error",
          message: "No active verification request found. Please restart the login process.",
        },
        { status: 400 }
      );
    }

    let loginData: {
      userId: string;
      email: string;
      otp: string;
      type?: string;
    };

    try {
      loginData = JSON.parse(verification.value);
    } catch {
      return NextResponse.json(
        {
          status: "error",
          message: "Corrupted verification data. Please restart the login process.",
        },
        { status: 400 }
      );
    }

    if (loginData.email !== normalizedEmail) {
      return NextResponse.json(
        {
          status: "error",
          message: "Email mismatch detected. Please restart the login process.",
        },
        { status: 400 }
      );
    }

    if (loginData.type && loginData.type !== "password-login") {
      return NextResponse.json(
        {
          status: "error",
          message: "This verification request does not support password OTP resend.",
        },
        { status: 400 }
      );
    }

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
          message: "User no longer exists. Please restart the login process.",
        },
        { status: 404 }
      );
    }

    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();

    await prisma.verification.update({
      where: { id: verification.id },
      data: {
        value: JSON.stringify({
          userId: loginData.userId,
          email: loginData.email,
          otp: newOtp,
          type: "password-login",
        }),
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        updatedAt: new Date(),
      },
    });

    if (!env.BREVO_API_KEY) {
      console.log(`[DEV] Resent OTP for ${normalizedEmail}: ${newOtp}`);
      return NextResponse.json({
        status: "success",
        message: "New OTP generated. Check server logs for the code (development mode).",
      });
    }

    const brevoClient = getBrevoClient();
    const sendSmtpEmail = new SendSmtpEmail();

    const senderEmail = env.BREVO_SENDER_EMAIL;
    const senderName = env.BREVO_SENDER_NAME || "KnowledgeShare";

    if (!senderEmail) {
      throw new Error("BREVO_SENDER_EMAIL is required. Please configure the sender email.");
    }

    sendSmtpEmail.subject = "Your KnowledgeShare login code";
    sendSmtpEmail.htmlContent = otpEmailTemplate({ otp: newOtp });
    sendSmtpEmail.sender = { name: senderName, email: senderEmail };
    sendSmtpEmail.to = [{ email: normalizedEmail }];

    await brevoClient.sendTransacEmail(sendSmtpEmail);

    return NextResponse.json({
      status: "success",
      message: "A new verification code has been sent to your email.",
    });
  } catch (error) {
    console.error("Password OTP resend error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to resend verification code.";

    return NextResponse.json(
      {
        status: "error",
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}

