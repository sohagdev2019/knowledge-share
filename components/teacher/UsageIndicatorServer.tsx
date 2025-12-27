import { UsageIndicator } from "./UsageIndicator";
import { 
  getTeacherPlanLimits, 
  getTeacherUsage, 
  getCurrentTeacherPlanName 
} from "@/lib/teacher-plan-limits";

export async function UsageIndicatorServer() {
  const limits = await getTeacherPlanLimits();
  const usage = await getTeacherUsage();
  const planName = await getCurrentTeacherPlanName();

  // Only show for teachers with active subscription
  if (!limits || !planName) {
    return null;
  }

  return (
    <UsageIndicator
      planName={planName}
      coursesUsed={usage.coursesUsed}
      coursesLimit={limits.maxCourses}
      studentsEnrolled={usage.studentsEnrolled}
      studentsLimit={limits.maxStudents}
      storageUsedGB={usage.storageUsedGB}
      storageLimitGB={limits.storageGB}
    />
  );
}

