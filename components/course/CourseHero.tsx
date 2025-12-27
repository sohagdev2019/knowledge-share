import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Star, Clock, Users, Award } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { env } from "@/lib/env";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface CourseHeroProps {
  title: string;
  subtitle: string;
  category: string;
  level: string;
  rating: number;
  totalRatings: number;
  totalStudents: number;
  lastUpdated: string;
  badges: string[];
  instructor: {
    name: string;
    title: string;
    avatar: string | null;
    firstName: string;
    lastName: string | null;
  };
}

export function CourseHero({
  title,
  subtitle,
  category,
  level,
  rating,
  totalRatings,
  totalStudents,
  lastUpdated,
  badges,
  instructor,
}: CourseHeroProps) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.25 && rating % 1 < 0.75;

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/courses">Courses</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/courses?category=${category}`}>{category}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Title and Subtitle */}
      <div className="space-y-3">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
          {title}
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-4xl">
          {subtitle}
        </p>
      </div>

      {/* Badges */}
      {badges.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {badges.map((badge) => (
            <Badge
              key={badge}
              variant={
                badge === "Bestseller"
                  ? "default"
                  : badge === "Premium"
                  ? "secondary"
                  : "outline"
              }
              className={
                badge === "Bestseller"
                  ? "bg-teal-100 text-teal-700 hover:bg-teal-200 dark:bg-teal-900 dark:text-teal-300"
                  : badge === "Premium"
                  ? "bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-300"
                  : ""
              }
            >
              {badge}
            </Badge>
          ))}
        </div>
      )}

      {/* Instructor Info */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          {instructor.avatar ? (
            <Avatar className="size-12">
              <AvatarImage
                src={
                  instructor.avatar.startsWith("http")
                    ? instructor.avatar
                    : `https://${env.NEXT_PUBLIC_S3_BUCKET_NAME_IMAGES}.fly.storage.tigris.dev/${instructor.avatar}`
                }
                alt={instructor.name}
              />
              <AvatarFallback>
                {instructor.firstName[0]}
                {instructor.lastName?.[0] || ""}
              </AvatarFallback>
            </Avatar>
          ) : (
            <Avatar className="size-12">
              <AvatarFallback>
                {instructor.firstName[0]}
                {instructor.lastName?.[0] || ""}
              </AvatarFallback>
            </Avatar>
          )}
          <div>
            <p className="font-semibold text-sm">{instructor.name}</p>
            <p className="text-sm text-muted-foreground">
              {instructor.title || "Instructor"}
            </p>
          </div>
        </div>
      </div>

      {/* Rating and Stats */}
      <div className="flex flex-wrap items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg">{rating.toFixed(1)}</span>
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
                    <Star className="absolute inset-0 size-4 text-gray-300" />
                    <div
                      className="absolute inset-0 overflow-hidden"
                      style={{ width: "50%" }}
                    >
                      <Star className="size-4 fill-yellow-400 text-yellow-400" />
                    </div>
                  </div>
                );
              } else {
                return (
                  <Star
                    key={i}
                    className="size-4 text-gray-300"
                    fill="transparent"
                  />
                );
              }
            })}
          </div>
          <span className="text-muted-foreground">
            ({totalRatings.toLocaleString()} ratings)
          </span>
        </div>

        <div className="flex items-center gap-2 text-muted-foreground">
          <Users className="size-4" />
          <span>{totalStudents.toLocaleString()} students</span>
        </div>

        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="size-4" />
          <span>Last updated {lastUpdated}</span>
        </div>

        <div className="flex items-center gap-2 text-muted-foreground">
          <Award className="size-4" />
          <span>{level}</span>
        </div>
      </div>
    </div>
  );
}

