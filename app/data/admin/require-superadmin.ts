import "server-only";

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { cache } from "react";

export const requireSuperAdmin = cache(async () => {
  const session = await auth();

  if (!session?.user) {
    return redirect("/login");
  }

  if ((session.user as { role?: string }).role !== "superadmin") {
    return redirect("/not-admin");
  }

  return session;
});
