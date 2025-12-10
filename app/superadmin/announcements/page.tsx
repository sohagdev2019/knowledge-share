"use server";

import { adminGetCourses } from "@/app/data/admin/admin-get-courses";
import { AnnouncementsPageClient } from "./_components/AnnouncementsPageClient";

export default async function SuperAdminAnnouncementsPage() {
  // requireSuperAdmin is already called in layout, no need to call again
  const courses = await adminGetCourses();

  const coursesForSelect = courses.map((course) => ({
    id: course.id,
    title: course.title,
  }));

  return (
    <AnnouncementsPageClient
      courses={coursesForSelect}
    />
  );
}
