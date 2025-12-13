"use client";

import Link from "next/link";
import Image from "next/image";
import { Clock, Heart, MessageCircle, Eye, User, Lightbulb, Laugh } from "lucide-react";
import { useConstructUrl } from "@/hooks/use-construct-url";
import { formatDistanceToNow } from "@/lib/date-utils";
import { useSearchParams } from "next/navigation";

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
  reactionCounts?: {
    Like: number;
    Love: number;
    Insightful: number;
    Funny: number;
  };
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
  const constructFileUrl = (key: string) => useConstructUrl(key);
  const searchParams = useSearchParams();

  // Build URL with preserved filters
  const buildPaginationUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    return `/blogs?${params.toString()}`;
  };

  if (blogs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">No blogs found. Be the first to write one!</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {blogs.map((blog) => (
          <Link
            key={blog.id}
            href={`/blogs/${blog.slug}`}
            className="group block bg-gradient-to-br from-card via-card to-card/50 border-2 border-border/50 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 hover:border-primary/30 transition-all duration-500 w-full"
          >
            {blog.coverImageKey && (
              <div className="relative w-full h-48 sm:h-56 md:h-64 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
                <Image
                  src={constructFileUrl(blog.coverImageKey)}
                  alt={blog.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
            )}
            <div className="p-6 sm:p-8">
              {blog.category && (
                <span className="inline-block px-4 py-1.5 text-xs font-bold bg-gradient-to-r from-primary/20 to-primary/10 text-primary rounded-full mb-4 border border-primary/20 group-hover:from-primary/30 group-hover:to-primary/20 transition-all duration-300">
                  {blog.category.name}
                </span>
              )}
              <h2 className="text-xl sm:text-2xl font-black text-foreground mb-3 group-hover:text-primary transition-all duration-300 line-clamp-2 bg-gradient-to-r from-foreground to-foreground/70 group-hover:from-primary group-hover:to-primary/80 bg-clip-text text-transparent">
                {blog.title}
              </h2>
              {blog.excerpt && (
                <p className="text-muted-foreground text-sm md:text-base mb-5 line-clamp-2 leading-relaxed">{blog.excerpt}</p>
              )}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs text-muted-foreground pt-4 border-t border-border/30 group-hover:border-primary/20 transition-colors duration-300">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2 p-1.5 rounded-lg bg-muted/50 group-hover:bg-primary/5 transition-colors duration-300">
                    <User className="w-4 h-4 shrink-0 text-primary" />
                    <span className="truncate max-w-[120px] sm:max-w-none font-medium">
                      {blog.author.firstName} {blog.author.lastName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 p-1.5 rounded-lg bg-muted/50 group-hover:bg-primary/5 transition-colors duration-300">
                    <Clock className="w-4 h-4 shrink-0 text-primary" />
                    <span className="font-medium">{blog.readingTime} min</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-muted/50 group-hover:bg-primary/5 transition-colors duration-300">
                    <Eye className="w-4 h-4 shrink-0 text-primary" />
                    <span className="font-medium">{blog.viewCount}</span>
                  </div>
                  {blog.reactionCounts && (
                    <>
                      {blog.reactionCounts.Like > 0 && (
                        <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-muted/50 group-hover:bg-primary/5 transition-colors duration-300" title="Likes">
                          <Heart className="w-4 h-4 shrink-0 text-primary" />
                          <span className="font-medium">{blog.reactionCounts.Like}</span>
                        </div>
                      )}
                      {blog.reactionCounts.Love > 0 && (
                        <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-muted/50 group-hover:bg-pink-500/10 transition-colors duration-300" title="Love">
                          <Heart className="w-4 h-4 shrink-0 fill-pink-500 text-pink-500" />
                          <span className="font-medium">{blog.reactionCounts.Love}</span>
                        </div>
                      )}
                      {blog.reactionCounts.Insightful > 0 && (
                        <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-muted/50 group-hover:bg-yellow-500/10 transition-colors duration-300" title="Insightful">
                          <Lightbulb className="w-4 h-4 shrink-0 text-yellow-500" />
                          <span className="font-medium">{blog.reactionCounts.Insightful}</span>
                        </div>
                      )}
                      {blog.reactionCounts.Funny > 0 && (
                        <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-muted/50 group-hover:bg-orange-500/10 transition-colors duration-300" title="Funny">
                          <Laugh className="w-4 h-4 shrink-0 text-orange-500" />
                          <span className="font-medium">{blog.reactionCounts.Funny}</span>
                        </div>
                      )}
                    </>
                  )}
                  {!blog.reactionCounts && blog.likeCount > 0 && (
                    <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-muted/50 group-hover:bg-primary/5 transition-colors duration-300">
                      <Heart className="w-4 h-4 shrink-0 text-primary" />
                      <span className="font-medium">{blog.likeCount}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-muted/50 group-hover:bg-primary/5 transition-colors duration-300">
                    <MessageCircle className="w-4 h-4 shrink-0 text-primary" />
                    <span className="font-medium">{blog.commentCount}</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 text-xs text-muted-foreground font-medium">
                {formatDistanceToNow(new Date(blog.createdAt), { addSuffix: true })}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      {total > 12 && (
        <div className="flex justify-center gap-3 mt-12">
          {currentPage > 1 && (
            <Link
              href={buildPaginationUrl(currentPage - 1)}
              className="px-6 py-3 border-2 border-border rounded-xl hover:bg-primary/10 hover:border-primary/30 font-semibold transition-all duration-300 hover:scale-105"
            >
              Previous
            </Link>
          )}
          {hasMore && (
            <Link
              href={buildPaginationUrl(currentPage + 1)}
              className="px-6 py-3 border-2 border-primary bg-gradient-to-r from-primary to-primary/90 text-primary-foreground rounded-xl hover:from-primary hover:to-primary font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-primary/30"
            >
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  );
}



