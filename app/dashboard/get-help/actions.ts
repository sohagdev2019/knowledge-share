"use server";

import { requireUser } from "@/app/data/user/require-user";
import { ApiResponse } from "@/lib/types";
import { prisma } from "@/lib/db";
import { z } from "zod";
import arcjet, { fixedWindow } from "@/lib/arcjet";
import { request } from "@arcjet/next";

const aj = arcjet.withRule(
  fixedWindow({
    mode: "LIVE",
    window: "1m",
    max: 3,
  })
);

const helpRequestSchema = z.object({
  subject: z.string().min(3, "Subject must be at least 3 characters").max(200, "Subject must be at most 200 characters"),
  message: z.string().min(10, "Message must be at least 10 characters").max(5000, "Message must be at most 5000 characters"),
});

export async function submitHelpRequest(
  data: z.infer<typeof helpRequestSchema>
): Promise<ApiResponse> {
  const user = await requireUser();
  
  try {
    const req = await request();
    const decision = await aj.protect(req, {
      fingerprint: user.id,
    });

    if (decision.isDenied()) {
      return {
        status: "error",
        message: "Too many requests. Please wait a moment before submitting again.",
      };
    }

    const validation = helpRequestSchema.safeParse(data);
    if (!validation.success) {
      return {
        status: "error",
        message: validation.error.errors[0]?.message || "Invalid form data",
      };
    }

    // Determine user type: Teacher (has courses), Admin (role is admin/superadmin), or Student (default)
    const userRole = user.role;
    let userType: "Teacher" | "Student" | "Admin" = "Student";

    if (userRole === "admin" || userRole === "superadmin") {
      userType = "Admin";
    } else {
      // Check if user has created any courses (teacher)
      const courseCount = await prisma.course.count({
        where: { userId: user.id },
      });

      if (courseCount > 0) {
        userType = "Teacher";
      }
    }

    await prisma.helpRequest.create({
      data: {
        userId: user.id,
        subject: validation.data.subject,
        message: validation.data.message,
        userType: userType,
        status: "Pending",
      },
    });

    return {
      status: "success",
      message: "Your help request has been submitted successfully. We'll get back to you soon!",
    };
  } catch (error) {
    console.error("Error submitting help request:", error);
    return {
      status: "error",
      message: "An unexpected error occurred. Please try again later.",
    };
  }
}


