import "server-only";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function checkCallPermission(streamCallId: string): Promise<{
  canJoin: boolean;
  isAdmin: boolean;
  isCourseOwner: boolean;
  isCreator: boolean;
  hasAcceptedRequest: boolean;
  requestStatus?: "Pending" | "Accepted" | "Rejected" | "Completed";
  requestId?: string;
  supportCall?: {
    id: string;
    title: string | null;
    description: string | null;
    status: string;
    streamCallId: string | null;
  };
  userRequest?: {
    id: string;
    status: string;
    supportType: string;
  } | null;
}> {
  const session = await auth();

  if (!session?.user) {
    return {
      canJoin: false,
      isAdmin: false,
      isCourseOwner: false,
      isCreator: false,
      hasAcceptedRequest: false,
    };
  }

  const userId = session.user.id;
  const userRole = (session.user as { role?: string }).role;

  // Get the support call
  const supportCall = await prisma.supportCall.findUnique({
    where: { streamCallId },
    include: {
      Course: true,
      Creator: true,
      requests: {
        where: {
          userId,
        },
      },
    },
  });

  if (!supportCall) {
    return {
      canJoin: false,
      isAdmin: false,
      isCourseOwner: false,
      isCreator: false,
      hasAcceptedRequest: false,
    };
  }

  const isAdmin = userRole === "admin";
  const isCourseOwner = supportCall.Course.userId === userId;
  const isCreator = supportCall.createdBy === userId;

  const userRequest = supportCall.requests[0] || null;

  // Admin, course owner, or creator can always join
  if (isAdmin || isCourseOwner || isCreator) {
    return {
      canJoin: true,
      isAdmin,
      isCourseOwner,
      isCreator,
      hasAcceptedRequest: true,
      supportCall: {
        id: supportCall.id,
        title: supportCall.title,
        description: supportCall.description,
        status: supportCall.status,
        streamCallId: supportCall.streamCallId,
      },
      userRequest: userRequest ? {
        id: userRequest.id,
        status: userRequest.status,
        supportType: userRequest.supportType,
      } : null,
    };
  }

  // For normal users, check if they have an accepted request
  const hasAcceptedRequest = userRequest?.status === "Accepted";

  return {
    canJoin: hasAcceptedRequest,
    isAdmin: false,
    isCourseOwner: false,
    isCreator: false,
    hasAcceptedRequest,
    requestStatus: userRequest?.status,
    requestId: userRequest?.id,
    supportCall: {
      id: supportCall.id,
      title: supportCall.title,
      description: supportCall.description,
      status: supportCall.status,
      streamCallId: supportCall.streamCallId,
    },
    userRequest: userRequest ? {
      id: userRequest.id,
      status: userRequest.status,
      supportType: userRequest.supportType,
    } : null,
  };
}

