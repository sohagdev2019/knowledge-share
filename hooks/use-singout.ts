"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function useSignOut() {
  const router = useRouter();
  const handleSignout = async function signOutHandler() {
    try {
      await signOut({ 
        redirect: false,
        callbackUrl: "/"
      });
      router.push("/");
      router.refresh();
      toast.success("Signed out successfully");
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Failed to sign out");
    }
  };

  return handleSignout;
}
