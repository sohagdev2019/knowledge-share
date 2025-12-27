"use server";

import { requireAdmin } from "@/app/data/admin/require-admin";
import { prisma } from "@/lib/db";
import { ApiResponse } from "@/lib/types";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import slugify from "slugify";

const subscriptionPlanSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  planType: z.enum(["Personal", "Team", "Enterprise"]),
  priceMonthly: z
    .union([z.coerce.number().min(0), z.literal(""), z.null()])
    .transform((val) => (val === "" ? null : val))
    .nullable()
    .optional(),
  priceYearly: z
    .union([z.coerce.number().min(0), z.literal(""), z.null()])
    .transform((val) => (val === "" ? null : val))
    .nullable()
    .optional(),
  stripePriceIdMonthly: z.string().optional(),
  stripePriceIdYearly: z.string().optional(),
  isActive: z.boolean(),
  isPopular: z.boolean(),
  trialDays: z.coerce.number().min(0).default(0),
  maxCourseAccess: z
    .union([z.coerce.number().min(1), z.literal(""), z.null()])
    .transform((val) => (val === "" || val === null ? null : val))
    .nullable(),
  allowsDownloads: z.boolean(),
  allowsCertificates: z.boolean(),
  allowsLiveClasses: z.boolean(),
  maxLiveQASessions: z
    .union([z.coerce.number().min(1), z.literal(""), z.null()])
    .transform((val) => (val === "" || val === null ? null : val))
    .nullable(),
  allowsTeamAccess: z.boolean(),
  teamSeats: z.coerce.number().min(1).default(1),
  allowsTeamManagement: z.boolean(),
  prioritySupport: z.boolean(),
  maxPrioritySupportTickets: z
    .union([z.coerce.number().min(1), z.literal(""), z.null()])
    .transform((val) => (val === "" || val === null ? null : val))
    .nullable(),
  allowsProgressTracking: z.boolean(),
  allowsCommunitySupport: z.boolean(),
  featureList: z.array(z.string()).optional().default([]),
}).refine(
  (data) => {
    // Enterprise plans don't need prices
    if (data.planType === "Enterprise") {
      return true;
    }
    // For Personal and Team plans, at least one price must be provided
    return data.priceMonthly !== null && data.priceMonthly !== undefined && data.priceMonthly > 0 ||
           data.priceYearly !== null && data.priceYearly !== undefined && data.priceYearly > 0;
  },
  {
    message: "At least one price (monthly or yearly) is required for Personal and Team plans",
    path: ["priceMonthly"],
  }
);

export async function createSubscriptionPlan(
  data: z.infer<typeof subscriptionPlanSchema>
): Promise<ApiResponse> {
  await requireAdmin();

  try {
    const validation = subscriptionPlanSchema.safeParse(data);

    if (!validation.success) {
      return {
        status: "error",
        message: `Invalid data: ${validation.error.errors.map((e) => e.message).join(", ")}`,
      };
    }

    // Generate slug if not provided
    const slug = validation.data.slug || slugify(validation.data.name, { lower: true });

    // Check if slug already exists
    const existingPlan = await prisma.subscriptionPlan.findUnique({
      where: { slug },
    });

    if (existingPlan) {
      return {
        status: "error",
        message: "A plan with this slug already exists",
      };
    }

    await prisma.subscriptionPlan.create({
      data: {
        name: validation.data.name,
        slug: slug,
        description: validation.data.description || null,
        planType: validation.data.planType,
        priceMonthly: validation.data.priceMonthly,
        priceYearly: validation.data.priceYearly,
        stripePriceIdMonthly: validation.data.stripePriceIdMonthly || null,
        stripePriceIdYearly: validation.data.stripePriceIdYearly || null,
        features: validation.data.featureList && validation.data.featureList.length > 0
          ? { list: validation.data.featureList.filter(f => f.trim() !== "") }
          : null,
        isActive: validation.data.isActive,
        isPopular: validation.data.isPopular,
        trialDays: validation.data.trialDays,
        maxCourseAccess: validation.data.maxCourseAccess,
        allowsDownloads: validation.data.allowsDownloads,
        allowsCertificates: validation.data.allowsCertificates,
        allowsLiveClasses: validation.data.allowsLiveClasses,
        maxLiveQASessions: validation.data.maxLiveQASessions,
        allowsTeamAccess: validation.data.allowsTeamAccess,
        teamSeats: validation.data.teamSeats,
        allowsTeamManagement: validation.data.allowsTeamManagement,
        prioritySupport: validation.data.prioritySupport,
        maxPrioritySupportTickets: validation.data.maxPrioritySupportTickets,
        allowsProgressTracking: validation.data.allowsProgressTracking,
        allowsCommunitySupport: validation.data.allowsCommunitySupport,
      },
    });

    revalidatePath("/superadmin/subscription-plans");
    revalidatePath("/pricing");

    return {
      status: "success",
      message: "Subscription plan created successfully",
    };
  } catch (error) {
    console.error("Failed to create subscription plan:", error);
    return {
      status: "error",
      message: "Failed to create subscription plan",
    };
  }
}

