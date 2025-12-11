"use client";

import { useRevealOnScroll } from "@/hooks/use-reveal-on-scroll";
import { useEffect, useState } from "react";
import { Trophy, Users, Award, TrendingUp } from "lucide-react";

export function StudentsHeroSection() {
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
      className="relative py-12 md:py-16 lg:py-20 overflow-hidden"
    >
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center space-y-6 max-w-4xl mx-auto">
          <div className="flex flex-col items-center space-y-1">
            <h1
              className={`text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight transition-all duration-700 ease-out ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-6"
              }`}
              style={{ transitionDelay: "0.1s" }}
            >
              <span className="block text-primary">Students Gallery</span>
              <span className="block text-slate-900 dark:text-white mt-2">
                Celebrating Excellence
              </span>
            </h1>

            <p
              className={`max-w-[600px] text-slate-700 dark:text-white/90 text-base md:text-lg lg:text-xl mt-4 font-normal transition-all duration-700 ease-out ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
              style={{ transitionDelay: "0.4s" }}
            >
              Discover our top-performing students ranked by their achievements,
              progress, and dedication to learning.
            </p>
          </div>

          {/* Stats */}
          <div
            className={`grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-8 pt-8 border-t border-black/10 dark:border-white/10 w-full max-w-3xl transition-all duration-700 ease-out ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
            style={{ transitionDelay: "0.7s" }}
          >
            <div className="flex flex-col items-center text-center group">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors duration-300">
                <Trophy className="w-6 h-6 md:w-7 md:h-7 text-primary" />
              </div>
              <div className="text-sm md:text-base font-semibold text-slate-900 dark:text-white">
                Top Performers
              </div>
              <div className="text-xs md:text-sm text-slate-600 dark:text-white/60 mt-1">
                Ranked by achievements
              </div>
            </div>

            <div className="flex flex-col items-center text-center group">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors duration-300">
                <Users className="w-6 h-6 md:w-7 md:h-7 text-primary" />
              </div>
              <div className="text-sm md:text-base font-semibold text-slate-900 dark:text-white">
                Active Learners
              </div>
              <div className="text-xs md:text-sm text-slate-600 dark:text-white/60 mt-1">
                Engaged community
              </div>
            </div>

            <div className="flex flex-col items-center text-center group">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors duration-300">
                <Award className="w-6 h-6 md:w-7 md:h-7 text-primary" />
              </div>
              <div className="text-sm md:text-base font-semibold text-slate-900 dark:text-white">
                Certificates
              </div>
              <div className="text-xs md:text-sm text-slate-600 dark:text-white/60 mt-1">
                Earned achievements
              </div>
            </div>

            <div className="flex flex-col items-center text-center group">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors duration-300">
                <TrendingUp className="w-6 h-6 md:w-7 md:h-7 text-primary" />
              </div>
              <div className="text-sm md:text-base font-semibold text-slate-900 dark:text-white">
                Progress Tracking
              </div>
              <div className="text-xs md:text-sm text-slate-600 dark:text-white/60 mt-1">
                Real-time updates
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}




