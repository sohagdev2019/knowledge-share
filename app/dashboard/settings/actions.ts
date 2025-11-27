"use server";

import { requireUser } from "@/app/data/user/require-user";
import { prisma } from "@/lib/db";
import { Prisma } from "@/lib/generated/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export type ProfileFormState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

const profileSchema = z.object({
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters.")
    .max(50, "First name must be 50 characters or fewer."),
  lastName: z
    .string()
    .max(50, "Last name must be 50 characters or fewer.")
    .optional()
    .or(z.literal("")),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters.")
    .max(32, "Username must be 32 characters or fewer.")
    .regex(
      /^[a-zA-Z0-9._-]+$/,
      "Username can only include letters, numbers, dots, underscores, and hyphens."
    ),
  phoneNumber: z
    .string()
    .max(30, "Phone number must be 30 characters or fewer.")
    .optional()
    .or(z.literal("")),
  designation: z
    .string()
    .max(100, "Designation must be 100 characters or fewer.")
    .optional()
    .or(z.literal("")),
  bio: z
    .string()
    .max(600, "Bio must be 600 characters or fewer.")
    .optional()
    .or(z.literal("")),
});

export async function updateProfileAction(
  _prevState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const user = await requireUser();

  const submission = {
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    username: formData.get("username"),
    phoneNumber: formData.get("phoneNumber"),
    designation: formData.get("designation"),
    bio: formData.get("bio"),
  };

  const parsed = profileSchema.safeParse(submission);

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid form values.",
    };
  }

  const data = parsed.data;

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        firstName: data.firstName.trim(),
        lastName: data.lastName?.trim() ? data.lastName.trim() : null,
        username: data.username.trim().toLowerCase(),
        phoneNumber: data.phoneNumber?.trim() ? data.phoneNumber.trim() : null,
        designation: data.designation?.trim() ? data.designation.trim() : null,
        bio: data.bio?.trim() ? data.bio.trim() : null,
        updatedAt: new Date(),
      },
    });

    revalidatePath("/dashboard/settings");
    revalidatePath("/dashboard/profile");

    return {
      status: "success",
      message: "Profile updated successfully.",
    };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        status: "error",
        message:
          "That username is already taken. Please choose a different username.",
      };
    }

    console.error("Failed to update profile", error);
    return {
      status: "error",
      message: "Failed to update profile. Please try again.",
    };
  }
}

