import { requireSuperAdmin } from "@/app/data/admin/require-superadmin";
import { prisma } from "@/lib/db";
import { UsersManagementTable } from "./_components/UsersManagementTable";

interface SearchParams {
  role?: string;
  page?: string;
  search?: string;
}

export default async function SuperAdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireSuperAdmin();
  const params = await searchParams;
  const role = params.role || "all";
  const page = parseInt(params.page || "1");
  const search = params.search || "";
  const limit = 20;
  const offset = (page - 1) * limit;

  // Build where clause
  const where: any = {};
  if (role !== "all") {
    where.role = role;
  }
  if (search) {
    where.OR = [
      { email: { contains: search, mode: "insensitive" } },
      { firstName: { contains: search, mode: "insensitive" } },
      { lastName: { contains: search, mode: "insensitive" } },
      { username: { contains: search, mode: "insensitive" } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        username: true,
        role: true,
        createdAt: true,
        emailVerified: true,
        banned: true,
        _count: {
          select: {
            enrollment: true,
            courses: true,
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

  return (
    <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">User Management</h1>
        <p className="text-muted-foreground">
          Manage students, admins, and teachers. Assign roles and permissions.
        </p>
      </div>
      <UsersManagementTable
        users={users}
        total={total}
        currentPage={page}
        role={role}
        search={search}
      />
    </div>
  );
}
