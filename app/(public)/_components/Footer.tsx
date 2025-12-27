"use client";

import Link from "next/link";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function Footer() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-12 border-t border-border/50">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex flex-col md:flex-row md:justify-between gap-10 mb-10">
          <div className="md:max-w-60">
            <Link href="/" className="block mb-4">
              <span className="text-xl font-bold text-gray-900 dark:text-white">Edupeak</span>
            </Link>
            <p className="text-xs text-muted-foreground mb-4">
              Built for learners, Edupeak gives you reliable, affordable
              learning infrastructure to master new skills.
            </p>
            <a
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition"
              href="#"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              All systems operational
            </a>
          </div>
          <div className="flex gap-16">
            <div>
              <p className="text-sm font-medium mb-3">Product</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/" className="hover:text-foreground transition">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/courses" className="hover:text-foreground transition">
                    Courses
                  </Link>
                </li>
                <li>
                  <Link href="/blogs" className="hover:text-foreground transition">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-foreground transition">
                    Login
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-medium mb-3">Company</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/contact" className="hover:text-foreground transition">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-foreground transition">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-foreground transition">
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-medium mb-3">Resources</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/docs" className="hover:text-foreground transition">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="/help" className="hover:text-foreground transition">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/community" className="hover:text-foreground transition">
                    Community
                  </Link>
                </li>
                <li>
                  <Link href="/instructors" className="hover:text-foreground transition">
                    Become Instructor
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between pt-8">
          <p className="text-xs text-muted-foreground">
            © {currentYear} Edupeak
          </p>
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="relative inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md text-[13px] font-medium tracking-tight transition-colors duration-75 cursor-pointer disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-1 focus-visible:ring-ring/40 hover:bg-accent/50 text-muted-foreground hover:text-foreground size-7 h-8 w-8"
              aria-label="Toggle theme"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </button>
          )}
        </div>
      </div>
    </footer>
  );
}
