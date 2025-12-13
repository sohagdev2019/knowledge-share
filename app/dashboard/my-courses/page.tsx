import { requireUser } from "@/app/data/user/require-user";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { redirect } from "next/navigation";
import { MyCoursesStats } from "./_components/MyCoursesStats";
import { MyCoursesGrid } from "./_components/MyCoursesGrid";
import { Plus } from "lucide-react";

type CourseStatus = "Published" | "Draft" | "Pending" | "Archived";

async function getMyCourses(userId: string, status?: CourseStatus) {
  const where: any = {
    userId,
  };

  if (status) {
    if (status === "Published") {
      where.status = "Published";
    } else if (status === "Draft") {
      where.status = "Draft";
    } else if (status === "Pending") {
      where.status = "Pending";
    } else if (status === "Archived") {
      where.status = "Archived";
    }
  }

  const courses = await prisma.course.findMany({
    where,
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      title: true,
      smallDescription: true,
      duration: true,
      level: true,
      status: true,
      price: true,
      fileKey: true,
      slug: true,
      chapter: {
        select: {
          lessons: {
            select: {
              id: true,
            },
          },
        },
      },
    },
  });

  return courses;
}

async function getCourseStats(userId: string) {
  const allCourses = await prisma.course.findMany({
    where: { userId },
    select: {
      status: true,
      price: true,
    },
  });

  const active = allCourses.filter((c) => c.status === "Published").length;
  const pending = allCourses.filter((c) => c.status === "Pending").length;
  const draft = allCourses.filter((c) => c.status === "Draft").length;
  const inactive = allCourses.filter((c) => c.status === "Archived").length;
  const free = allCourses.filter((c) => c.price === 0).length;
  const paid = allCourses.filter((c) => c.price > 0).length;

  return { active, pending, draft, inactive, free, paid };
}

export default async function MyCoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const user = await requireUser();
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  });

  if (dbUser?.role !== "admin") {
    redirect("/dashboard");
  }

  const resolvedSearchParams = await searchParams;
  const status = (resolvedSearchParams.status as CourseStatus) || "Published";

  const [courses, stats] = await Promise.all([
    getMyCourses(user.id, status),
    getCourseStats(user.id),
  ]);

  return (
    <div className="space-y-8">
      <MyCoursesStats stats={stats} />

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Courses</h1>
        <Button asChild className="gap-2">
          <Link href="/admin/courses/create">
            <Plus className="h-4 w-4" />
            Add Course
          </Link>
        </Button>
      </div>

      <Tabs value={status} className="space-y-6">
        <TabsList className="inline-flex h-auto rounded-xl border border-border/60 bg-background/60 p-1 backdrop-blur">
          <TabsTrigger
            value="Published"
            asChild
            className="rounded-lg px-4 py-2 text-sm font-medium transition data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Link href="/dashboard/my-courses?status=Published">
              Publish ({stats.active})
            </Link>
          </TabsTrigger>
          <TabsTrigger
            value="Pending"
            asChild
            className="rounded-lg px-4 py-2 text-sm font-medium transition data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Link href="/dashboard/my-courses?status=Pending">
              Pending ({stats.pending})
            </Link>
          </TabsTrigger>
          <TabsTrigger
            value="Draft"
            asChild
            className="rounded-lg px-4 py-2 text-sm font-medium transition data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Link href="/dashboard/my-courses?status=Draft">
              Draft ({stats.draft})
            </Link>
          </TabsTrigger>
          <TabsTrigger
            value="Archived"
            asChild
            className="rounded-lg px-4 py-2 text-sm font-medium transition data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Link href="/dashboard/my-courses?status=Archived">
              Inactive ({stats.inactive})
            </Link>
          </TabsTrigger>
        </TabsList>

        <MyCoursesGrid courses={courses} />
      </Tabs>
    </div>
  );
}

