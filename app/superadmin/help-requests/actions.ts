"use server";

import { requireSuperAdmin } from "@/app/data/admin/require-superadmin";
import { ApiResponse } from "@/lib/types";
import { prisma } from "@/lib/db";
import { z } from "zod";

const updateHelpRequestSchema = z.object({
  requestId: z.string().uuid(),
  status: z.enum(["Pending", "InProgress", "Resolved", "Closed"]),
  response: z.string().max(5000, "Response must be at most 5000 characters").optional(),
});

export async function updateHelpRequest(
  data: z.infer<typeof updateHelpRequestSchema>
): Promise<ApiResponse> {
  await requireSuperAdmin();
  
  try {
    const validation = updateHelpRequestSchema.safeParse(data);
    if (!validation.success) {
      return {
        status: "error",
        message: validation.error.errors[0]?.message || "Invalid form data",
      };
    }

    const updateData: any = {
      status: validation.data.status,
    };

    // Only update response and respondedAt if response is provided
    if (validation.data.response !== undefined) {
      updateData.response = validation.data.response || null;
      updateData.respondedAt = validation.data.response ? new Date() : null;
    }

    await prisma.helpRequest.update({
      where: {
        id: validation.data.requestId,
      },
      data: updateData,
    });

    return {
      status: "success",
      message: "Help request updated successfully",
    };
  } catch (error) {
    console.error("Error updating help request:", error);
    return {
      status: "error",
      message: "An unexpected error occurred. Please try again later.",
    };
  }
}


