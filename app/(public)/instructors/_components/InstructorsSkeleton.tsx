"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function InstructorsSkeleton() {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="space-y-8">
          <div className="text-center">
            <Skeleton className="h-8 w-64 mx-auto mb-2" />
            <Skeleton className="h-4 w-96 mx-auto" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="border border-border bg-card">
                <CardContent className="p-6 space-y-5">
                  <div className="flex flex-col items-center space-y-3 pt-2">
                    <Skeleton className="w-24 h-24 rounded-full" />
                    <div className="space-y-2 w-full text-center">
                      <Skeleton className="h-5 w-32 mx-auto" />
                      <Skeleton className="h-4 w-24 mx-auto" />
                    </div>
                  </div>
                  <div className="pt-2 border-t border-border">
                    <div className="grid grid-cols-3 gap-3">
                      {Array.from({ length: 3 }).map((_, j) => (
                        <div key={j} className="flex flex-col items-center space-y-1">
                          <Skeleton className="h-3 w-12" />
                          <Skeleton className="h-4 w-8" />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="pt-4">
                    <Skeleton className="h-10 w-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
