"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRevealOnScroll } from "@/hooks/use-reveal-on-scroll";

const traditionalLearningTexts = [
  "traditional learning",
  "online courses",
  "self-paced study",
  "interactive education",
];

export default function Hero() {
  const { ref, isVisible: inView } = useRevealOnScroll<HTMLElement>();
  const [isVisible, setIsVisible] = useState(false);
  const [currentTraditionalIndex, setCurrentTraditionalIndex] = useState(0);
  const [isTraditionalAnimating, setIsTraditionalAnimating] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (inView) {
      const timer = setTimeout(() => setIsVisible(true), 150);
      return () => clearTimeout(timer);
    }
  }, [inView]);

  useEffect(() => {
    if (!isVisible || !mounted) return;

    const interval = setInterval(() => {
      setIsTraditionalAnimating(true);
      setTimeout(() => {
        setCurrentTraditionalIndex((prev) => (prev + 1) % traditionalLearningTexts.length);
        setTimeout(() => {
          setIsTraditionalAnimating(false);
        }, 50);
      }, 200);
    }, 3500);

    return () => clearInterval(interval);
  }, [isVisible, mounted]);

  return (
    <section
      ref={ref}
      className="relative py-16 md:py-24 overflow-hidden  text-gray-900 dark:text-white"
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 opacity-20 dark:opacity-30">
        <div
          className={`absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-3xl transition-all duration-2000 ${
            isVisible ? "opacity-100 scale-100" : "opacity-0 scale-50"
          }`}
          style={{
            transitionDelay: "0.5s",
            animation: isVisible ? "float 6s ease-in-out infinite" : "none",
          }}
        />
        <div
          className={`absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-3xl transition-all duration-2000 ${
            isVisible ? "opacity-100 scale-100" : "opacity-0 scale-50"
          }`}
          style={{
            transitionDelay: "0.8s",
            animation: isVisible ? "float 8s ease-in-out infinite reverse" : "none",
          }}
        />
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes float {
            0%, 100% {
              transform: translateY(0px) translateX(0px);
            }
            50% {
              transform: translateY(-20px) translateX(10px);
            }
          }
          @keyframes shimmer {
            0% {
              background-position: -200% center;
            }
            100% {
              background-position: 200% center;
            }
          }
          @keyframes glow {
            0%, 100% {
              text-shadow: 0 0 20px rgba(255, 255, 255, 0.1),
                           0 0 40px rgba(255, 255, 255, 0.1);
            }
            50% {
              text-shadow: 0 0 30px rgba(255, 255, 255, 0.2),
                           0 0 60px rgba(255, 255, 255, 0.15);
            }
          }
          @keyframes pulse-on-hover {
            0%, 100% {
              box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4);
            }
            50% {
              box-shadow: 0 0 0 8px rgba(255, 255, 255, 0);
            }
          }
          .animate-pulse-on-hover:hover {
            animation: pulse-on-hover 1.5s ease-in-out infinite;
          }
        `
      }} />

      <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col items-center text-center space-y-4 md:space-y-6 max-w-4xl mx-auto">
          {/* Top alternative text with smooth fade and scale animation */}
          <p
            className={`text-sm md:text-base text-gray-600 dark:text-gray-400 mb-4 transition-all duration-1200 ${
              isVisible
                ? "opacity-100 translate-y-0 scale-100"
                : "opacity-0 translate-y-6 scale-95"
            }`}
            style={{
              transitionDelay: "0.15s",
              transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            An alternative to{" "}
            <span className="inline-flex items-center">
              <span className="inline-block w-[180px] text-left">
                <span
                  className={`inline-block text-gray-700 dark:text-gray-300 font-medium transition-all duration-200 ${
                    isTraditionalAnimating
                      ? "opacity-0 translate-y-2"
                      : "opacity-100 translate-y-0"
                  }`}
                >
                  {traditionalLearningTexts[currentTraditionalIndex]}
                </span>
              </span>
            </span>
          </p>

          {/* Main headline - two lines */}
          <h1 className="text-5xl md:text-6xl lg:text-6xl font-bold tracking-tight leading-tight mb-6 md:mb-8 text-gray-900 dark:text-white">
            <span className="block">
              Learn at your pace
            </span>
            <span className="block">
              master new skills
            </span>
          </h1>

          {/* Description text with smooth fade animation */}
          <div className="space-y-3 max-w-2xl mt-4 text-center">
            <p
              className={`text-[16px] md:text-[18px] text-gray-700 dark:text-gray-300 transition-all duration-1200 leading-relaxed ${
                isVisible
                  ? "opacity-100 translate-y-0 blur-0"
                  : "opacity-0 translate-y-6 blur-sm"
              }`}
              style={{
                transitionDelay: "0.7s",
                transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              Access thousands of courses taught by industry experts.
            </p>
            <p
              className={`text-[16px] md:text-[18px] text-gray-700 dark:text-gray-300 transition-all duration-1200 leading-relaxed ${
                isVisible
                  ? "opacity-100 translate-y-0 blur-0"
                  : "opacity-0 translate-y-6 blur-sm"
              }`}
              style={{
                transitionDelay: "0.85s",
                transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              Build real-world projects and advance your career with our
              comprehensive learning platform.
            </p>
          </div>

          {/* CTA Buttons with smooth scale and fade animation */}
          <div
            className={`flex flex-col sm:flex-row gap-3 mt-6 md:mt-8 transition-all duration-1200 ${
              isVisible
                ? "opacity-100 translate-y-0 scale-100"
                : "opacity-0 translate-y-8 scale-90"
            }`}
            style={{
              transitionDelay: "1s",
              transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <Link
              href="/courses"
              className="group relative px-5 py-2.5 font-semibold text-sm text-white bg-gray-900 dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100 transition-all duration-300 rounded-lg transform hover:scale-105 active:scale-95 hover:shadow-xl hover:shadow-gray-900/30 dark:hover:shadow-white/30 overflow-hidden animate-pulse-on-hover"
              style={{ transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)" }}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-black/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <span className="relative z-10 flex items-center justify-center gap-2">
                Start learning free
                <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
              </span>
            </Link>

            <Link
              href="/courses"
              className="group relative px-5 py-2.5 font-semibold text-sm text-gray-900 dark:text-white border-2 border-gray-900 dark:border-white hover:bg-gray-100 dark:hover:bg-white/20 transition-all duration-300 rounded-lg transform hover:scale-105 active:scale-95 hover:shadow-xl hover:shadow-gray-900/20 dark:hover:shadow-white/20 hover:border-gray-800 dark:hover:border-white/80 overflow-hidden backdrop-blur-sm animate-pulse-on-hover"
              style={{ transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)" }}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-900/10 dark:via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <span className="relative z-10 flex items-center justify-center gap-2">
                Explore courses
                <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
