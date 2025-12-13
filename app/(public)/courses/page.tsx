import { getAllCourses } from "@/app/data/course/get-all-courses";
import { CoursesPageClient } from "./_components/CoursesPageClient";

export const dynamic = "force-dynamic";

export default async function PublicCoursesRoute() {
  const courses = await getAllCourses();

  return <CoursesPageClient initialCourses={courses} />;
}
