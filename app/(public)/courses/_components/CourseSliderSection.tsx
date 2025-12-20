"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { PublicCourseType } from "@/app/data/course/get-all-courses";
import { PublicCourseCard } from "../../_components/PublicCourseCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface CourseSliderSectionProps {
  courses: PublicCourseType[];
}

export function CourseSliderSection({ courses }: CourseSliderSectionProps) {
  const [activeTab, setActiveTab] = useState<"most-popular" | "trending">("most-popular");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Filter and sort courses based on active tab
  const filteredCourses = useMemo(() => {
    let filtered = [...courses];

    if (activeTab === "most-popular") {
      // Most Popular: prioritize by enrollment count and rating
      filtered.sort((a, b) => {
        const aScore = (a.enrollmentCount ?? 0) * 2 + (a.averageRating ?? 0) * 100;
        const bScore = (b.enrollmentCount ?? 0) * 2 + (b.averageRating ?? 0) * 100;
        return bScore - aScore;
      });
    } else if (activeTab === "trending") {
      // Trending: recent courses with high enrollment
      filtered.sort((a, b) => {
        const daysSinceA = (Date.now() - new Date(a.createdAt).getTime()) / (1000 * 60 * 60 * 24);
        const daysSinceB = (Date.now() - new Date(b.createdAt).getTime()) / (1000 * 60 * 60 * 24);
        const aTrend = (a.enrollmentCount ?? 0) / Math.max(daysSinceA, 1) + (a.averageRating ?? 0) * 50;
        const bTrend = (b.enrollmentCount ?? 0) / Math.max(daysSinceB, 1) + (b.averageRating ?? 0) * 50;
        return bTrend - aTrend;
      });
    }

    return filtered.slice(0, 12); // Limit to 12 courses for slider
  }, [courses, activeTab]);

  const checkScrollability = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScrollability();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", checkScrollability);
      window.addEventListener("resize", checkScrollability);
      return () => {
        container.removeEventListener("scroll", checkScrollability);
        window.removeEventListener("resize", checkScrollability);
      };
    }
  }, [filteredCourses, activeTab]);

  // Reset scroll position when tab changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ left: 0, behavior: "smooth" });
    }
  }, [activeTab]);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      const currentScroll = scrollContainerRef.current.scrollLeft;
      const newScroll =
        direction === "left"
          ? currentScroll - scrollAmount
          : currentScroll + scrollAmount;

      scrollContainerRef.current.scrollTo({
        left: newScroll,
        behavior: "smooth",
      });
    }
  };

  if (filteredCourses.length === 0) {
    return null;
  }

  return (
    <section className="mb-16 py-8 bg-gradient-to-b from-background via-background to-muted/30 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        {/* Tabs */}
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <button
            onClick={() => setActiveTab("most-popular")}
            className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === "most-popular"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Most Popular
          </button>
          <button
            onClick={() => setActiveTab("trending")}
            className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === "trending"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Trending
          </button>
        </div>

        {/* Animated Slider Container */}
        <div className="relative">
          {/* Left Arrow */}
          {canScrollLeft && (
            <Button
              variant="outline"
              size="icon"
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-background shadow-lg border-2 hover:bg-muted"
              onClick={() => scroll("left")}
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}

          {/* Scrollable Container */}
          <div
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4 px-1"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {filteredCourses.map((course, index) => (
              <motion.div
                key={`${activeTab}-${course.id}`}
                initial={{ opacity: 0, scale: 0.9, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ 
                  delay: index * 0.05, 
                  duration: 0.4,
                  ease: [0.16, 1, 0.3, 1]
                }}
                className="flex-shrink-0 w-[280px] sm:w-[320px]"
              >
                <PublicCourseCard data={course} variant="default" />
              </motion.div>
            ))}
          </div>

          {/* Right Arrow */}
          {canScrollRight && (
            <Button
              variant="outline"
              size="icon"
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-background shadow-lg border-2 hover:bg-muted"
              onClick={() => scroll("right")}
              aria-label="Scroll right"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}

