import "server-only";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function userGetAnnouncements() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const userId = session.user.id;
  const userRole = (session.user as any).role;

  // Get user's enrollments to determine which course announcements they can see
  const enrollments = await prisma.enrollment.findMany({
    where: {
      userId,
      status: "Active",
    },
    select: {
      courseId: true,
    },
  });

  const enrolledCourseIds = enrollments.map((e) => e.courseId);

  // Build query conditions
  const conditions = [];

  // Announcements for all students
  conditions.push({
    targetRole: "AllStudents",
    status: "Published",
    OR: [
      { publishedAt: { lte: new Date() } },
      { publishedAt: null },
    ],
  });

  // Announcements for all users
  conditions.push({
    targetRole: "AllUsers",
    status: "Published",
    OR: [
      { publishedAt: { lte: new Date() } },
      { publishedAt: null },
    ],
  });

  // If user is a teacher/admin, also show teacher announcements
  if (userRole === "admin" || userRole === "superadmin") {
    conditions.push({
      targetRole: "AllTeachers",
      status: "Published",
      OR: [
        { publishedAt: { lte: new Date() } },
        { publishedAt: null },
      ],
    });
  }

  // Course-specific announcements for enrolled courses
  if (enrolledCourseIds.length > 0) {
    conditions.push({
      targetRole: "CourseStudents",
      targetCourseId: { in: enrolledCourseIds },
      status: "Published",
      OR: [
        { publishedAt: { lte: new Date() } },
        { publishedAt: null },
      ],
    });
  }

  // Specific user announcements
  conditions.push({
    targetRole: userRole === "admin" || userRole === "superadmin" 
      ? "SpecificTeachers" 
      : "SpecificStudents",
    targetUserIds: { has: userId },
    status: "Published",
    OR: [
      { publishedAt: { lte: new Date() } },
      { publishedAt: null },
    ],
  });

  const announcements = await prisma.announcement.findMany({
    where: {
      OR: conditions,
    },
    include: {
      createdBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          image: true,
        },
      },
      targetCourse: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
      readStatuses: {
        where: {
          userId,
        },
        select: {
          readAt: true,
        },
      },
    },
    orderBy: [
      { isUrgent: "desc" },
      { publishedAt: "desc" },
      { createdAt: "desc" },
    ],
  });

  // Mark which announcements are unread
  const announcementsWithReadStatus = announcements.map((announcement) => ({
    ...announcement,
    isRead: announcement.readStatuses.length > 0,
    readAt: announcement.readStatuses[0]?.readAt || null,
  }));

  return announcementsWithReadStatus;
}











