import "server-only";

import { auth } from "@/lib/auth";
import { cache } from "react";

export const getUserRole = cache(async (): Promise<string | null> => {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  return (session.user as { role?: string }).role || null;
});
