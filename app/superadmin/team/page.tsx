import { prisma } from "@/lib/db";
import { TeamPageClient } from "./_components/TeamPageClient";

interface SearchParams {
  page?: string;
  search?: string;
}

export default async function SuperAdminTeamPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  // requireSuperAdmin is already called in layout, no need to call again
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const search = params.search || "";
  const limit = 20;
  const offset = (page - 1) * limit;

  // Get or create default workspace
  let workspace = await prisma.workspace.findUnique({
    where: { slug: "default" },
  });

  if (!workspace) {
    workspace = await prisma.workspace.create({
      data: {
        name: "Default Workspace",
        slug: "default",
      },
    });
  }

  // Build where clause for user search
  const where: any = {};
  if (search) {
    where.OR = [
      { email: { contains: search, mode: "insensitive" } },
      { firstName: { contains: search, mode: "insensitive" } },
      { lastName: { contains: search, mode: "insensitive" } },
      { username: { contains: search, mode: "insensitive" } },
    ];
  }

  // Get users with pagination
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        username: true,
        image: true,
        createdAt: true,
        emailVerified: true,
        memberships: {
          where: { workspaceId: workspace.id },
          select: {
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      skip: offset,
    }),
    prisma.user.count({ where }),
  ]);

  // Get pending invitations
  const pendingInvitations = await prisma.invitation.findMany({
    where: {
      workspaceId: workspace.id,
      status: "Pending",
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          username: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Get active superadmins
  const activeSuperAdmins = await prisma.membership.findMany({
    where: {
      workspaceId: workspace.id,
      role: "SuperAdmin",
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          username: true,
          image: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <TeamPageClient
      users={users.map((u) => ({
        ...u,
        membershipRole: u.memberships[0]?.role || null,
      }))}
      total={total}
      currentPage={page}
      search={search}
      pendingInvitations={pendingInvitations}
      activeSuperAdmins={activeSuperAdmins.map((m) => ({
        ...m.user,
        membershipRole: m.role,
        joinedAt: m.createdAt,
      }))}
      workspaceId={workspace.id}
    />
  );
}
