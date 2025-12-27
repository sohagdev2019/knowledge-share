import { checkCourseLimit, getCurrentTeacherPlanName } from "@/lib/teacher-plan-limits";
import { SoftLockWarning } from "./SoftLockWarning";

export async function CourseLimitCheckServer() {
  const courseLimit = await checkCourseLimit();
  const planName = await getCurrentTeacherPlanName();

  // Only show for teachers with limits
  if (!planName || courseLimit.limit === null) {
    return null;
  }

  // Show soft lock warning if near limit
  if (courseLimit.isNearLimit && !courseLimit.isAtLimit) {
    const used = courseLimit.limit - (courseLimit.remaining || 0);
    return (
      <div className="mb-6">
        <SoftLockWarning
          type="courses"
          used={used}
          limit={courseLimit.limit}
          percentageUsed={courseLimit.percentageUsed}
          planName={planName}
        />
      </div>
    );
  }

  // Hard lock is handled in the action (server-side)
  return null;
}

