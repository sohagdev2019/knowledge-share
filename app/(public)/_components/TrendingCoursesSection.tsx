"use client";

import { useEffect, useRef, useState } from "react";
import { PublicCourseType } from "@/app/data/course/get-all-courses";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useConstructUrl } from "@/hooks/use-construct-url";
import { Star, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface TrendingCoursesSectionProps {
  courses: PublicCourseType[];
}

export default function TrendingCoursesSection({ courses }: TrendingCoursesSectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (scrollContainerRef.current) {
      observer.observe(scrollContainerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const checkScroll = () => {
      if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
      }
    };

    if (scrollContainerRef.current) {
      scrollContainerRef.current.addEventListener("scroll", checkScroll);
      checkScroll();
    }

    return () => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.removeEventListener("scroll", checkScroll);
      }
    };
  }, []);

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 400,
        behavior: "smooth",
      });
    }
  };

  const trendingCourses = courses.slice(0, 8);

  return (
    <section className="py-16 sm:py-20 lg:py-24 px-4 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div
          className={`mb-8 transition-all duration-1000 ease-out ${
            isVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
              Trending courses
            </h2>
            {canScrollRight && (
              <button
                onClick={scrollRight}
                className="hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-background border border-border hover:bg-accent hover:border-primary/50 transition-all duration-300 hover:scale-110 shadow-lg"
                aria-label="Scroll right"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Courses Grid */}
        <div className="relative">
          <div
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto pb-4 scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            {trendingCourses.map((course, index) => (
              <CourseCard
                key={course.id}
                course={course}
                index={index}
                isVisible={isVisible}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CourseCard({
  course,
  index,
  isVisible,
}: {
  course: PublicCourseType;
  index: number;
  isVisible: boolean;
}) {
  const thumbnailUrl = useConstructUrl(course.fileKey);
  const [originalPrice] = useState(
    Math.round(course.price * 1.5)
  );

  return (
    <div
      className={`flex-shrink-0 w-[280px] sm:w-[320px] transition-all duration-1000 ease-out ${
        isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-12"
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <Card className="group relative overflow-hidden border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-xl h-full flex flex-col">
        {/* Bestseller Badge */}
        <Badge className="absolute top-3 left-3 z-10 bg-blue-600 hover:bg-blue-600 text-white">
          Bestseller
        </Badge>

        {/* Course Image */}
        <div className="relative aspect-video overflow-hidden">
          <Image
            width={600}
            height={400}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            src={thumbnailUrl}
            alt={course.title}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        <CardContent className="p-4 flex-1 flex flex-col">
          {/* Course Title */}
          <Link
            href={`/courses/${course.slug}`}
            className="font-semibold text-base sm:text-lg line-clamp-2 hover:text-primary transition-colors mb-2 group-hover:underline"
          >
            {course.title}
          </Link>

          {/* Instructor - Placeholder */}
          <p className="text-sm text-muted-foreground mb-3">
            KnowledgeShare Instructor
          </p>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-semibold">4.7</span>
            </div>
            <span className="text-sm text-muted-foreground">
              ({Math.floor(Math.random() * 100000 + 10000)})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2 mb-4 mt-auto">
            <span className="text-xl font-bold text-foreground">
              ${(course.price / 100).toFixed(2)}
            </span>
            <span className="text-sm text-muted-foreground line-through">
              ${(originalPrice / 100).toFixed(2)}
            </span>
          </div>

          {/* Level Badge */}
          <Badge variant="outline" className="w-fit">
            {course.level}
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
}

