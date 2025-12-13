"use client";

import { useEffect, useState } from "react";
import { useRevealOnScroll } from "@/hooks/use-reveal-on-scroll";
import { ArrowRight, BookOpen, Sparkles } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export function CreatorCTASection() {
  const { ref, isVisible: inView } = useRevealOnScroll<HTMLElement>();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (inView) {
      const timer = setTimeout(() => setIsVisible(true), 100);
      return () => clearTimeout(timer);
    }
  }, [inView]);

  return (
    <section
      ref={ref}
      className="relative py-20 md:py-32 overflow-hidden bg-gradient-to-b from-background via-muted/10 to-background"
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 left-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1.5s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "3s" }} />
      </div>

      <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div
            className={`transition-all duration-700 ease-out ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-6"
            }`}
            style={{ transitionDelay: "0.1s" }}
          >
            <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-primary/20 group">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
              <Sparkles className="w-10 h-10 md:w-12 md:h-12 text-primary group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 relative z-10" />
            </div>
          </div>

          <h2
            className={`text-4xl md:text-5xl lg:text-6xl font-black text-foreground mb-8 transition-all duration-700 ease-out ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-6"
            }`}
            style={{ transitionDelay: "0.25s" }}
          >
            <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
              Ready to Start Learning?
            </span>
          </h2>

          <p
            className={`text-xl md:text-2xl text-muted-foreground mb-12 leading-relaxed transition-all duration-700 ease-out ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
            style={{ transitionDelay: "0.4s" }}
          >
            Explore courses created by our expert instructors and begin your learning journey today.
          </p>

          <div
            className={`flex flex-col sm:flex-row gap-6 justify-center items-center transition-all duration-700 ease-out ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
            style={{ transitionDelay: "0.55s" }}
          >
            <Link
              href="/courses"
              className={buttonVariants({
                size: "lg",
                className: "group relative px-8 py-6 text-lg font-bold shadow-2xl hover:shadow-primary/30 transition-all duration-300 hover:scale-105 bg-gradient-to-r from-primary to-primary/90 hover:from-primary hover:to-primary",
              })}
            >
              <BookOpen className="w-6 h-6 mr-3 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300" />
              Browse All Courses
              <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform duration-300" />
            </Link>

            <Link
              href="/become-an-instructor"
              className={buttonVariants({
                variant: "outline",
                size: "lg",
                className: "group relative px-8 py-6 text-lg font-bold border-2 hover:border-primary/50 transition-all duration-300 hover:scale-105 bg-gradient-to-br from-background to-muted/50 hover:from-primary/5 hover:to-primary/10",
              })}
            >
              Become a Creator
              <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform duration-300" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
