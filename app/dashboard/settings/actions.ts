 "use server";

import { requireUser } from "@/app/data/user/require-user";
import { prisma } from "@/lib/db";
import { Prisma } from "@/lib/generated/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export type PasswordFormState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

const passwordSchema = z
  .object({
    currentPassword: z.string().min(6, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters.")
      .max(64, "New password must be 64 characters or fewer."),
    confirmPassword: z.string().min(8, "Please confirm your new password."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords do not match.",
    path: ["confirmPassword"],
  })
  .refine(
    (data) => data.newPassword !== data.currentPassword,
    {
      message: "New password must be different from current password.",
      path: ["newPassword"],
    }
  );

export async function updatePasswordAction(
  _prev: PasswordFormState,
  formData: FormData
): Promise<PasswordFormState> {
  const user = await requireUser();

  const submission = {
    currentPassword: formData.get("currentPassword")?.toString() ?? "",
    newPassword: formData.get("newPassword")?.toString() ?? "",
    confirmPassword: formData.get("confirmPassword")?.toString() ?? "",
  };

  const parsed = passwordSchema.safeParse(submission);

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid password data.",
    };
  }

  try {
    const credentialAccount = await prisma.account.findFirst({
      where: {
        userId: user.id,
        providerId: "credential",
      },
    });

    if (!credentialAccount || !credentialAccount.password) {
      return {
        status: "error",
        message: "Password-based login is not enabled for this account.",
      };
    }

    const isCurrentValid = await bcrypt.compare(
      parsed.data.currentPassword,
      credentialAccount.password
    );

    if (!isCurrentValid) {
      return {
        status: "error",
        message: "Current password is incorrect.",
      };
    }

    const hashedPassword = await bcrypt.hash(parsed.data.newPassword, 12);

    await prisma.account.update({
      where: { id: credentialAccount.id },
      data: {
        password: hashedPassword,
        updatedAt: new Date(),
      },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { updatedAt: new Date() },
    });

    revalidatePath("/dashboard/settings");

    return {
      status: "success",
      message: "Password updated successfully.",
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return {
        status: "error",
        message: "Database error while updating password.",
      };
    }

    console.error("Password update error:", error);
    return {
      status: "error",
      message: "Failed to update password. Please try again.",
    };
  }
}

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

