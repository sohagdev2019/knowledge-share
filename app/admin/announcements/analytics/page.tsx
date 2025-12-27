"use server";

import { requireAdmin } from "@/app/data/admin/require-admin";
import { adminGetAnnouncements } from "@/app/data/admin/admin-get-announcements";
import { AnnouncementsAnalyticsClient } from "./_components/AnnouncementsAnalyticsClient";

export default async function AnnouncementsAnalyticsPage() {
  await requireAdmin();
  const announcements = await adminGetAnnouncements();

  return <AnnouncementsAnalyticsClient announcements={announcements} />;
}











