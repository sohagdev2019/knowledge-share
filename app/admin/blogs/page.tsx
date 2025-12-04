import { requireAdmin } from "@/app/data/admin/require-admin";
import { getBlogs } from "@/app/data/blog/get-blogs";
import { BlogStatus } from "@/lib/generated/prisma";
import { BlogManagementTable } from "./_components/BlogManagementTable";

interface SearchParams {
  status?: string;
  page?: string;
}

export default async function AdminBlogsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const status = (params.status as BlogStatus) || BlogStatus.Pending;
  const page = parseInt(params.page || "1");
  const limit = 20;
  const offset = (page - 1) * limit;

  const blogsData = await getBlogs({
    status,
    limit,
    offset,
    sortBy: "newest",
  });

  return (
    <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Blog Management</h1>
        <p className="text-muted-foreground">Approve, reject, edit, and manage blog posts</p>
      </div>
      <BlogManagementTable blogs={blogsData.blogs} total={blogsData.total} currentPage={page} status={status} />
    </div>
  );
}


