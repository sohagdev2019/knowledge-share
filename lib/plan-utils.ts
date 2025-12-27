import { SubscriptionPlanType } from "@/app/data/subscription/get-subscription-plans";

/**
 * Determine if a plan is for students (users) or teachers (admins)
 * This uses naming convention: plans with "admin", "teacher", "creator" in name/slug are admin plans
 * Otherwise, they are user/student plans
 */
export function isAdminPlan(plan: SubscriptionPlanType): boolean {
  const name = plan.name.toLowerCase();
  const slug = plan.slug.toLowerCase();
  const planType = plan.planType?.toLowerCase() || "";
  
  // Check for admin/teacher/creator indicators
  const adminIndicators = ["admin", "teacher", "creator", "instructor", "educator"];
  
  return adminIndicators.some(indicator => 
    name.includes(indicator) || 
    slug.includes(indicator) || 
    planType.includes(indicator)
  );
}

/**
 * Filter plans by role type
 */
export function filterPlansByRole(
  plans: SubscriptionPlanType[],
  role: "student" | "teacher" | "all"
): SubscriptionPlanType[] {
  if (role === "all") {
    return plans;
  }
  
  if (role === "student") {
    return plans.filter(plan => !isAdminPlan(plan));
  }
  
  if (role === "teacher") {
    return plans.filter(plan => isAdminPlan(plan));
  }
  
  return plans;
}

