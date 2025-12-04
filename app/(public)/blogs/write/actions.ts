"use server";

import { prisma } from "@/lib/db";
import { requireUser } from "@/app/data/user/require-user";
import { blogSchema, BlogSchemaType } from "@/lib/zodSchemas";
import slugify from "slugify";
import { generateHTML } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";

const ADMIN_FREE_POSTS = 10;
const USER_FREE_POSTS = 5;
const POINTS_REQUIRED = 5;

function calculateReadingTime(content: string): number {
  // Parse HTML and count words
  const textContent = content.replace(/<[^>]*>/g, "");
  const words = textContent.split(/\s+/).filter((word) => word.length > 0);
  const wordsPerMinute = 200;
  return Math.ceil(words.length / wordsPerMinute) || 1;
}

export async function createBlog(data: BlogSchemaType) {
  try {
    const userSession = await requireUser();
    const validatedData = blogSchema.parse(data);

    // Fetch user data
    const user = await prisma.user.findUnique({
      where: { id: userSession.id },
      select: { 
        points: true,
        role: true,
      },
    });

    if (!user) {
      return {
        status: "error" as const,
        message: "User not found. Please try again.",
      };
    }

    const isAdmin = user.role === "admin";
    const freePostsLimit = isAdmin ? ADMIN_FREE_POSTS : USER_FREE_POSTS;

    // Count published blogs (not drafts, only Published/Approved status)
    const publishedBlogsCount = await prisma.blog.count({
      where: {
        authorId: userSession.id,
        isDraft: false,
        status: {
          in: ["Published", "Approved"],
        },
      },
    });

    const remainingFreePosts = Math.max(0, freePostsLimit - publishedBlogsCount);
    const needsPoints = remainingFreePosts === 0;

    // Check if user has enough points (only if free posts are exhausted)
    if (needsPoints && user.points < POINTS_REQUIRED) {
      return {
        status: "error" as const,
        message: `You need at least ${POINTS_REQUIRED} points to publish a blog. You have ${user.points} points.`,
      };
    }

    // Generate slug
    const baseSlug = slugify(validatedData.title, { lower: true, strict: true });
    let slug = baseSlug;
    let slugExists = await prisma.blog.findUnique({ where: { slug } });

    // If slug exists, append a number
    let counter = 1;
    while (slugExists) {
      slug = `${baseSlug}-${counter}`;
      slugExists = await prisma.blog.findUnique({ where: { slug } });
      counter++;
    }

    // Parse content to calculate reading time
    let contentHtml = "";
    try {
      const contentJson = JSON.parse(validatedData.content);
      contentHtml = generateHTML(contentJson, [StarterKit]);
    } catch {
      contentHtml = validatedData.content;
    }

    const readingTime = calculateReadingTime(contentHtml);

    // Determine if points should be deducted
    const shouldDeductPoints = !validatedData.isDraft && needsPoints;
    const pointsToDeduct = shouldDeductPoints ? POINTS_REQUIRED : 0;

    // Create blog
    const blog = await prisma.blog.create({
      data: {
        title: validatedData.title,
        slug,
        content: validatedData.content, // Store JSON content
        excerpt: validatedData.excerpt || null,
        coverImageKey: validatedData.coverImageKey || null,
        seoTitle: validatedData.seoTitle || null,
        seoDescription: validatedData.seoDescription || null,
        readingTime,
        status: validatedData.isDraft ? "Pending" : "Pending", // All blogs need approval
        isDraft: validatedData.isDraft,
        pointsRequired: POINTS_REQUIRED,
        pointsSpent: pointsToDeduct, // Only deduct if publishing and free posts exhausted
        authorId: userSession.id,
        categoryId: validatedData.categoryId || null,
        courseId: validatedData.courseId || null,
        publishedAt: validatedData.isDraft ? null : new Date(),
        tags: {
          create: validatedData.tags.map((tagName) => ({
            name: tagName,
            slug: slugify(tagName, { lower: true, strict: true }),
          })),
        },
      },
    });

    // Deduct points if publishing and free posts are exhausted
    if (shouldDeductPoints) {
      await prisma.user.update({
        where: { id: userSession.id },
        data: {
          points: {
            decrement: POINTS_REQUIRED,
          },
        },
      });
    }

    return {
      status: "success" as const,
      message: validatedData.isDraft
        ? "Draft saved successfully!"
        : "Blog submitted for review! It will be published after admin approval.",
      slug: blog.slug,
    };
  } catch (error: any) {
    console.error("Error creating blog:", error);
    return {
      status: "error" as const,
      message: error.message || "Failed to create blog. Please try again.",
    };
  }
}


