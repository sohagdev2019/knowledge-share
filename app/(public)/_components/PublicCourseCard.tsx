"use client";

import { PublicCourseType } from "@/app/data/course/get-all-courses";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useConstructUrl } from "@/hooks/use-construct-url";
import { Star, Clock, BarChart3, Bookmark } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { WishlistButton } from "./WishlistButton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface iAppProps {
  data: PublicCourseType;
  variant?: "default" | "compact";
}

export function PublicCourseCard({ data, variant = "default" }: iAppProps) {
  if (variant === "compact") {
    return <CompactCourseCard data={data} />;
  }

  return <DefaultCourseCard data={data} />;
}

function DefaultCourseCard({ data }: { data: PublicCourseType }) {
  const thumbnailUrl = useConstructUrl(data.fileKey);
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(price / 100);
  };

  // Calculate discount (20% off for demo, or based on enrollment)
  const hasDiscount = (data.enrollmentCount ?? 0) > 10 || (data.averageRating ?? 0) > 4.0;
  const discountPercent = 20;
  const originalPrice = data.price;
  const discountedPrice = hasDiscount
    ? Math.round(originalPrice * (1 - discountPercent / 100))
    : originalPrice;

  // Determine badges
  const isBestseller = (data.enrollmentCount ?? 0) > 50;
  const isHotAndNew =
    new Date(data.createdAt).getTime() >
    Date.now() - 30 * 24 * 60 * 60 * 1000; // Within last 30 days
  const isPremium = (data.averageRating ?? 0) >= 4.5 && (data.reviewCount ?? 0) > 20;

  // Calculate star rating display
  const rating = data.averageRating ?? 0;
  const reviewCount = data.reviewCount ?? 0;
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.25 && rating % 1 < 0.75;

  return (
    <Card className="group relative overflow-hidden border-border/50 bg-card transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col h-full py-0 gap-0">
      {/* Image Container */}
      <div className="relative w-full aspect-[16/9] overflow-hidden bg-muted">
        <Image
          width={240}
          height={135}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          src={thumbnailUrl}
          alt={data.title}
        />
        {/* Wishlist Button */}
        <div className="absolute top-2 right-2 z-20">
          <WishlistButton courseId={data.id} className="h-8 w-8" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-3 sm:p-4 flex flex-col">
        {/* Title */}
        <div>
          <h3 className="font-semibold text-sm sm:text-base line-clamp-2 mb-1.5 min-h-[2.5rem]">
            <Link
              href={`/courses/${data.slug}`}
              className="hover:text-primary transition-colors"
            >
              {data.title}
            </Link>
          </h3>
        </div>

        {/* Instructor */}
        {data.instructorName && (
          <div className="text-xs text-muted-foreground mb-1.5 line-clamp-1">
            <span className="sr-only">Instructors:</span>
            {data.instructorName}
          </div>
        )}

        {/* Rating Row */}
        <div className="flex items-center gap-1.5 mb-2 flex-wrap">
          <span className="text-sm font-semibold text-foreground">
            {rating > 0 ? rating.toFixed(1) : "0.0"}
          </span>
          <div className="flex items-center gap-0.5" aria-label={`Rating: ${rating} out of 5`}>
            {[...Array(5)].map((_, i) => {
              if (i < fullStars) {
                return (
                  <Star
                    key={i}
                    className="size-3.5 fill-yellow-400 text-yellow-400"
                  />
                );
              } else if (i === fullStars && hasHalfStar) {
                return (
                  <div key={i} className="relative size-3.5">
                    <Star className="absolute inset-0 size-3.5 text-gray-300" fill="transparent" />
                    <div className="absolute inset-0 overflow-hidden" style={{ width: "50%" }}>
                      <Star className="size-3.5 fill-yellow-400 text-yellow-400" />
                    </div>
                  </div>
                );
              } else {
                return (
                  <Star key={i} className="size-3.5 text-gray-300" fill="transparent" />
                );
              }
            })}
          </div>
          {reviewCount > 0 && (
            <span className="text-xs text-muted-foreground" aria-label={`${reviewCount.toLocaleString()} reviews`}>
              ({reviewCount.toLocaleString()})
            </span>
          )}
        </div>

        {/* Price Container */}
        <div className="mt-auto">
          <div className="flex items-baseline gap-2 mb-2">
            <div className="text-base sm:text-lg font-bold text-foreground">
              <span className="sr-only">Current price</span>
              {formatPrice(discountedPrice)}
            </div>
            {hasDiscount && (
              <div className="text-sm text-muted-foreground">
                <span className="sr-only">Original Price</span>
                <s>{formatPrice(originalPrice)}</s>
              </div>
            )}
          </div>

          {/* Ribbons/Badges Container */}
          <div className="flex flex-wrap gap-1.5">
            {isPremium && (
              <Badge className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 border-0 hover:bg-gray-200">
                Premium
              </Badge>
            )}
            {isBestseller && (
              <Badge className="bg-teal-100 text-teal-600 text-xs px-2 py-0.5 border-0 hover:bg-teal-200">
                Bestseller
              </Badge>
            )}
            {isHotAndNew && !isBestseller && (
              <Badge className="bg-red-100 text-red-600 text-xs px-2 py-0.5 border-0 hover:bg-red-200">
                Hot & New
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

function CompactCourseCard({ data }: { data: PublicCourseType }) {
  const thumbnailUrl = useConstructUrl(data.fileKey);
  
  // Calculate star rating display
  const rating = data.averageRating ?? 0;
  const reviewCount = data.reviewCount ?? 0;
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.25 && rating % 1 < 0.75;

  // Format duration
  const hours = Math.floor(data.duration);
  const minutes = Math.round((data.duration - hours) * 60);
  const durationText = minutes > 0 
    ? `${hours} hours ${minutes} minutes`
    : `${hours} hours`;

  // Get category abbreviation/icon
  const getCategoryAbbr = (category: string) => {
    const words = category.split(/[\s&]+/);
    if (words.length >= 2) {
      return words.map(w => w.charAt(0).toUpperCase()).join("");
    }
    return category.substring(0, 2).toUpperCase();
  };

  // Category color mapping
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      "JavaScript": "bg-yellow-400",
      "Python": "bg-blue-400",
      "React": "bg-cyan-400",
      "Development": "bg-green-400",
      "Design": "bg-pink-400",
      "Marketing": "bg-purple-400",
      "Business": "bg-indigo-400",
      "IT & Software": "bg-yellow-400",
    };
    return colors[category] || "bg-yellow-400";
  };

  const categoryColor = getCategoryColor(data.category);
  const categoryAbbr = getCategoryAbbr(data.category);

  // Instructor initials for avatar fallback
  const instructorName = data.instructorName || "";
  const instructorInitials = instructorName
    .split(" ")
    .map(n => n.charAt(0))
    .join("")
    .toUpperCase()
    .substring(0, 2);

  return (
    <div className="group relative overflow-hidden border border-border/50 bg-card rounded-lg transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-row">
      {/* Left Section - Thumbnail Image */}
      <div className="relative w-1/3 overflow-hidden bg-muted h-[200px] flex-shrink-0">
        <Image
          width={400}
          height={200}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          src={thumbnailUrl}
          alt={data.title}
          style={{ objectFit: 'cover', height: '100%' }}
        />
      </div>

      {/* Right Section - Course Details */}
      <div className="flex-1 bg-background p-4 flex flex-col relative">
        {/* Bookmark Button */}
        <div className="absolute top-4 right-4 z-20">
          <WishlistButton courseId={data.id} className="h-8 w-8" />
        </div>

        {/* Title */}
        <Link
          href={`/courses/${data.slug}`}
          className="group/link mb-3 pr-8"
        >
          <h3 className="font-bold text-base line-clamp-2 hover:text-primary transition-colors">
            {data.title}
          </h3>
        </Link>

        {/* Course Info */}
        <div className="space-y-1.5 mb-3">
          {/* Duration */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="size-4" />
            <span>{durationText}</span>
          </div>

          {/* Level */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BarChart3 className="size-4" />
            <span>{data.level}</span>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => {
                if (i < fullStars) {
                  return (
                    <Star
                      key={i}
                      className="size-4 fill-yellow-400 text-yellow-400"
                    />
                  );
                } else if (i === fullStars && hasHalfStar) {
                  return (
                    <div key={i} className="relative size-4">
                      <Star className="absolute inset-0 size-4 text-gray-300 fill-gray-300" />
                      <div className="absolute inset-0 overflow-hidden" style={{ width: "50%" }}>
                        <Star className="size-4 fill-yellow-400 text-yellow-400" />
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <Star key={i} className="size-4 text-gray-300" fill="transparent" />
                  );
                }
              })}
            </div>
            <span className="text-sm font-medium text-foreground">
              {rating > 0 ? rating.toFixed(1) : "0.0"}
            </span>
            {reviewCount > 0 && (
              <span className="text-sm text-muted-foreground">
                ({reviewCount})
              </span>
            )}
          </div>
        </div>

        {/* Instructor */}
        {data.instructorName && (
          <div className="flex items-center gap-2 pt-3 border-t border-border/30">
            <Avatar className="size-7">
              <AvatarImage 
                src={`https://avatar.vercel.sh/${data.instructorName}`} 
                alt={data.instructorName} 
              />
              <AvatarFallback className="text-xs">{instructorInitials}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-foreground">
              {data.instructorName}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export function PublicCourseCardSkeleton() {
  return (
    <Card className="overflow-hidden border-border/50 bg-card flex flex-col h-full py-0 gap-0">
      {/* Thumbnail Skeleton */}
      <div className="w-full aspect-[16/9]">
        <Skeleton className="w-full h-full" />
      </div>

      {/* Content Skeleton */}
      <div className="flex-1 p-3 sm:p-4 flex flex-col">
        <Skeleton className="h-10 w-full rounded mb-2" />
        <Skeleton className="h-3 w-24 rounded mb-2" />
        <Skeleton className="h-4 w-32 rounded mb-3" />
        
        <div className="mt-auto">
          <Skeleton className="h-5 w-20 rounded mb-2" />
          <div className="flex gap-1.5">
            <Skeleton className="h-5 w-16 rounded" />
            <Skeleton className="h-5 w-20 rounded" />
          </div>
        </div>
      </div>
    </Card>
  );
}
