import { getAllCourses } from "@/app/data/course/get-all-courses";
import { getPopularInstructors } from "@/app/data/instructor/get-popular-instructors";
import { CoursesPageClient } from "./_components/CoursesPageClient";

export const dynamic = "force-dynamic";

export default async function PublicCoursesRoute() {
  const [courses, instructors] = await Promise.all([
    getAllCourses(),
    getPopularInstructors(),
  ]);

  return (
    <CoursesPageClient
      initialCourses={courses}
      instructors={instructors}
    />
  );
}
