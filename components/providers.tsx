"use client";

import { ThemeProvider } from "@/components/ui/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { StreamClientProvider } from "@/components/providers/StreamClientProvider";
import { SessionProvider } from "next-auth/react";
import { useEffect, useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // SessionProvider must always be available, even before mounting
  // The mounting check is only for ThemeProvider to avoid hydration issues
  return (
    <SessionProvider>
      {mounted ? (
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <StreamClientProvider>
            {children}
            <Toaster closeButton position="bottom-center" />
          </StreamClientProvider>
        </ThemeProvider>
      ) : (
        <>
          {children}
          <Toaster closeButton position="bottom-center" />
        </>
      )}
    </SessionProvider>
  );
}
