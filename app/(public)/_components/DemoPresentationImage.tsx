"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function DemoPresentationImage() {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [previousIsDark, setPreviousIsDark] = useState<boolean | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine the current theme
  const currentTheme = theme === "system" ? systemTheme : theme;
  const isDark = currentTheme === "dark";

  // Handle smooth theme transition
  useEffect(() => {
    if (mounted && previousIsDark !== null && previousIsDark !== isDark) {
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, 600); // Match transition duration
      return () => clearTimeout(timer);
    }
    if (mounted) {
      setPreviousIsDark(isDark);
    }
  }, [isDark, mounted, previousIsDark]);

  // Image sources
  const darkImageSrc = "/assets/background/demo-prentation-dark.png";
  const lightImageSrc = "/assets/background/demo-present-light.png";

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className="w-full h-auto aspect-[16/10] bg-muted animate-pulse rounded-2xl md:rounded-3xl" />
    );
  }

  return (
    <>
      {/* Floating animation styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes float-demo {
            0%, 100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-10px);
            }
          }
        `
      }} />
      <div className="relative w-full group" style={{ animation: 'float-demo 6s ease-in-out infinite' }}>
        {/* Animated background glow effect */}
        <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500/20 via-blue-500/20 to-purple-500/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-pulse" />
        
        {/* Image container with smooth transitions */}
        <div className="relative overflow-hidden rounded-2xl md:rounded-3xl shadow-2xl border border-border/50 bg-card/50 backdrop-blur-sm transform transition-all duration-500 hover:scale-[1.02] hover:shadow-3xl">
          {/* Crossfade effect for theme transitions */}
          <div className="relative w-full">
            {/* Dark theme image */}
            <div
              className={`w-full transition-opacity duration-700 ease-in-out ${
                isDark && !isTransitioning
                  ? "opacity-100 relative z-10"
                  : "opacity-0 absolute inset-0 z-0 pointer-events-none"
              }`}
            >
              <Image
                alt="Demo Presentation Dark"
                width={1600}
                height={1000}
                className="w-full h-auto object-contain"
                src={darkImageSrc}
                priority
              />
            </div>
            
            {/* Light theme image */}
            <div
              className={`w-full transition-opacity duration-700 ease-in-out ${
                !isDark && !isTransitioning
                  ? "opacity-100 relative z-10"
                  : "opacity-0 absolute inset-0 z-0 pointer-events-none"
              }`}
            >
              <Image
                alt="Demo Presentation Light"
                width={1600}
                height={1000}
                className="w-full h-auto object-contain"
                src={lightImageSrc}
                priority
              />
            </div>
          </div>
          
          {/* Animated overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>
      </div>
    </>
  );
}

