import { Skeleton } from "@/components/ui/skeleton";

export function BlogSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="bg-gradient-to-br from-card via-card to-card/50 border-2 border-border/50 rounded-2xl overflow-hidden"
          >
            {/* Image Skeleton */}
            <div className="relative w-full h-48 sm:h-56 md:h-64 overflow-hidden bg-muted">
              <Skeleton className="w-full h-full" />
            </div>

            <div className="p-6 sm:p-8">
              {/* Category Skeleton */}
              <Skeleton className="h-6 w-24 rounded-full mb-4" />

              {/* Title Skeleton */}
              <Skeleton className="h-7 w-full mb-2" />
              <Skeleton className="h-7 w-3/4 mb-3" />

              {/* Excerpt Skeleton */}
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-5/6 mb-5" />

              {/* Stats Skeleton */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs pt-4 border-t border-border/30">
                <div className="flex items-center gap-4 flex-wrap">
                  <Skeleton className="h-6 w-24 rounded-lg" />
                  <Skeleton className="h-6 w-16 rounded-lg" />
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <Skeleton className="h-6 w-12 rounded-lg" />
                  <Skeleton className="h-6 w-12 rounded-lg" />
                  <Skeleton className="h-6 w-12 rounded-lg" />
                </div>
              </div>

              {/* Date Skeleton */}
              <Skeleton className="h-3 w-32 mt-4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

