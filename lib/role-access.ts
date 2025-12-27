import "server-only";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export type UserRole = "user" | "admin" | "superadmin";

/**
 * Get current user role from session
 */
export async function getUserRole(): Promise<UserRole | null> {
  const session = await auth();
  if (!session?.user) {
    return null;
  }

  const role = (session.user as any).role as string | undefined;
  
  // Normalize role to lowercase
  if (!role) {
    return "user"; // Default role
  }

  const normalizedRole = role.toLowerCase();
  
  if (normalizedRole === "superadmin" || normalizedRole === "super_admin") {
    return "superadmin";
  }
  
  if (normalizedRole === "admin") {
    return "admin";
  }
  
  return "user";
}

/**
 * Require a specific role - redirects if role doesn't match
 */
export async function requireRole(allowedRoles: UserRole[]): Promise<UserRole> {
  const role = await getUserRole();
  
  if (!role) {
    redirect("/login");
  }
  
  if (!allowedRoles.includes(role)) {
    redirect("/access-denied");
  }
  
  return role;
}

/**
 * Check if user can access pricing page
 * Only regular users can access pricing
 */
export async function canAccessPricing(): Promise<boolean> {
  const role = await getUserRole();
  return role === "user" || role === null; // Allow unauthenticated users to view pricing
}

/**
 * Check if user can subscribe to user plans
 * Only regular users can subscribe
 */
export async function canSubscribeToUserPlans(): Promise<boolean> {
  const role = await getUserRole();
  return role === "user";
}

/**
 * Check if user requires subscription
 * SuperAdmin never requires subscription
 */
export async function requiresSubscription(): Promise<boolean> {
  const role = await getUserRole();
  return role !== "superadmin";
}

/**
 * Check if user is admin (admin or superadmin)
 */
export async function isAdmin(): Promise<boolean> {
  const role = await getUserRole();
  return role === "admin" || role === "superadmin";
}

/**
 * Check if user is superadmin
 */
export async function isSuperAdmin(): Promise<boolean> {
  const role = await getUserRole();
  return role === "superadmin";
}

/**
 * Get redirect URL based on user role
 */
export async function getRoleBasedRedirect(): Promise<string> {
  const role = await getUserRole();
  
  if (!role) {
    return "/login";
  }
  
  switch (role) {
    case "superadmin":
      return "/superadmin";
    case "admin":
      return "/admin";
    case "user":
      return "/dashboard";
    default:
      return "/";
  }
}

