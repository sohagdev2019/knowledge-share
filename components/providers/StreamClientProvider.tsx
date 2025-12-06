"use client";

import { StreamVideo, StreamVideoClient } from "@stream-io/video-react-sdk";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { streamTokenProvider } from "@/app/actions/stream.actions";

export function StreamClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [videoClient, setVideoClient] = useState<StreamVideoClient | null>(
    null
  );
  const { data: session, status } = useSession();
  const isPending = status === "loading";

  useEffect(() => {
    if (isPending) {
      return;
    }

    if (!session?.user) {
      console.warn("StreamClientProvider: No user session");
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
    if (!apiKey) {
      console.error(
        "Stream.io API key not configured. Please set NEXT_PUBLIC_STREAM_API_KEY in your environment variables."
      );
      console.error(
        "Get your Stream.io credentials from: https://getstream.io/dashboard/"
      );
      return;
    }

    const user = session.user as {
      id: string;
      email: string;
      firstName?: string;
      lastName?: string;
      image?: string;
    };

    try {
      // Initialize Stream client with token provider
      // The SDK will automatically call tokenProvider when needed:
      // 1. On client initialization
      // 2. When token expires (auto-refresh)
      // 3. Before joining calls
      const client = new StreamVideoClient({
        apiKey: apiKey,
        user: {
          id: user.id,
          name:
            `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email,
          image: user.image || undefined,
        },
        // Token provider function - SDK calls this automatically
        tokenProvider: streamTokenProvider,
      });

      setVideoClient(client);
      console.log("Stream.io client initialized successfully");
    } catch (error) {
      console.error("Error initializing Stream.io client:", error);
    }

    return () => {
      if (videoClient) {
        videoClient.disconnectUser();
      }
    };
  }, [session, isPending]);

  if (!videoClient) {
    return <>{children}</>;
  }

  return <StreamVideo client={videoClient}>{children}</StreamVideo>;
}

