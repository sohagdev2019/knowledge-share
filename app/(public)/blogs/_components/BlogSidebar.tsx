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
    <div className="space-y-6 sm:space-y-8">
      {/* Featured Blogs */}
      {featuredBlogs.length > 0 && (
        <div className="bg-gradient-to-br from-card via-card to-card/50 border-2 border-border/50 rounded-2xl p-6 sm:p-8 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-gradient-to-br from-yellow-500/20 to-yellow-600/20">
              <Star className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500 shrink-0" />
            </div>
            <h3 className="font-black text-lg sm:text-xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Featured</h3>
          </div>
          <div className="space-y-4 sm:space-y-5">
            {featuredBlogs.map((blog) => (
              <Link
                key={blog.id}
                href={`/blogs/${blog.slug}`}
                className="block group p-3 rounded-xl hover:bg-primary/5 transition-all duration-300 hover:translate-x-1"
              >
                <h4 className="font-bold text-sm sm:text-base group-hover:text-primary transition-colors line-clamp-2">
                  {blog.title}
                </h4>
                <p className="text-xs text-muted-foreground mt-2 font-medium">
                  {formatDistanceToNow(new Date(blog.createdAt), { addSuffix: true })}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Trending Blogs */}
      {trendingBlogs.length > 0 && (
        <div className="bg-gradient-to-br from-card via-card to-card/50 border-2 border-border/50 rounded-2xl p-6 sm:p-8 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/20">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500 shrink-0" />
            </div>
            <h3 className="font-black text-lg sm:text-xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Trending</h3>
          </div>
          <div className="space-y-4 sm:space-y-5">
            {trendingBlogs.map((blog, index) => (
              <Link
                key={blog.id}
                href={`/blogs/${blog.slug}`}
                className="flex items-start gap-3 sm:gap-4 group p-3 rounded-xl hover:bg-primary/5 transition-all duration-300 hover:translate-x-1"
              >
                <span className="text-2xl sm:text-3xl font-black text-muted-foreground group-hover:text-primary transition-colors shrink-0 bg-gradient-to-br from-muted-foreground to-muted-foreground/50 group-hover:from-primary group-hover:to-primary/80 bg-clip-text text-transparent">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm sm:text-base group-hover:text-primary transition-colors line-clamp-2">
                    {blog.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground flex-wrap">
                    <span className="font-medium">{blog.viewCount} views</span>
                    <span>•</span>
                    <span className="font-medium">{blog.likeCount} likes</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <div className="bg-gradient-to-br from-card via-card to-card/50 border-2 border-border/50 rounded-2xl p-6 sm:p-8 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20">
              <Tag className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 shrink-0" />
            </div>
            <h3 className="font-black text-lg sm:text-xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Categories</h3>
          </div>
          <div className="space-y-2">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/blogs?category=${category.id}`}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-primary/5 transition-all duration-300 group border border-transparent hover:border-primary/20"
              >
                <span className="text-sm font-semibold group-hover:text-primary transition-colors truncate">
                  {category.name}
                </span>
                <span className="text-xs font-bold text-muted-foreground group-hover:text-primary shrink-0 ml-2 px-2 py-1 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
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



