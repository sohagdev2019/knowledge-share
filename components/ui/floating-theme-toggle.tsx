"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function FloatingThemeToggle() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [isAnimating, setIsAnimating] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Determine if we're in dark mode
  const [isDark, setIsDark] = React.useState(false);

  React.useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    
    checkDarkMode();
    
    // Watch for theme changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    
    return () => observer.disconnect();
  }, [theme]);

  const handleToggle = () => {
    setIsAnimating(true);
    setTheme(isDark ? "light" : "dark");
    setTimeout(() => setIsAnimating(false), 600);
  };

  if (!mounted) {
    return (
      <div className="relative w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700" />
    );
  }

  return (
    <button
      onClick={handleToggle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative w-10 h-10 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 transition-all duration-300 hover:scale-110 active:scale-95"
      aria-label="Toggle theme"
    >
      {/* Subtle outer glow - matches website colors */}
      <div 
        className={`absolute inset-0 rounded-full transition-all duration-500 ${
          isDark 
            ? "bg-primary/20 shadow-[0_0_15px_rgba(54,211,153,0.3)]" 
            : "bg-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
        } ${isHovered ? "scale-125 opacity-100" : "scale-100 opacity-0"} ${
          isAnimating ? "animate-pulse" : ""
        }`}
        style={{
          filter: "blur(6px)",
        }}
      />

      {/* Main orb - simplified with website colors */}
      <div
        className={`relative w-10 h-10 rounded-full transition-all duration-500 overflow-hidden ${
          isDark 
            ? "bg-gradient-to-br from-primary/90 via-primary to-primary/80 border border-primary/30" 
            : "bg-gradient-to-br from-blue-500/90 via-blue-500 to-purple-500/80 border border-blue-400/30"
        } ${isHovered ? "shadow-lg" : "shadow-md"} ${
          isAnimating ? "scale-110" : "scale-100"
        }`}
        style={{
          boxShadow: isDark 
            ? "0 4px 12px rgba(54, 211, 153, 0.3), inset 0 0 10px rgba(54, 211, 153, 0.2)"
            : "0 4px 12px rgba(59, 130, 246, 0.3), inset 0 0 10px rgba(147, 51, 234, 0.2)",
        }}
      >
        {/* Subtle inner glow */}
        <div 
          className={`absolute inset-0 rounded-full opacity-40 ${
            isDark 
              ? "bg-[radial-gradient(circle_at_center,rgba(54,211,153,0.4),transparent_70%)]" 
              : "bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.5),transparent_70%)]"
          }`}
        />

        {/* Icon container - clean and simple */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Sun - Light mode */}
          <div
            className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${
              isDark 
                ? "opacity-0 scale-0 rotate-90" 
                : "opacity-100 scale-100 rotate-0"
            }`}
          >
            <Sun 
              className={`h-5 w-5 text-white transition-all duration-500 ${
                isAnimating ? "rotate-180" : "rotate-0"
              }`}
              style={{
                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
              }}
            />
          </div>

          {/* Moon - Dark mode */}
          <div
            className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${
              isDark 
                ? "opacity-100 scale-100 rotate-0" 
                : "opacity-0 scale-0 -rotate-90"
            }`}
          >
            <Moon 
              className={`h-5 w-5 text-white transition-all duration-500 ${
                isAnimating ? "-rotate-180" : "rotate-0"
              }`}
              style={{
                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
              }}
            />
          </div>
        </div>

        {/* Shimmer effect on hover */}
        <div 
          className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full transition-transform duration-700 ${
            isHovered ? "translate-x-full" : ""
          }`}
        />
      </div>

      {/* Simple expanding ring on click */}
      {isAnimating && (
        <div 
          className={`absolute top-1/2 left-1/2 w-10 h-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 ${
            isDark ? "border-primary/40" : "border-blue-400/40"
          } animate-expand-ring`}
        />
      )}
    </button>
  );
}

