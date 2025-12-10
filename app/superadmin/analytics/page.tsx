import { AnalyticsPageClient } from "./_components/AnalyticsPageClient";
import {
  superadminGetPlatformOverview,
  superadminGetUserAnalytics,
  superadminGetCourseAnalytics,
  superadminGetTeacherAnalytics,
  superadminGetStudentAnalytics,
  superadminGetRevenueAnalytics,
  superadminGetEngagementAnalytics,
  superadminGetSystemHealth,
} from "@/app/data/admin/superadmin-get-analytics";

export default async function SuperAdminAnalyticsPage() {
  // requireSuperAdmin is already called in layout, no need to call again

  // Fetch all analytics data in parallel
  const [
    platformOverview,
    userAnalytics,
    courseAnalytics,
    teacherAnalytics,
    studentAnalytics,
    revenueAnalytics,
    engagementAnalytics,
    systemHealth,
  ] = await Promise.all([
    superadminGetPlatformOverview(),
    superadminGetUserAnalytics(),
    superadminGetCourseAnalytics(),
    superadminGetTeacherAnalytics(),
    superadminGetStudentAnalytics(),
    superadminGetRevenueAnalytics(),
    superadminGetEngagementAnalytics(),
    superadminGetSystemHealth(),
  ]);

  return (
    <AnalyticsPageClient
      platformOverview={platformOverview}
      userAnalytics={userAnalytics}
      courseAnalytics={courseAnalytics}
      teacherAnalytics={teacherAnalytics}
      studentAnalytics={studentAnalytics}
      revenueAnalytics={revenueAnalytics}
      engagementAnalytics={engagementAnalytics}
      systemHealth={systemHealth}
    />
  );
}
