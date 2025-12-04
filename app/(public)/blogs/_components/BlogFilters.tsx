"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search, Filter } from "lucide-react";
import { useState } from "react";

interface BlogFiltersProps {
  categories: Array<{ id: string; name: string; slug: string; _count: { blogs: number } }>;
  currentCategory?: string;
  currentSort?: string;
}

export function BlogFilters({ categories, currentCategory, currentSort }: BlogFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");

  const handleCategoryChange = (categoryId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (categoryId) {
      params.set("category", categoryId);
    } else {
      params.delete("category");
    }
    params.delete("page");
    router.push(`/blogs?${params.toString()}`);
  };

  const handleSortChange = (sort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", sort);
    params.delete("page");
    router.push(`/blogs?${sort ? `?${params.toString()}` : ""}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchQuery) {
      params.set("search", searchQuery);
    } else {
      params.delete("search");
    }
    params.delete("page");
    router.push(`/blogs?${params.toString()}`);
  };

  return (
    <div className="mb-8 space-y-4">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search blogs..."
          className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </form>

      <div className="flex flex-wrap items-center gap-4">
        {/* Category Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select
            value={currentCategory || ""}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name} ({category._count.blogs})
              </option>
            ))}
          </select>
        </div>

        {/* Sort Filter */}
        <select
          value={currentSort || "newest"}
          onChange={(e) => handleSortChange(e.target.value)}
          className="px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="newest">Newest</option>
          <option value="trending">Trending</option>
          <option value="most_liked">Most Liked</option>
          <option value="most_commented">Most Commented</option>
          <option value="most_viewed">Most Viewed</option>
        </select>
      </div>
    </div>
  );
}


