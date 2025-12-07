import Link from "next/link";
import { TrendingUp, Star, Tag } from "lucide-react";
import { formatDistanceToNow } from "@/lib/date-utils";

interface BlogSidebarProps {
  featuredBlogs: Array<{
    id: string;
    title: string;
    slug: string;
    createdAt: Date;
  }>;
  trendingBlogs: Array<{
    id: string;
    title: string;
    slug: string;
    viewCount: number;
    likeCount: number;
    createdAt: Date;
  }>;
  categories: Array<{
    id: string;
    name: string;
    slug: string;
    _count: { blogs: number };
  }>;
}

export function BlogSidebar({ featuredBlogs, trendingBlogs, categories }: BlogSidebarProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Featured Blogs */}
      {featuredBlogs.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
            <h3 className="font-bold text-base sm:text-lg">Featured</h3>
          </div>
          <div className="space-y-3 sm:space-y-4">
            {featuredBlogs.map((blog) => (
              <Link
                key={blog.id}
                href={`/blogs/${blog.slug}`}
                className="block group"
              >
                <h4 className="font-semibold text-sm group-hover:text-primary transition-colors line-clamp-2">
                  {blog.title}
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(blog.createdAt), { addSuffix: true })}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Trending Blogs */}
      {trendingBlogs.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
            <h3 className="font-bold text-base sm:text-lg">Trending</h3>
          </div>
          <div className="space-y-3 sm:space-y-4">
            {trendingBlogs.map((blog, index) => (
              <Link
                key={blog.id}
                href={`/blogs/${blog.slug}`}
                className="flex items-start gap-2 sm:gap-3 group"
              >
                <span className="text-xl sm:text-2xl font-bold text-muted-foreground group-hover:text-primary transition-colors shrink-0">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm group-hover:text-primary transition-colors line-clamp-2">
                    {blog.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground flex-wrap">
                    <span>{blog.viewCount} views</span>
                    <span>•</span>
                    <span>{blog.likeCount} likes</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Tag className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
            <h3 className="font-bold text-base sm:text-lg">Categories</h3>
          </div>
          <div className="space-y-2">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/blogs?category=${category.id}`}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors group"
              >
                <span className="text-sm group-hover:text-primary transition-colors truncate">
                  {category.name}
                </span>
                <span className="text-xs text-muted-foreground shrink-0 ml-2">
                  {category._count.blogs}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}



