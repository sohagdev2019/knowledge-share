import { EmptyState } from "@/components/general/EmptyState";
import { getAllCourses } from "../data/course/get-all-courses";
import { getEnrolledCourses } from "../data/user/get-enrolled-courses";
import { requireUser } from "../data/user/require-user";
import { PublicCourseCard } from "../(public)/_components/PublicCourseCard";
import { prisma } from "@/lib/db";

import { CourseProgressCard } from "./_components/CourseProgressCard";
import { DashboardStats } from "./_components/DashboardStats";

export default async function DashboardPage() {
  const user = await requireUser();
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  });

  const userRole = dbUser?.role || "user";

  const [courses, enrolledCourses] = await Promise.all([
    getAllCourses(),
    getEnrolledCourses(),
  ]);

  // Calculate stats
  const enrolledCount = enrolledCourses.length;
  const totalCoursesCount = courses.length;

  // Calculate active courses (courses with progress but not completed)
  const activeCourses = enrolledCourses.filter((enrollment) => {
    const allLessons = enrollment.Course.chapter.flatMap(
      (ch) => ch.lessons
    );
    const completedLessons = allLessons.filter((lesson) =>
      lesson.lessonProgress.some((progress) => progress.completed)
    );
    return completedLessons.length > 0 && completedLessons.length < allLessons.length;
  }).length;

  // Calculate completed courses (all lessons completed)
  const completedCourses = enrolledCourses.filter((enrollment) => {
    const allLessons = enrollment.Course.chapter.flatMap(
      (ch) => ch.lessons
    );
    const completedLessons = allLessons.filter((lesson) =>
      lesson.lessonProgress.some((progress) => progress.completed)
    );
    return allLessons.length > 0 && completedLessons.length === allLessons.length;
  }).length;

  return (
    <>
      <div className="space-y-8">
        <DashboardStats
          enrolledCourses={enrolledCount}
          activeCourses={activeCourses}
          completedCourses={completedCourses}
          totalCourses={totalCoursesCount}
          userRole={userRole}
        />

        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Enrolled Courses</h1>
          <p className="text-muted-foreground">
            Here you can see all the courses you have access to
          </p>
        </div>

      {enrolledCourses.length === 0 ? (
        <EmptyState
          title="No courses purchased"
          description="You haven't purchased any courses yet."
          buttonText="Browse Courses"
          href="/courses"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {enrolledCourses.map((course) => (
            <CourseProgressCard key={course.Course.id} data={course} />
          ))}
        </div>
      )}

      <section className="mt-10">
        <div className="flex flex-col gap-2 mb-5">
          <h1 className="text-3xl font-bold">Available Courses</h1>
          <p className="text-muted-foreground">
            Here you can see all the courses you can purchase
          </p>
        </div>

        {courses.filter(
          (course) =>
            !enrolledCourses.some(
              ({ Course: enrolled }) => enrolled.id === course.id
            )
        ).length === 0 ? (
          <EmptyState
            title="No courses available"
            description="You have already purchased all available courses."
            buttonText="Browse Courses"
            href="/courses"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {courses
              .filter(
                (course) =>
                  !enrolledCourses.some(
                    ({ Course: enrolled }) => enrolled.id === course.id
                  )
              )
              .map((course) => (
                <PublicCourseCard key={course.id} data={course} />
              ))}
          </div>
        )}
      </section>
      </div>
    </>
  );
}
