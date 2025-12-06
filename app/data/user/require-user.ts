import "server-only";

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { cache } from "react";

type SessionUser = {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  firstName?: string;
  lastName?: string | null;
  username?: string | null;
  phoneNumber?: string | null;
  designation?: string | null;
  bio?: string | null;
  role?: string | null;
};

export const requireUser = cache(async (): Promise<SessionUser> => {
  const session = await auth();

  if (!session?.user) {
    return redirect("/login");
  }

  return {
    id: (session.user as any).id || "",
    email: session.user.email || "",
    name: session.user.name,
    image: session.user.image,
    firstName: (session.user as any).firstName,
    lastName: (session.user as any).lastName,
    username: (session.user as any).username,
    role: (session.user as any).role,
    phoneNumber: null, // These would need to be fetched from DB if needed
    designation: null,
    bio: null,
  };
});
