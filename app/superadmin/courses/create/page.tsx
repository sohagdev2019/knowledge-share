import { redirect } from "next/navigation";

export default async function SuperAdminCoursesCreatePage() {
  // requireSuperAdmin is already called in layout, no need to call again
  // Superadmin users are not allowed to create courses, redirect to courses page
  redirect("/superadmin/courses");
}