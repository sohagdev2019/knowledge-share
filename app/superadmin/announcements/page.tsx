"use server";

import { requireSuperAdmin } from "@/app/data/admin/require-superadmin";
import { adminGetCourses } from "@/app/data/admin/admin-get-courses";
import { AnnouncementsPageClient } from "./_components/AnnouncementsPageClient";

const demoAnnouncements = [
  {
    id: "1",
    date: "August 11, 2025, 12:26 pm",
    title: "Welcome to Introduction to Programming",
    courseName: "Fullstack Wordpress Developer Online Course",
    status: "Published" as const,
  },
  {
    id: "2",
    date: "August 11, 2025, 12:25 pm",
    title: "Essay Assignment Due Date Approaching",
    courseName: "Fullstack Wordpress Developer Online Course",
    status: "Published" as const,
  },
  {
    id: "3",
    date: "August 11, 2025, 12:24 pm",
    title: "Final Exam Schedule and Preparation Tips",
    courseName: "Information About UI/UX Design Degree",
    status: "Published" as const,
  },
  {
    id: "4",
    date: "August 11, 2025, 12:24 pm",
    title: "New Video Lectures Added",
    courseName: "Complete html css and javascript course",
    status: "Published" as const,
  },
];

export default async function SuperAdminAnnouncementsPage() {
  await requireSuperAdmin();
  const courses = await adminGetCourses();

  const coursesForSelect = courses.map((course) => ({
    id: course.id,
    title: course.title,
  }));

  return (
    <AnnouncementsPageClient
      announcements={demoAnnouncements}
      courses={coursesForSelect}
    />
  );
}
