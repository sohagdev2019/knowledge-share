"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Clock, Users, Award, BookOpen } from "lucide-react";
import { useRevealOnScroll } from "@/hooks/use-reveal-on-scroll";

export default function Hero() {
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
      className="relative py-12 md:py-16 overflow-hidden transition-colors duration-300"
    >
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center space-y-6 max-w-3xl mx-auto">
          {/* Main headline - two lines with staggered animation */}
          <div className="flex flex-col items-center space-y-1">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              <span
                className={`block text-primary transition-all duration-700 ease-out ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-6"
                }`}
                style={{ transitionDelay: "0.1s" }}
              >
                Master New Skills
              </span>
              <span
                className={`block text-slate-900 dark:text-white transition-all duration-700 ease-out ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-6"
                }`}
                style={{ transitionDelay: "0.25s" }}
              >
                Transform Your Future
              </span>
            </h1>

            {/* Description text with fade-in animation */}
            <p
              className={`max-w-[600px] text-slate-700 dark:text-white/90 text-base md:text-lg lg:text-xl mt-4 font-normal transition-all duration-700 ease-out ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
              style={{ transitionDelay: "0.4s" }}
            >
              Join thousands mastering in-demand skills. Build expertise, advance your career, unlock opportunities at your pace.
            </p>
          </div>

          {/* Buttons with fade-in animation */}
          <div
            className={`flex flex-col sm:flex-row gap-3 mt-2 transition-all duration-700 ease-out ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
            style={{ transitionDelay: "0.55s" }}
          >
            <Link
              href="/courses"
              className="group relative px-4 py-1.5 font-semibold text-sm text-white bg-primary hover:bg-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl overflow-hidden"
              style={{ borderRadius: '6px' }}
            >
              {/* Hover glow effect */}
              <span className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ borderRadius: '6px' }} />
              {/* Shine effect on hover */}
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" style={{ borderRadius: '6px' }} />
              <span className="relative z-10">Explore Courses</span>
            </Link>

            <Link
              href="/login"
              className="group relative px-4 py-1.5 font-semibold text-sm text-slate-900 dark:text-white border border-slate-900/20 dark:border-white/80 bg-white dark:bg-[#1A2B40] hover:text-primary hover:border-primary transition-all duration-300 shadow-lg hover:shadow-xl overflow-hidden"
              style={{ borderRadius: '6px' }}
            >
              {/* Hover glow effect */}
              <span className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ borderRadius: '6px' }} />
              <span className="relative z-10 transition-colors duration-300">Sign in</span>
            </Link>
          </div>

          {/* Feature highlights section */}
          <div
            className={`grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-8 pt-8 border-t border-black/10 dark:border-white/10 w-full max-w-2xl transition-all duration-700 ease-out ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
            style={{ transitionDelay: "0.7s" }}
          >
            <div className="flex flex-col items-center text-center group">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors duration-300">
                <Clock className="w-6 h-6 md:w-7 md:h-7 text-primary" />
              </div>
              <div className="text-sm md:text-base font-semibold text-slate-900 dark:text-white">Learn at Your Pace</div>
              <div className="text-xs md:text-sm text-slate-600 dark:text-white/60 mt-1">Flexible schedule</div>
            </div>
            
            <div className="flex flex-col items-center text-center group">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors duration-300">
                <Users className="w-6 h-6 md:w-7 md:h-7 text-primary" />
              </div>
              <div className="text-sm md:text-base font-semibold text-slate-900 dark:text-white">Expert Instructors</div>
              <div className="text-xs md:text-sm text-slate-600 dark:text-white/60 mt-1">Industry professionals</div>
            </div>
            
            <div className="flex flex-col items-center text-center group">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors duration-300">
                <Award className="w-6 h-6 md:w-7 md:h-7 text-primary" />
              </div>
              <div className="text-sm md:text-base font-semibold text-slate-900 dark:text-white">Certificates</div>
              <div className="text-xs md:text-sm text-slate-600 dark:text-white/60 mt-1">Get certified</div>
            </div>
            
            <div className="flex flex-col items-center text-center group">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors duration-300">
                <BookOpen className="w-6 h-6 md:w-7 md:h-7 text-primary" />
              </div>
              <div className="text-sm md:text-base font-semibold text-slate-900 dark:text-white">500+ Courses</div>
              <div className="text-xs md:text-sm text-slate-600 dark:text-white/60 mt-1">Wide selection</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

