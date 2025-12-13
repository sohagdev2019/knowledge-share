"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { BlogFeed } from "./BlogFeed";
import { BlogSkeleton } from "./BlogSkeleton";

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

interface BlogFeedWrapperProps {
  blogs: Blog[];
  total: number;
  currentPage: number;
  hasMore: boolean;
}

export function BlogFeedWrapper({ blogs, total, currentPage, hasMore }: BlogFeedWrapperProps) {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const prevSearchKeyRef = useRef<string>("");
  const prevBlogsRef = useRef<Blog[]>([]);

  // Create a key from search params to detect changes
  const currentSearchKey = `${searchParams.get("search") || ""}-${searchParams.get("category") || ""}-${searchParams.get("sort") || ""}-${searchParams.get("page") || "1"}`;

  useEffect(() => {
    // Initialize on first render
    if (prevSearchKeyRef.current === "") {
      prevSearchKeyRef.current = currentSearchKey;
      prevBlogsRef.current = blogs;
      return;
    }

    // Check if search params changed
    if (currentSearchKey !== prevSearchKeyRef.current) {
      setIsLoading(true);
      prevSearchKeyRef.current = currentSearchKey;
    }
  }, [currentSearchKey]);

  useEffect(() => {
    // Check if blogs data has changed (new data loaded from server)
    const blogsChanged = 
      blogs.length !== prevBlogsRef.current.length ||
      (blogs.length > 0 && prevBlogsRef.current.length > 0 && blogs[0]?.id !== prevBlogsRef.current[0]?.id) ||
      (blogs.length === 0 && prevBlogsRef.current.length > 0);

    if (blogsChanged) {
      if (isLoading) {
        // New data loaded, hide loading after a brief moment for smooth transition
        const timer = setTimeout(() => {
          setIsLoading(false);
        }, 150);
        prevBlogsRef.current = blogs;
        return () => clearTimeout(timer);
      } else {
        prevBlogsRef.current = blogs;
      }
    }
  }, [blogs, isLoading]);

  // Show skeleton during loading
  if (isLoading) {
    return <BlogSkeleton />;
  }

  return <BlogFeed blogs={blogs} total={total} currentPage={currentPage} hasMore={hasMore} />;
}

