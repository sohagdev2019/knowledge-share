"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function StudentsSkeleton() {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        {/* Header Skeleton */}
        <div className="mb-12 text-center space-y-4">
          <Skeleton className="h-10 w-64 mx-auto" />
          <Skeleton className="h-6 w-96 mx-auto max-w-full" />
        </div>

        {/* Top 3 Podium Skeleton */}
        <div className="mb-16">
          <div className="flex flex-col md:flex-row items-end justify-center gap-4 md:gap-6 max-w-5xl mx-auto">
            {/* 2nd Place Skeleton */}
            <div className="flex-1 max-w-xs order-2 md:order-1">
              <TopStudentCardSkeleton />
            </div>
            {/* 1st Place Skeleton */}
            <div className="flex-1 max-w-xs order-1 md:order-2">
              <TopStudentCardSkeleton isFirst />
            </div>
            {/* 3rd Place Skeleton */}
            <div className="flex-1 max-w-xs order-3 md:order-3">
              <TopStudentCardSkeleton />
            </div>
          </div>
        </div>

        {/* All Students Grid Skeleton */}
        <div className="space-y-8">
          <Skeleton className="h-8 w-48 mx-auto" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <StudentCardSkeleton key={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function TopStudentCardSkeleton({ isFirst = false }: { isFirst?: boolean }) {
  const height = isFirst ? "md:h-[380px]" : "md:h-[360px]";
  
  return (
    <Card className={`border-2 border-border bg-card ${height}`}>
      <CardContent className="p-8 space-y-6 relative h-full flex flex-col">
        {/* Rank Badge Skeleton */}
        <div className="absolute top-5 right-5 z-10">
          <Skeleton className="h-7 w-16 rounded-full" />
        </div>

        {/* Profile Header Skeleton */}
        <div className="flex flex-col items-center space-y-4 pt-4">
          <Skeleton className="w-32 h-32 rounded-full" />
          <div className="space-y-2 w-full">
            <Skeleton className="h-6 w-32 mx-auto" />
            <Skeleton className="h-4 w-24 mx-auto" />
          </div>
        </div>

        {/* Points Display Skeleton */}
        <div className="pt-4 border-t border-border">
          <div className="flex items-center justify-center p-4 rounded-lg bg-muted/30 border border-border/50">
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-md" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-2 gap-3 pt-2 mt-auto">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="flex flex-col items-center space-y-2 p-3 rounded-lg bg-muted/20 border border-border/50"
            >
              <Skeleton className="w-8 h-8 rounded-md" />
              <Skeleton className="h-6 w-12" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function StudentCardSkeleton() {
  return (
    <Card className="border border-border bg-card">
      <CardContent className="p-6 space-y-5 relative flex flex-col h-full">
        {/* Profile Section Skeleton */}
        <div className="flex flex-col items-center space-y-3 pt-2">
          <Skeleton className="w-24 h-24 rounded-full" />
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-40" />
        </div>

        {/* Activity Statistics Skeleton */}
        <div className="pt-2 border-t border-border">
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex flex-col items-center space-y-1">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-6 w-8" />
              </div>
            ))}
          </div>
        </div>

        {/* Achievement Badges Skeleton */}
        <div className="pt-2 border-t border-border">
          <div className="flex flex-wrap gap-2 justify-center">
            {Array.from({ length: 2 }).map((_, index) => (
              <Skeleton key={index} className="h-6 w-12 rounded-full" />
            ))}
          </div>
        </div>

        {/* Button Skeleton */}
        <div className="pt-4 mt-auto">
          <Skeleton className="h-10 w-full rounded" />
        </div>
      </CardContent>
    </Card>
  );
}
