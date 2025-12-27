"use server";

import { requireAdmin } from "@/app/data/admin/require-admin";
import { canCreateCourse } from "@/lib/teacher-plan-limits";
import arcjet, { fixedWindow } from "@/lib/arcjet";

import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { stripe } from "@/lib/stripe";
import { ApiResponse } from "@/lib/types";
import { courseSchema, CourseSchemaType } from "@/lib/zodSchemas";
import { request } from "@arcjet/next";

const aj = arcjet.withRule(
  fixedWindow({
    mode: "LIVE",
    window: "1m",
    max: 5,
  })
);

export async function CreateCourse(
  values: CourseSchemaType
): Promise<ApiResponse> {
  const session = await requireAdmin();

  try {
    const req = await request();
    const decision = await aj.protect(req, {
      fingerprint: session.user.id,
    });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return {
          status: "error",
          message: "You have been blocked due to rate limiting",
        };
      } else {
        return {
          status: "error",
          message: "You are a bot! if this is a mistake contact our support",
        };
      }
    }

    const validation = courseSchema.safeParse(values);

    if (!validation.success) {
      console.error("Validation failed:", validation.error.errors);
      return {
        status: "error",
        message: `Invalid Form Data: ${validation.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ")}`,
      };
    }

    // Check course limit for teacher plans
    const courseLimitCheck = await canCreateCourse();
    if (!courseLimitCheck.allowed) {
      return {
        status: "error",
        message: courseLimitCheck.reason || "Course limit reached. Please upgrade your plan.",
      };
    }

    // Validate Stripe is configured
    if (!env.STRIPE_SECRET_KEY || env.STRIPE_SECRET_KEY === "sk_test_fake") {
      console.error("Stripe is not properly configured");
      return {
        status: "error",
        message: "Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.",
      };
    }

    // Create Stripe product
    let stripeProduct;
    try {
      stripeProduct = await stripe.products.create({
        name: validation.data.title,
        description: validation.data.smallDescription,
        default_price_data: {
          currency: "usd",
          unit_amount: Math.round(validation.data.price * 100), // Convert to cents
        },
      });
    } catch (stripeError) {
      console.error("Stripe API error:", stripeError);
      const stripeMessage = stripeError instanceof Error ? stripeError.message : "Unknown Stripe error";
      return {
        status: "error",
        message: `Failed to create Stripe product: ${stripeMessage}`,
      };
    }

    if (!stripeProduct.default_price) {
      console.error("Stripe product created but no default price returned");
      return {
        status: "error",
        message: "Failed to create Stripe product price",
      };
    }

    // Create course in database
    await prisma.course.create({
      data: {
        title: validation.data.title,
        description: validation.data.description,
        fileKey: validation.data.fileKey,
        price: Math.round(validation.data.price * 100), // Store in cents
        duration: Math.round(validation.data.duration),
        level: validation.data.level,
        category: validation.data.category,
        smallDescription: validation.data.smallDescription,
        slug: validation.data.slug,
        status: validation.data.status,
        availableInSubscription: validation.data.availableInSubscription,
        userId: session.user.id,
        stripePriceId: typeof stripeProduct.default_price === "string" 
          ? stripeProduct.default_price 
          : stripeProduct.default_price.id,
      },
    });

    return {
      status: "success",
      message: "Course created succesfully",
    };
  } catch (error) {
    console.error("Failed to create course:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return {
      status: "error",
      message: `Failed to create course: ${errorMessage}`,
    };
  }
}
