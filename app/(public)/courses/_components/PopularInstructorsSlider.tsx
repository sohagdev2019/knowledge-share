"use client";

import { PopularInstructorType } from "@/app/data/instructor/get-popular-instructors";
import { Card } from "@/components/ui/card";
import { Star, ChevronRight, ChevronLeft } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useConstructUrl } from "@/hooks/use-construct-url";
import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface PopularInstructorsSliderProps {
  instructors: PopularInstructorType[];
}

export function PopularInstructorsSlider({
  instructors,
}: PopularInstructorsSliderProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

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
  }, [instructors]);

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

  if (instructors.length === 0) {
    return null;
  }

  return (
    <section className="mt-16 mb-8">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-bold mb-2">
          Popular Instructors
        </h2>
        <p className="text-muted-foreground">
          Popular instructor in JavaScript Courses
        </p>
      </div>

      {/* Slider Container */}
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
          {instructors.map((instructor) => (
            <InstructorCard key={instructor.id} instructor={instructor} />
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

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}

function InstructorCard({ instructor }: { instructor: PopularInstructorType }) {
  const imageUrl = instructor.image
    ? useConstructUrl(instructor.image)
    : `https://avatar.vercel.sh/${instructor.firstName}${instructor.lastName || ""}`;

  const fullName = instructor.lastName
    ? `${instructor.firstName} ${instructor.lastName}`
    : instructor.firstName;

  const initials = `${instructor.firstName.charAt(0)}${instructor.lastName?.charAt(0) || ""}`.toUpperCase();

  const fullStars = Math.floor(instructor.averageRating);
  const hasHalfStar =
    instructor.averageRating % 1 >= 0.25 &&
    instructor.averageRating % 1 < 0.75;

  // Format role/designation
  const role = instructor.designation || 
    (instructor.expertise.length > 0 ? instructor.expertise.join(", ") : "Instructor");

  return (
    <Card className="min-w-[280px] sm:min-w-[320px] p-6 flex-shrink-0 border-border/60 bg-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="flex flex-col items-center text-center space-y-4">
        {/* Profile Picture */}
        <Avatar className="w-24 h-24 border-2 border-border shadow-md">
          <AvatarImage src={imageUrl} alt={fullName} />
          <AvatarFallback className="text-xl font-semibold bg-primary/10 text-primary">
            {initials}
          </AvatarFallback>
        </Avatar>

        {/* Name and Role */}
        <div className="space-y-1">
          <h3 className="font-semibold text-lg text-foreground">
            {fullName}
          </h3>
          <p className="text-sm text-muted-foreground">
            {role}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="w-full grid grid-cols-3 gap-4 pt-2 border-t border-border/50">
          {/* Students */}
          <div className="flex flex-col items-center">
            <span className="text-lg font-semibold text-foreground">
              {instructor.totalEnrollments.toLocaleString()}
            </span>
            <span className="text-xs text-muted-foreground">Students</span>
          </div>

          {/* Rating */}
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 mb-1">
              <span className="text-lg font-semibold text-foreground">
                {instructor.averageRating.toFixed(1)}
              </span>
              <Star className="size-4 fill-yellow-400 text-yellow-400" />
            </div>
            <span className="text-xs text-muted-foreground">Instructor Rating</span>
          </div>

          {/* Courses */}
          <div className="flex flex-col items-center">
            <span className="text-lg font-semibold text-foreground">
              {instructor.courseCount}
            </span>
            <span className="text-xs text-muted-foreground">
              {instructor.courseCount === 1 ? "Course" : "Courses"}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}

