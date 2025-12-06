import "server-only";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

/**
 * Check if user can join a support call directly (admin or course owner)
 */
export async function canJoinSupportCallDirectly(
  supportCallId: string
): Promise<boolean> {
  const session = await auth();

  if (!session?.user) {
    return false;
  }

  const user = session.user as { role?: string; id: string };

  // Check if user is admin
  if (user.role === "admin") {
    return true;
  }

  // Check if user is course owner
  const supportCall = await prisma.supportCall.findUnique({
    where: { id: supportCallId },
    include: {
      Course: {
        select: {
          userId: true,
        },
      },
      Creator: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!supportCall) {
    return false;
  }

  // User is course owner or session creator
  return (
    supportCall.Course.userId === user.id ||
    supportCall.Creator.id === user.id
  );
}

/**
 * Check if user has an accepted request to join
 */
export async function hasAcceptedRequest(
  supportCallId: string,
  userId: string
): Promise<boolean> {
  const request = await prisma.supportCallRequest.findUnique({
    where: {
      supportCallId_userId: {
        supportCallId,
        userId,
      },
    },
    select: {
      status: true,
    },
  });

  return request?.status === "Accepted";
}

/**
 * Check if user can join (either directly or via accepted request)
 */
export async function canJoinSupportCall(
  supportCallId: string
): Promise<{ canJoin: boolean; reason?: string }> {
  const session = await auth();

  if (!session?.user) {
    return { canJoin: false, reason: "Not authenticated" };
  }

  const user = session.user as { id: string };

  // Check if can join directly
  const canJoinDirectly = await canJoinSupportCallDirectly(supportCallId);
  if (canJoinDirectly) {
    return { canJoin: true };
  }

  // Check if has accepted request
  const hasAccepted = await hasAcceptedRequest(supportCallId, user.id);
  if (hasAccepted) {
    return { canJoin: true };
  }

  return {
    canJoin: false,
    reason: "You need to request permission to join this session",
  };
}

/**
 * Get support call by stream call ID with permission check
 */
export async function getSupportCallByStreamIdWithPermission(
  streamCallId: string
) {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  const supportCall = await prisma.supportCall.findUnique({
    where: { streamCallId },
    include: {
      Course: {
        select: {
          id: true,
          userId: true,
        },
      },
      Creator: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      requests: {
        where: {
          userId: (session.user as { id: string }).id,
        },
        select: {
          id: true,
          status: true,
          supportType: true,
        },
      },
    },
  });

  return supportCall;
}






