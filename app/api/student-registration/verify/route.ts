import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

const verifyOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6, "OTP must be 6 digits"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = verifyOtpSchema.safeParse(body);

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

    // Parse registration data
    let registrationData: {
      firstName: string;
      lastName: string;
      username: string;
      email: string;
      password: string;
      otp: string;
    };

    try {
      registrationData = JSON.parse(verification.value);
    } catch {
      return NextResponse.json(
        {
          status: "error",
          message: "Invalid verification data. Please try registering again.",
        },
        { status: 400 }
      );
    }

    // Verify OTP
    if (registrationData.otp !== otp) {
      return NextResponse.json(
        {
          status: "error",
          message: "Invalid verification code. Please check and try again.",
        },
        { status: 400 }
      );
    }

    // Double-check email matches
    if (registrationData.email !== normalizedEmail) {
      return NextResponse.json(
        {
          status: "error",
          message: "Email mismatch. Please use the same email you registered with.",
        },
        { status: 400 }
      );
    }

    // Check if user already exists (race condition check)
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      // Delete verification record
      await prisma.verification.delete({
        where: { id: verification.id },
      });
      return NextResponse.json(
        {
          status: "error",
          message: "Account already exists. Please login instead.",
        },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registrationData.password, 10);

    // Create user with user role (student)
    const userId = uuidv4();
    const normalizedFirstName = registrationData.firstName.trim();
    const normalizedLastName = registrationData.lastName.trim();

    await prisma.$transaction(async (tx) => {
      // Create user with user role (not admin)
      await tx.user.create({
        data: {
          id: userId,
          firstName: normalizedFirstName,
          lastName: normalizedLastName.length ? normalizedLastName : null,
          email: normalizedEmail,
          username: registrationData.username,
          emailVerified: true, // Auto-verified via OTP
          createdAt: new Date(),
          updatedAt: new Date(),
          role: "user", // Student role
        },
      });

      // Create account with username and password
      await tx.account.create({
        data: {
          id: uuidv4(),
          accountId: registrationData.username,
          providerId: "credential",
          userId: userId,
          password: hashedPassword,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      // Delete verification record
      await tx.verification.delete({
        where: { id: verification.id },
      });
    });

    return NextResponse.json({
      status: "success",
      message: "Student account created successfully! You can now login.",
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    // Handle unique constraint violations
    if (errorMessage.includes("Unique constraint") || errorMessage.includes("unique")) {
      return NextResponse.json(
        {
          status: "error",
          message: "Username or email already exists. Please choose different credentials.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        status: "error",
        message: `Failed to create account: ${errorMessage}`,
      },
      { status: 500 }
    );
  }
}

