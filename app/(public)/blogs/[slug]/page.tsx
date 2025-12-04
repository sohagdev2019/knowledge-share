import { notFound } from "next/navigation";
import { getBlogBySlug } from "@/app/data/blog/get-blogs";
import { getBlogComments } from "@/app/data/blog/get-blog-comments";
import { BlogDetail } from "./_components/BlogDetail";
import { BlogComments } from "./_components/BlogComments";
import { prisma } from "@/lib/db";

interface BlogPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BlogPage({ params }: BlogPageProps) {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);

  if (!blog || (blog.status !== "Approved" && blog.status !== "Published")) {
    notFound();
  }

  // Increment view count
  await prisma.blog.update({
    where: { id: blog.id },
    data: {
      viewCount: {
        increment: 1,
      },
    },
  });

  const comments = await getBlogComments(blog.id);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <BlogDetail blog={blog} />
            <BlogComments blogId={blog.id} initialComments={comments} />
          </div>
          <div className="lg:col-span-1">
            {/* Sidebar content can be added here */}
          </div>
        </div>
      </div>
    </div>
  );
}


