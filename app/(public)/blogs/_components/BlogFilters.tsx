"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search, Filter } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface BlogFiltersProps {
  categories: Array<{ id: string; name: string; slug: string; _count: { blogs: number } }>;
  currentCategory?: string;
  currentSort?: string;
}

export function BlogFilters({ categories, currentCategory, currentSort }: BlogFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isUserInputRef = useRef(false);

  // Sync search query with URL params when they change (from external sources like browser back/forward)
  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    // Only update if it's different and not from user input
    if (urlSearch !== searchQuery) {
      if (!isUserInputRef.current) {
        setSearchQuery(urlSearch);
      }
      // Reset the flag after checking
      isUserInputRef.current = false;
    }
  }, [searchParams]);

  // Debounced search function
  const performSearch = (query: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (query.trim()) {
      params.set("search", query.trim());
    } else {
      params.delete("search");
    }
    params.delete("page");
    // Preserve category when searching
    if (currentCategory) {
      params.set("category", currentCategory);
    }
    router.push(`/blogs?${params.toString()}`);
  };

  // Auto-search on type with debounce
  useEffect(() => {
    // Skip on initial mount
    const urlSearch = searchParams.get("search") || "";
    if (searchQuery === urlSearch) {
      return;
    }

    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set a new timer for debounced search
    debounceTimerRef.current = setTimeout(() => {
      performSearch(searchQuery);
    }, 500); // 500ms debounce delay

    // Cleanup function
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery]); // Only depend on searchQuery

  const handleCategoryChange = (categoryId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (categoryId) {
      params.set("category", categoryId);
    } else {
      params.delete("category");
    }
    params.delete("page");
    // Preserve search query when changing category
    if (searchQuery) {
      params.set("search", searchQuery);
    }
    router.push(`/blogs?${params.toString()}`);
  };

  const handleSortChange = (sort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", sort);
    params.delete("page");
    // Preserve search and category when changing sort
    if (searchQuery) {
      params.set("search", searchQuery);
    }
    if (currentCategory) {
      params.set("category", currentCategory);
    }
    router.push(`/blogs?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Clear any pending debounced search
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    // Perform immediate search on Enter
    performSearch(searchQuery);
  };

  return (
    <div className="mb-8 sm:mb-12 space-y-6">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
          <Search className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground group-focus-within:text-primary transition-colors duration-300" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            isUserInputRef.current = true;
            setSearchQuery(e.target.value);
          }}
          placeholder="Search blogs..."
          className="w-full pl-12 sm:pl-14 pr-4 py-3 sm:py-4 text-sm sm:text-base border-2 border-border/50 rounded-xl bg-gradient-to-br from-background to-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-300 shadow-lg hover:shadow-xl"
        />
      </form>

      <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-4 sm:gap-4">
        {/* Category Filter */}
        <div className="flex items-center gap-3 flex-1 sm:flex-initial min-w-0 p-3 rounded-xl bg-gradient-to-br from-card to-card/50 border-2 border-border/50 shadow-md">
          <div className="p-2 rounded-lg bg-primary/10">
            <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
          </div>
          <select
            value={currentCategory || ""}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="flex-1 sm:flex-initial px-3 sm:px-4 py-2 text-sm sm:text-base border-0 rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/50 font-semibold min-w-0 cursor-pointer"
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
        <div className="p-3 rounded-xl bg-gradient-to-br from-card to-card/50 border-2 border-border/50 shadow-md">
          <select
            value={currentSort || "newest"}
            onChange={(e) => handleSortChange(e.target.value)}
            className="px-3 sm:px-4 py-2 text-sm sm:text-base border-0 rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/50 w-full sm:w-auto font-semibold cursor-pointer"
          >
            <option value="newest">Newest</option>
            <option value="trending">Trending</option>
            <option value="most_liked">Most Liked</option>
            <option value="most_commented">Most Commented</option>
            <option value="most_viewed">Most Viewed</option>
          </select>
        </div>
      </div>
    </div>
  );
}



