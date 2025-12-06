"use server";

import { requireSuperAdmin } from "@/app/data/admin/require-superadmin";
import { AnalyticsPageClient } from "./_components/AnalyticsPageClient";
import { adminGetEnrollmentStats } from "@/app/data/admin/admin-get-enrollment-stats";
import { adminGetDashboardStats } from "@/app/data/admin/admin-get-dashboard-stats";

export default async function SuperAdminAnalyticsPage() {
  await requireSuperAdmin();
  const enrollmentData = await adminGetEnrollmentStats();
  const dashboardStats = await adminGetDashboardStats();

  return (
    <AnalyticsPageClient
      enrollmentData={enrollmentData}
      dashboardStats={dashboardStats}
    />
  );
}
