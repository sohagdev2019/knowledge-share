"use client";

import Link from "next/link";
import Image from "next/image";
import { Clock, Heart, MessageCircle, Eye, User } from "lucide-react";
import { useConstructUrl } from "@/hooks/use-construct-url";
import { formatDistanceToNow } from "@/lib/date-utils";

interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImageKey: string | null;
  readingTime: number;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  createdAt: Date;
  author: {
    id: string;
    firstName: string;
    lastName: string | null;
    image: string | null;
    username: string | null;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
  tags: Array<{ id: string; name: string; slug: string }>;
}

interface BlogFeedProps {
  blogs: Blog[];
  total: number;
  currentPage: number;
  hasMore: boolean;
}

export function BlogFeed({ blogs, total, currentPage, hasMore }: BlogFeedProps) {
  const constructFileUrl = useConstructUrl();

  if (blogs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">No blogs found. Be the first to write one!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {blogs.map((blog) => (
          <Link
            key={blog.id}
            href={`/blogs/${blog.slug}`}
            className="group block bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300"
          >
            {blog.coverImageKey && (
              <div className="relative w-full h-48 overflow-hidden">
                <Image
                  src={constructFileUrl(blog.coverImageKey)}
                  alt={blog.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}
            <div className="p-6">
              {blog.category && (
                <span className="inline-block px-3 py-1 text-xs font-semibold bg-primary/10 text-primary rounded-full mb-3">
                  {blog.category.name}
                </span>
              )}
              <h2 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                {blog.title}
              </h2>
              {blog.excerpt && (
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{blog.excerpt}</p>
              )}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>
                      {blog.author.firstName} {blog.author.lastName}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{blog.readingTime} min</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span>{blog.viewCount}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    <span>{blog.likeCount}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" />
                    <span>{blog.commentCount}</span>
                  </div>
                </div>
              </div>
              <div className="mt-3 text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(blog.createdAt), { addSuffix: true })}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      {total > 12 && (
        <div className="flex justify-center gap-2 mt-8">
          {currentPage > 1 && (
            <Link
              href={`/blogs?page=${currentPage - 1}`}
              className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
            >
              Previous
            </Link>
          )}
          {hasMore && (
            <Link
              href={`/blogs?page=${currentPage + 1}`}
              className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
            >
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  );
}



