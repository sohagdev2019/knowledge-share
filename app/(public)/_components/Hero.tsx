"use client";

import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Hero() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative py-20 overflow-hidden">
      <div className="flex flex-col items-center text-center space-y-8">
        <div className="flex flex-col items-center space-y-4">
          {/* Main headline - two lines with staggered animation */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
            <span
              className={`block transition-all duration-1000 ease-out ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: "0.1s" }}
            >
              Learn Easily
            </span>
            <span
              className={`block transition-all duration-1000 ease-out ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: "0.3s" }}
            >
              Anywhere and Anytime
            </span>
          </h1>

          {/* Description text with fade-in animation */}
          <p
            className={`max-w-[700px] text-muted-foreground md:text-xl mt-6 transition-all duration-1000 ease-out ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
            style={{ transitionDelay: "0.5s" }}
          >
            On our platform, you'll find resources and courses to help you grow
            your skills and advance your career. Learn at your own pace, anywhere
            and anytime.
          </p>
        </div>

        {/* Buttons with fade-in and scale animation */}
        <div
          className={`flex flex-col sm:flex-row gap-4 mt-8 transition-all duration-1000 ease-out ${
            isVisible
              ? "opacity-100 translate-y-0 scale-100"
              : "opacity-0 translate-y-4 scale-95"
          }`}
          style={{ transitionDelay: "0.7s" }}
        >
          <Link
            className={buttonVariants({
              size: "lg",
            })}
            href="/courses"
          >
            Explore Courses
          </Link>

          <Link
            className={buttonVariants({
              size: "lg",
              variant: "outline",
            })}
            href="/login"
          >
            Sign in
          </Link>
        </div>
      </div>
    </section>
  );
}

