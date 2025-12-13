import "server-only";
import { prisma } from "@/lib/db";

export type BlogStatus = "Pending" | "Approved" | "Rejected" | "Published";

export interface GetBlogsParams {
  status?: BlogStatus;
  categoryId?: string;
  authorId?: string;
  search?: string;
  featured?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: "newest" | "trending" | "most_liked" | "most_commented" | "most_viewed";
}

export async function getBlogs(params: GetBlogsParams = {}) {
  const {
    status = "Approved",
    categoryId,
    authorId,
    search,
    featured,
    limit = 20,
    offset = 0,
    sortBy = "newest",
  } = params;

  const where: any = {
    status: status === "Published" ? "Approved" : status,
    isDraft: false,
  };

  if (authorId) {
    where.authorId = authorId;
  }

  if (featured !== undefined) {
    where.isFeatured = featured;
  }

  // Handle search and categoryId together
  if (search) {
    const searchConditions = [
      { title: { contains: search, mode: "insensitive" } },
      { excerpt: { contains: search, mode: "insensitive" } },
      { content: { contains: search, mode: "insensitive" } },
    ];

    if (categoryId) {
      // When both categoryId and search are provided, use AND to combine them
      // This ensures we search within the selected category
      where.AND = [
        { categoryId },
        {
          OR: searchConditions,
        },
      ];
    } else {
      // If no categoryId, just use OR for search
      where.OR = searchConditions;
    }
  } else if (categoryId) {
    // If only categoryId is provided (no search), set it normally
    where.categoryId = categoryId;
  }

  const orderBy: any = {};
  switch (sortBy) {
    case "newest":
      orderBy.createdAt = "desc";
      break;
    case "trending":
      // Trending = combination of views, likes, and recency
      orderBy.viewCount = "desc";
      break;
    case "most_liked":
      orderBy.likeCount = "desc";
      break;
    case "most_commented":
      orderBy.commentCount = "desc";
      break;
    case "most_viewed":
      orderBy.viewCount = "desc";
      break;
  }

  const [blogs, total] = await Promise.all([
    prisma.blog.findMany({
      where,
      orderBy,
      take: limit,
      skip: offset,
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            image: true,
            username: true,
          },
        },
        category: true,
        tags: true,
        _count: {
          select: {
            comments: true,
            reactions: true,
          },
        },
      },
    }),
    prisma.blog.count({ where }),
  ]);

  // Get reaction counts for all blogs
  const blogIds = blogs.map((blog) => blog.id);
  const reactionCounts = await prisma.blogReaction.groupBy({
    by: ["blogId", "type"],
    where: {
      blogId: {
        in: blogIds,
      },
    },
    _count: {
      type: true,
    },
  });

  // Map reaction counts to blogs
  const blogsWithReactions = blogs.map((blog) => {
    const reactions = reactionCounts.filter((r) => r.blogId === blog.id);
    const reactionCountsByType = {
      Like: 0,
      Love: 0,
      Insightful: 0,
      Funny: 0,
    };

    reactions.forEach((reaction) => {
      reactionCountsByType[reaction.type as keyof typeof reactionCountsByType] =
        reaction._count.type;
    });

    return {
      ...blog,
      reactionCounts: reactionCountsByType,
    };
  });

  return {
    blogs: blogsWithReactions,
    total,
    hasMore: offset + limit < total,
  };
}

export async function getBlogBySlug(slug: string) {
  return prisma.blog.findUnique({
    where: { slug },
    include: {
      author: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          image: true,
          username: true,
          bio: true,
          points: true,
        },
      },
      category: true,
      tags: true,
      Course: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
      _count: {
        select: {
          comments: true,
          reactions: true,
        },
      },
    },
  });
}

export async function getTrendingBlogs(limit = 10) {
  return getBlogs({
    status: "Approved",
    limit,
    sortBy: "trending",
  });
}

export async function getLatestBlogs(limit = 10) {
  return getBlogs({
    status: "Approved",
    limit,
    sortBy: "newest",
  });
}

export async function getFeaturedBlogs(limit = 5) {
  return getBlogs({
    status: "Approved",
    featured: true,
    limit,
    sortBy: "newest",
  });
}

export async function getBlogCategories() {
  return prisma.blogCategory.findMany({
    orderBy: {
      name: "asc",
    },
    include: {
      _count: {
        select: {
          blogs: {
            where: {
              status: "Approved",
              isDraft: false,
            },
          },
        },
      },
    },
  });
}