export async function updateSubscriptionPlan(
  id: string,
  data: z.infer<typeof subscriptionPlanSchema>
): Promise<ApiResponse> {
  await requireAdmin();

  try {
    const validation = subscriptionPlanSchema.safeParse(data);

    if (!validation.success) {
      return {
        status: "error",
        message: `Invalid data: ${validation.error.errors.map((e) => e.message).join(", ")}`,
      };
    }

    // Check if plan exists
    const existingPlan = await prisma.subscriptionPlan.findUnique({
      where: { id },
    });

    if (!existingPlan) {
      return {
        status: "error",
        message: "Subscription plan not found",
      };
    }

    // Check if slug is being changed and if new slug already exists
    const slug = validation.data.slug || slugify(validation.data.name, { lower: true });
    if (slug !== existingPlan.slug) {
      const slugExists = await prisma.subscriptionPlan.findUnique({
        where: { slug },
      });

      if (slugExists) {
        return {
          status: "error",
          message: "A plan with this slug already exists",
        };
      }
    }

    await prisma.subscriptionPlan.update({
      where: { id },
      data: {
        name: validation.data.name,
        slug: slug,
        description: validation.data.description || null,
        planType: validation.data.planType,
        priceMonthly: validation.data.priceMonthly,
        priceYearly: validation.data.priceYearly,
        stripePriceIdMonthly: validation.data.stripePriceIdMonthly || null,
        stripePriceIdYearly: validation.data.stripePriceIdYearly || null,
        features: validation.data.featureList && validation.data.featureList.length > 0
          ? { list: validation.data.featureList.filter(f => f.trim() !== "") }
          : null,
        isActive: validation.data.isActive,
        isPopular: validation.data.isPopular,
        trialDays: validation.data.trialDays,
        maxCourseAccess: validation.data.maxCourseAccess,
        allowsDownloads: validation.data.allowsDownloads,
        allowsCertificates: validation.data.allowsCertificates,
        allowsLiveClasses: validation.data.allowsLiveClasses,
        maxLiveQASessions: validation.data.maxLiveQASessions,
        allowsTeamAccess: validation.data.allowsTeamAccess,
        teamSeats: validation.data.teamSeats,
        allowsTeamManagement: validation.data.allowsTeamManagement,
        prioritySupport: validation.data.prioritySupport,
        maxPrioritySupportTickets: validation.data.maxPrioritySupportTickets,
        allowsProgressTracking: validation.data.allowsProgressTracking,
        allowsCommunitySupport: validation.data.allowsCommunitySupport,
      },
    });

    revalidatePath("/superadmin/subscription-plans");
    revalidatePath("/pricing");

    return {
      status: "success",
      message: "Subscription plan updated successfully",
    };
  } catch (error) {
    console.error("Failed to update subscription plan:", error);
    return {
      status: "error",
      message: "Failed to update subscription plan",
    };
  }
}

export async function deleteSubscriptionPlan(id: string): Promise<ApiResponse> {
  await requireAdmin();

  try {
    // Check if plan has active subscriptions
    const activeSubscriptions = await prisma.userSubscription.count({
      where: {
        planId: id,
        status: {
          in: ["Active", "Trial"],
        },
      },
    });

    if (activeSubscriptions > 0) {
      return {
        status: "error",
        message: `Cannot delete plan. There are ${activeSubscriptions} active subscription(s) using this plan.`,
      };
    }

    await prisma.subscriptionPlan.delete({
      where: { id },
    });

    revalidatePath("/superadmin/subscription-plans");
    revalidatePath("/pricing");

    return {
      status: "success",
      message: "Subscription plan deleted successfully",
    };
  } catch (error) {
    console.error("Failed to delete subscription plan:", error);
    return {
      status: "error",
      message: "Failed to delete subscription plan",
    };
  }
}

