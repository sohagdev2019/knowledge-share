"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";
import { Pencil, Trash2, Clock, BookOpen } from "lucide-react";
import { EmptyState } from "@/components/general/EmptyState";

type Course = {
  id: string;
  title: string;
  smallDescription: string;
  duration: number;
  level: string;
  status: string;
  price: number;
  fileKey: string;
  slug: string;
  chapter: {
    lessons: {
      id: string;
    }[];
  }[];
};

type MyCoursesGridProps = {
  courses: Course[];
};

export function MyCoursesGrid({ courses }: MyCoursesGridProps) {
  if (courses.length === 0) {
    return (
      <EmptyState
        title="No courses found"
        description="Create your first course to get started"
        buttonText="Add Course"
        href="/admin/courses/create"
      />
    );
  }

  const totalLessons = (course: Course) => {
    return course.chapter.reduce((acc, ch) => acc + ch.lessons.length, 0);
  };

  const formatDuration = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  const constructFileUrl = (key: string) => {
    if (!key) return "";
    return `https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME_IMAGES}.fly.storage.tigris.dev/${key}`;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course, index) => {
        const thumbnailUrl = constructFileUrl(course.fileKey);
        const lessonsCount = totalLessons(course);

        return (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.35 }}
          >
            <Card className="group relative overflow-hidden border border-border/60 bg-gradient-to-br from-background/95 via-background to-background/90 shadow-lg shadow-black/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/10">
              <div className="relative aspect-video overflow-hidden">
                <Image
                  src={thumbnailUrl}
                  alt={course.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {course.price === 0 && (
                  <Badge className="absolute bottom-2 right-2 bg-emerald-500 text-white">
                    Free
                  </Badge>
                )}
              </div>

              <CardContent className="p-5">
                <h3 className="font-semibold text-lg line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                  {course.title}
                </h3>

                <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4" />
                    <span>{lessonsCount}+ Lesson</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    <span>{formatDuration(course.duration)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {course.price > 0 ? (
                      <>
                        <span className="text-lg font-bold">${course.price}</span>
                        {course.price < 100 && (
                          <span className="text-sm text-muted-foreground line-through">
                            ${course.price + 2}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-lg font-bold text-emerald-600">
                        Free
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      asChild
                      className="h-9 w-9"
                    >
                      <Link href={`/admin/courses/${course.id}/edit`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      asChild
                      className="h-9 w-9 text-destructive hover:text-destructive"
                    >
                      <Link href={`/admin/courses/${course.id}/delete`}>
                        <Trash2 className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}

