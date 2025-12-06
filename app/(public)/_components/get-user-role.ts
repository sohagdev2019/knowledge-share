"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function getUserRole(): Promise<string | null> {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  return dbUser?.role ?? null;
}

