import { notFound } from "next/navigation";
import { getBlogBySlug } from "@/app/data/blog/get-blogs";
import { getBlogComments } from "@/app/data/blog/get-blog-comments";
import { BlogDetail } from "./_components/BlogDetail";
import { BlogComments } from "./_components/BlogComments";
import { getUserRole } from "@/app/data/admin/get-user-role";

interface BlogPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BlogPage({ params }: BlogPageProps) {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);
  const userRole = await getUserRole();
  const isSuperAdmin = userRole === "superadmin";

  if (!blog) {
    notFound();
  }

  // Allow superadmin to preview any blog, including pending/rejected ones
  // Regular users can only see Approved or Published blogs
  if (!isSuperAdmin && blog.status !== "Approved" && blog.status !== "Published") {
    notFound();
  }

  // View count will be tracked via API endpoint to prevent duplicate counts
  // This is handled client-side to use cookies for tracking unique views

  const comments = await getBlogComments(blog.id);

  const isPreview = isSuperAdmin && blog.status !== "Approved" && blog.status !== "Published";

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
        {isPreview && (
          <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
              <span className="font-semibold">👁️ Preview Mode</span>
              <span className="text-sm">This blog is in &quot;{blog.status}&quot; status and is only visible to superadmin.</span>
            </div>
          </div>
        )}
        <div className="w-full">
          <BlogDetail blog={blog} />
          <BlogComments blogId={blog.id} initialComments={comments} />
        </div>
      </div>
    </div>
  );
}



