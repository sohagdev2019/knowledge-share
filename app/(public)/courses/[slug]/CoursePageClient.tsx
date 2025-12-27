"use client";

import { BuyCard } from "@/components/course/BuyCard";
import { MobileStickyCTA } from "@/components/course/MobileStickyCTA";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Star } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { WishlistButton } from "./_components/WishlistButton";
import { enrollInCourseAction } from "./actions";
import { useTransition } from "react";
import { tryCatch } from "@/hooks/try-catch";
import { toast } from "sonner";

interface CoursePageClientProps {
  courseId: string;
  title: string;
  thumbnailUrl: string;
  price: {
    current: number;
    original: number;
    discountPercentage: number;
  };
  isEnrolled: boolean;
  isInWishlist: boolean;
  instructor: {
    name: string;
    title: string;
    avatar: string | null;
    firstName: string;
    lastName: string | null;
    stats: {
      students: number;
      courses: number;
      reviews: number;
      averageRating: number;
    };
    bio: string | null;
  };
}

export function CoursePageClient({
  courseId,
  title,
  thumbnailUrl,
  price,
  isEnrolled,
  isInWishlist,
  instructor,
}: CoursePageClientProps) {
  const [pending, startTransition] = useTransition();

  const handleEnroll = () => {
    startTransition(async () => {
      const { data: result, error } = await tryCatch(
        enrollInCourseAction(courseId)
      );

      if (error) {
        toast.error("An unexpected error occurred. Please try again.");
        return;
      }

      if (result.status === "success") {
        toast.success(result.message);
        // Optionally redirect or refresh
        window.location.reload();
      } else if (result.status === "error") {
        toast.error(result.message);
      }
    });
  };

  return (
    <div className="sticky top-20 space-y-6">
      <BuyCard
        courseId={courseId}
        title={title}
        thumbnailUrl={thumbnailUrl}
        price={price}
        isEnrolled={isEnrolled}
        isInWishlist={isInWishlist}
        onEnroll={handleEnroll}
      />

      {/* Instructor Card */}
      <Card>
        <CardContent className="p-6">
          <div className="mb-4">
            <h3 className="font-semibold text-base">{instructor.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {instructor.title}
            </p>
            <div className="flex items-center gap-1 mt-2">
              <Star className="size-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">
                {instructor.stats.averageRating.toFixed(1)}
              </span>
              <span className="text-xs text-muted-foreground ml-1">
                Instructor Rating
              </span>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Statistics */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <p className="text-2xl font-semibold">
                {instructor.stats.students.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Students</p>
            </div>
            <div className="text-center border-x border-border">
              <p className="text-2xl font-semibold">
                {instructor.stats.courses}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Courses</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-semibold">
                {instructor.stats.reviews.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Reviews</p>
            </div>
          </div>

          {instructor.bio && (
            <>
              <Separator className="my-4" />
              <p className="text-sm text-muted-foreground leading-relaxed">
                {instructor.bio}
              </p>
            </>
          )}

          <Separator className="my-4" />

          <Link
            href="/instructors"
            className={buttonVariants({
              variant: "outline",
              className: "w-full",
            })}
          >
            View Details
          </Link>
        </CardContent>
      </Card>

      {/* Mobile Sticky CTA */}
      <MobileStickyCTA
        price={price}
        isEnrolled={isEnrolled}
        onEnroll={handleEnroll}
      />
    </div>
  );
}

