import "server-only";

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { cache } from "react";

export const requireAdmin = cache(async () => {
  const session = await auth();

  if (!session?.user) {
    return redirect("/login");
  }

  const userRole = (session.user as any).role;
  
  // Allow both admin and superadmin to access admin routes
  if (userRole !== "admin" && userRole !== "superadmin") {
    return redirect("/not-admin");
  }

  return session;
});
