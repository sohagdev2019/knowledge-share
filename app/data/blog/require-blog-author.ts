import "server-only";
import { prisma } from "@/lib/db";
import { requireUser } from "@/app/data/user/require-user";
import { redirect } from "next/navigation";

export async function requireBlogAuthor(blogId: string) {
  const session = await requireUser();
  const blog = await prisma.blog.findUnique({
    where: { id: blogId },
    select: { authorId: true },
  });

  if (!blog) {
    redirect("/blogs");
  }

  if (blog.authorId !== session.user.id) {
    redirect("/blogs");
  }

  return session;
}














