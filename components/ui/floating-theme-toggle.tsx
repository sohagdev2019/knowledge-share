"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function FloatingThemeToggle() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [isActive, setIsActive] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleClick = () => {
    setIsActive(true);
    setTimeout(() => setIsActive(false), 600);
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="fixed left-4 top-1/2 -translate-y-1/2 z-50">
      <div className="animate-in fade-in slide-in-from-left-4 duration-700 delay-300">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={handleClick}
              className={`group relative rounded-full w-14 h-14 border-2 border-border/50 bg-gradient-to-br from-background via-background to-muted/20 backdrop-blur-xl shadow-2xl hover:shadow-[0_0_30px_rgba(34,209,114,0.3)] transition-all duration-500 hover:scale-110 active:scale-90 hover:border-primary/60 overflow-hidden ${
                isActive ? "animate-pulse" : ""
              }`}
            >
              {/* Ripple effect on click */}
              {isActive && (
                <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
              )}
              
              {/* Active flash effect */}
              <div
                className={`absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent transition-all duration-300 ${
                  isActive ? "opacity-100 scale-150" : "opacity-0 scale-100"
                }`}
              />
              
              {/* Animated background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
              
              {/* Active glow ring */}
              <div
                className={`absolute inset-0 rounded-full border-2 border-primary/50 transition-all duration-300 ${
                  isActive ? "scale-125 opacity-100" : "scale-100 opacity-0"
                }`}
              />
              
              {/* Icons with modern transitions and active animation */}
              <div className={`relative z-10 transition-transform duration-300 ${isActive ? "scale-125 rotate-12" : "scale-100 rotate-0"}`}>
                <Sun className="h-5 w-5 scale-100 rotate-0 transition-all duration-700 dark:scale-0 dark:opacity-0 dark:-rotate-180 text-amber-500 dark:text-transparent" />
                <Moon className="absolute inset-0 h-5 w-5 scale-0 opacity-0 rotate-180 transition-all duration-700 dark:scale-100 dark:opacity-100 dark:rotate-0 text-slate-300" />
              </div>
              
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="start" 
            side="right" 
            className="ml-3 animate-in fade-in slide-in-from-left-2 duration-200 backdrop-blur-xl bg-background/95 border-border/50 shadow-xl"
          >
            <DropdownMenuItem 
              onClick={() => {
                setTheme("light");
                setIsActive(true);
                setTimeout(() => setIsActive(false), 300);
              }} 
              className="cursor-pointer transition-all duration-200 active:scale-95 active:bg-primary/10"
            >
              <Sun className="mr-2 h-4 w-4 text-amber-500 transition-transform duration-200 group-hover:rotate-12" />
              Light
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => {
                setTheme("dark");
                setIsActive(true);
                setTimeout(() => setIsActive(false), 300);
              }} 
              className="cursor-pointer transition-all duration-200 active:scale-95 active:bg-primary/10"
            >
              <Moon className="mr-2 h-4 w-4 text-slate-300 transition-transform duration-200 group-hover:rotate-12" />
              Dark
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => {
                setTheme("system");
                setIsActive(true);
                setTimeout(() => setIsActive(false), 300);
              }} 
              className="cursor-pointer transition-all duration-200 active:scale-95 active:bg-primary/10"
            >
              System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

