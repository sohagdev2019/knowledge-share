import { Suspense } from "react";
import { getBlogs, getBlogCategories, getFeaturedBlogs, getTrendingBlogs, getLatestBlogs } from "@/app/data/blog/get-blogs";
import { BlogFeed } from "./_components/BlogFeed";
import { BlogFilters } from "./_components/BlogFilters";
import { BlogHero } from "./_components/BlogHero";
import { BlogSidebar } from "./_components/BlogSidebar";

interface SearchParams {
  category?: string;
  search?: string;
  sort?: string;
  page?: string;
  error?: string;
  required?: string;
  current?: string;
}

export default async function BlogsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const categoryId = params.category;
  const search = params.search;
  const sortBy = (params.sort as any) || "newest";
  const page = parseInt(params.page || "1");
  const limit = 12;
  const offset = (page - 1) * limit;

  const [blogsData, categories, featuredBlogs, trendingBlogs] = await Promise.all([
    getBlogs({
      categoryId,
      search,
      sortBy,
      limit,
      offset,
    }),
    getBlogCategories(),
    getFeaturedBlogs(3),
    getTrendingBlogs(5),
  ]);

  const error = params.error;
  const required = params.required;
  const current = params.current;

  return (
    <div className="min-h-screen bg-background">
      <BlogHero />
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
        {error === "insufficient_points" && (
          <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
            <p className="font-semibold">Insufficient Points</p>
            <p className="text-sm mt-1">
              You need at least {required || 5} points to publish a blog. You currently have {current || 0} points.
            </p>
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <BlogFilters categories={categories} currentCategory={categoryId} currentSort={sortBy} />
            <Suspense fallback={<div>Loading blogs...</div>}>
              <BlogFeed blogs={blogsData.blogs} total={blogsData.total} currentPage={page} hasMore={blogsData.hasMore} />
            </Suspense>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <BlogSidebar featuredBlogs={featuredBlogs.blogs} trendingBlogs={trendingBlogs.blogs} categories={categories} />
          </div>
        </div>
      </div>
    </div>
  );
}


