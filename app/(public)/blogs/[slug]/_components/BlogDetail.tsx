"use client";

import Image from "next/image";
import { Clock, Eye, User, Calendar } from "lucide-react";
import { formatDistanceToNow } from "@/lib/date-utils";
import { generateHTML } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";
import { BlogReactions } from "./BlogReactions";
import { useEffect, useState } from "react";
import { env } from "@/lib/env";

interface BlogDetailProps {
  blog: {
    id: string;
    title: string;
    slug: string;
    content: string;
    excerpt: string | null;
    coverImageKey: string | null;
    readingTime: number;
    viewCount: number;
    likeCount: number;
    commentCount: number;
    createdAt: Date;
    publishedAt: Date | null;
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
  };
}

export function BlogDetail({ blog }: BlogDetailProps) {
  const constructFileUrl = (key: string) => {
    if (!key) return "";
    return `https://${env.NEXT_PUBLIC_S3_BUCKET_NAME_IMAGES}.fly.storage.tigris.dev/${key}`;
  };
  const [htmlContent, setHtmlContent] = useState<string>("");
  const [viewCount, setViewCount] = useState(blog.viewCount);

  // Parse and render content
  useEffect(() => {
    try {
      const contentJson = JSON.parse(blog.content);
      const html = generateHTML(contentJson, [StarterKit]);
      setHtmlContent(html);
    } catch {
      setHtmlContent(blog.content);
    }
  }, [blog.content]);

  // Track view count (only once per user/session)
  useEffect(() => {
    const trackView = async () => {
      try {
        const response = await fetch(`/api/blogs/${blog.id}/views`, {
          method: "POST",
        });
        if (response.ok) {
          const data = await response.json();
          if (data.counted) {
            setViewCount((prev) => prev + 1);
          }
        }
      } catch (error) {
        console.error("Error tracking view:", error);
      }
    };

    trackView();
  }, [blog.id]);

  return (
    <article className="bg-card border border-border rounded-xl overflow-hidden">
      {blog.coverImageKey && (
        <div className="relative w-full h-64 md:h-96 overflow-hidden">
          <Image
            src={constructFileUrl(blog.coverImageKey)}
            alt={blog.title}
            fill
            className="object-cover"
          />
        </div>
      )}

      <div className="p-6 md:p-8">
        {/* Category */}
        {blog.category && (
          <span className="inline-block px-3 py-1 text-xs font-semibold bg-primary/10 text-primary rounded-full mb-4">
            {blog.category.name}
          </span>
        )}

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-black text-foreground mb-4">
          {blog.title}
        </h1>

        {/* Meta Information */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6 pb-6 border-b">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>
              {blog.author.firstName} {blog.author.lastName}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>
              {formatDistanceToNow(
                blog.publishedAt ? new Date(blog.publishedAt) : new Date(blog.createdAt),
                { addSuffix: true }
              )}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{blog.readingTime} min read</span>
          </div>
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            <span>{viewCount} views</span>
          </div>
        </div>

        {/* Excerpt */}
        {blog.excerpt && (
          <p className="text-lg text-muted-foreground mb-6 italic">{blog.excerpt}</p>
        )}

        {/* Content */}
        <div
          className="prose prose-lg dark:prose-invert max-w-none mb-8"
          dangerouslySetInnerHTML={{ __html: htmlContent || blog.content }}
        />

        {/* Tags */}
        {blog.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {blog.tags.map((tag) => (
              <span
                key={tag.id}
                className="px-3 py-1 text-sm bg-muted text-muted-foreground rounded-full"
              >
                #{tag.name}
              </span>
            ))}
          </div>
        )}

        {/* Reactions */}
        <BlogReactions blogId={blog.id} initialLikeCount={blog.likeCount} />
      </div>
    </article>
  );
}



