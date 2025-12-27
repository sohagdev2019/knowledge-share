"use server";

import { requireUser } from "@/app/data/user/require-user";
import { userGetAnnouncements } from "@/app/data/user/user-get-announcements";
import { StudentAnnouncementsClient } from "./_components/StudentAnnouncementsClient";

export default async function StudentAnnouncementsPage() {
  await requireUser();
  const announcements = await userGetAnnouncements();

  return <StudentAnnouncementsClient initialAnnouncements={announcements} />;
}











