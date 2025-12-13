"use client";

import { PublicCourseType } from "@/app/data/course/get-all-courses";
import { Card, CardContent } from "@/components/ui/card";
import { useConstructUrl } from "@/hooks/use-construct-url";
import { Star, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface TrendingCoursesSectionProps {
  courses: PublicCourseType[];
}

export default function TrendingCoursesSection({
  courses,
}: TrendingCoursesSectionProps) {
  const trendingCourses = courses.slice(0, 8);

  return (
    <section className="py-20">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-semibold mb-3">Trending courses</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Discover the most popular courses that learners are taking right now.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {trendingCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
        <div className="text-center mt-8">
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition"
          >
            View all courses
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

// Generate a deterministic review count based on course ID
function getReviewCount(courseId: string): number {
  let hash = 0;
  for (let i = 0; i < courseId.length; i++) {
    const char = courseId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  // Generate a number between 10000 and 500000 based on hash
  return Math.abs(hash % 490000) + 10000;
}

function CourseCard({ course }: { course: PublicCourseType }) {
  const thumbnailUrl = useConstructUrl(course.fileKey);
  const originalPrice = Math.round(course.price * 1.5);
  const reviewCount = getReviewCount(course.id);

  return (
    <Card className="group overflow-hidden border-0 bg-card hover:shadow-xl transition-all duration-300">
      {/* Course Image */}
      <div className="relative aspect-video overflow-hidden bg-muted">
        <Image
          width={600}
          height={400}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          src={thumbnailUrl}
          alt={course.title}
        />
      </div>

      <CardContent className="p-5 space-y-3">
        {/* Course Title */}
        <Link
          href={`/courses/${course.slug}`}
          className="font-semibold text-base leading-tight line-clamp-2 hover:text-primary transition-colors block"
        >
          {course.title}
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium text-foreground">4.7</span>
          </div>
          <span className="text-sm text-muted-foreground">
            ({Math.floor(reviewCount / 1000)}k)
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 pt-1">
          <span className="text-lg font-semibold text-foreground">
            ${(course.price / 100).toFixed(2)}
          </span>
          <span className="text-sm text-muted-foreground line-through">
            ${(originalPrice / 100).toFixed(2)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
