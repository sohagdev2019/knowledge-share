import { redirect } from "next/navigation";
import { requireSuperAdmin } from "@/app/data/admin/require-superadmin";

export default async function SuperAdminCoursesCreatePage() {
  // Ensure user is superadmin (this will redirect if not)
  await requireSuperAdmin();
  
  // Superadmin users are not allowed to create courses, redirect to courses page
  redirect("/superadmin/courses");
}