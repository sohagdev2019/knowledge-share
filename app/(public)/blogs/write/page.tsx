import { redirect } from "next/navigation";
import { requireUser } from "@/app/data/user/require-user";
import { getBlogCategories } from "@/app/data/blog/get-blog-categories";
import { BlogWriteForm } from "./_components/BlogWriteForm";
import { prisma } from "@/lib/db";

const ADMIN_FREE_POSTS = 10;
const USER_FREE_POSTS = 5;
const POINTS_REQUIRED = 5;

export default async function BlogWritePage() {
  const user = await requireUser();
  const categories = await getBlogCategories();

  // Fetch user data from database
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { 
      points: true,
      role: true,
    },
  });

  const userPoints = dbUser?.points ?? 0;
  const isAdmin = dbUser?.role === "admin";
  const freePostsLimit = isAdmin ? ADMIN_FREE_POSTS : USER_FREE_POSTS;

  // Count published blogs (not drafts, only Published/Approved status)
  const publishedBlogsCount = await prisma.blog.count({
    where: {
      authorId: user.id,
      isDraft: false,
      status: {
        in: ["Published", "Approved"],
      },
    },
  });

  const remainingFreePosts = Math.max(0, freePostsLimit - publishedBlogsCount);
  const needsPoints = remainingFreePosts === 0;

  // Check if user has enough points (only if free posts are exhausted)
  if (needsPoints && userPoints < POINTS_REQUIRED) {
    redirect(`/blogs?error=insufficient_points&required=${POINTS_REQUIRED}&current=${userPoints}`);
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Write a Blog Post</h1>
          <p className="text-muted-foreground">
            {remainingFreePosts > 0 ? (
              <>Share your knowledge with the community. You have <strong>{remainingFreePosts}</strong> free post{remainingFreePosts !== 1 ? 's' : ''} remaining.</>
            ) : (
              <>Share your knowledge with the community. You have {userPoints} points.</>
            )}
          </p>
        </div>
        <BlogWriteForm categories={categories} userPoints={userPoints} remainingFreePosts={remainingFreePosts} />
      </div>
    </div>
  );
}


