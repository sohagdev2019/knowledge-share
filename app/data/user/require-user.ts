import "server-only";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

type BaseSessionUser = Awaited<
  ReturnType<typeof auth.api.getSession>
> extends { user: infer U }
  ? U
  : never;

type SessionUser = BaseSessionUser & {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string | null;
  designation?: string | null;
  bio?: string | null;
};

export const requireUser = cache(async (): Promise<SessionUser> => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return redirect("/login");
  }

  return session.user as SessionUser;
});
