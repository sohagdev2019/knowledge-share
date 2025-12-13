"use client";

import { useEffect, useState } from "react";
import { useRevealOnScroll } from "@/hooks/use-reveal-on-scroll";
import { Sparkles, Users, BookOpen, Award } from "lucide-react";

export function CreatorHeroSection() {
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
      className="relative py-20 md:py-32 overflow-hidden bg-gradient-to-b from-background via-background to-muted/20"
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col items-center text-center space-y-8 max-w-5xl mx-auto">
          {/* Icon with animation */}
          <div
            className={`transition-all duration-700 ease-out ${
              isVisible
                ? "opacity-100 scale-100 rotate-0"
                : "opacity-0 scale-50 rotate-12"
            }`}
            style={{ transitionDelay: "0.1s" }}
          >
            <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 flex items-center justify-center mb-6 group shadow-2xl shadow-primary/20">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
              <Sparkles className="w-12 h-12 md:w-14 md:h-14 text-primary group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 relative z-10" />
            </div>
          </div>

          {/* Main heading */}
          <h1
            className={`text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-tight transition-all duration-700 ease-out ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-6"
            }`}
            style={{ transitionDelay: "0.25s" }}
          >
            <span className="block bg-gradient-to-r from-primary via-primary to-primary/80 bg-clip-text text-transparent">
              Meet Our Creators
            </span>
            <span className="block text-foreground mt-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Expert Teachers & Course Builders
            </span>
          </h1>

          {/* Description */}
          <p
            className={`max-w-3xl text-muted-foreground text-lg md:text-xl lg:text-2xl mt-6 font-normal leading-relaxed transition-all duration-700 ease-out ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
            style={{ transitionDelay: "0.4s" }}
          >
            Discover the talented educators behind our courses. These dedicated creators design, 
            develop, and deliver world-class learning experiences to help you achieve your goals.
          </p>

          {/* Stats */}
          <div
            className={`grid grid-cols-3 gap-8 md:gap-12 mt-16 w-full max-w-3xl transition-all duration-700 ease-out ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
            style={{ transitionDelay: "0.55s" }}
          >
            <div className="flex flex-col items-center text-center group cursor-default">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center mb-4 group-hover:bg-gradient-to-br group-hover:from-blue-500/30 group-hover:to-blue-600/30 transition-all duration-300 shadow-lg group-hover:shadow-xl group-hover:scale-110">
                <Users className="w-8 h-8 md:w-10 md:h-10 text-blue-500 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Expert</div>
              <div className="text-sm md:text-base text-muted-foreground mt-2 font-medium">Instructors</div>
            </div>
            
            <div className="flex flex-col items-center text-center group cursor-default">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 flex items-center justify-center mb-4 group-hover:bg-gradient-to-br group-hover:from-emerald-500/30 group-hover:to-emerald-600/30 transition-all duration-300 shadow-lg group-hover:shadow-xl group-hover:scale-110">
                <BookOpen className="w-8 h-8 md:w-10 md:h-10 text-emerald-500 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">500+</div>
              <div className="text-sm md:text-base text-muted-foreground mt-2 font-medium">Courses</div>
            </div>
            
            <div className="flex flex-col items-center text-center group cursor-default">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/20 flex items-center justify-center mb-4 group-hover:bg-gradient-to-br group-hover:from-amber-500/30 group-hover:to-amber-600/30 transition-all duration-300 shadow-lg group-hover:shadow-xl group-hover:scale-110">
                <Award className="w-8 h-8 md:w-10 md:h-10 text-amber-500 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Quality</div>
              <div className="text-sm md:text-base text-muted-foreground mt-2 font-medium">Content</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
