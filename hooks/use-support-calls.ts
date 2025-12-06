"use client";

import { useStreamVideoClient } from "@stream-io/video-react-sdk";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

export function useSupportCalls() {
  const client = useStreamVideoClient();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isClientReady, setIsClientReady] = useState(false);
  const { data: session, status } = useSession();
  const isPending = status === "loading";

  useEffect(() => {
    // Wait for both session and client to be ready
    if (!isPending && session?.user && client) {
      setIsClientReady(true);
    } else {
      setIsClientReady(false);
    }
  }, [client, session, isPending]);

  const createSupportSession = async ({
    courseId,
    title,
    description,
  }: {
    courseId: string;
    title?: string;
    description?: string;
  }) => {
    if (!isClientReady || !client) {
      toast.error("Video client not initialized. Please wait a moment and try again.");
      return;
    }

    setIsLoading(true);
    try {
      // Generate unique call ID
      const callId = crypto.randomUUID();

      // Create Stream.io call
      const call = client.call("default", callId);
      await call.getOrCreate({
        data: {
          starts_at: new Date().toISOString(),
          custom: {
            description: description || "Support Session",
            courseId,
          },
        },
      });

      // Save to database
      const response = await fetch("/api/support-calls/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId,
          title,
          description,
          streamCallId: callId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create support session");
      }

      toast.success("Support session created");
      return callId;
    } catch (error) {
      console.error("Error creating support session:", error);
      toast.error("Failed to create support session");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const joinSupportSession = (callId: string) => {
    router.push(`/call/${callId}`);
  };

  return {
    createSupportSession,
    joinSupportSession,
    isLoading,
    isClientReady,
  };
}

