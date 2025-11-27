"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { IconStarFilled } from "@tabler/icons-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Review = {
  id: string;
  name: string;
  avatar: string;
  timeAgo: string;
  rating: number;
  content: string;
};

type ReviewsListProps = {
  reviews: readonly Review[];
  pageSize?: number;
};

export function ReviewsList({ reviews, pageSize = 3 }: ReviewsListProps) {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(reviews.length / pageSize);
  const pageReviews = reviews.slice((page - 1) * pageSize, page * pageSize);

  const handleNext = () => setPage((prev) => Math.min(prev + 1, totalPages));
  const handlePrev = () => setPage((prev) => Math.max(prev - 1, 1));
  const goToPage = (index: number) => setPage(index);

  return (
    <div className="space-y-4 rounded-3xl border border-border/60 bg-background shadow-lg shadow-black/5">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/50 px-6 py-5">
        <div>
          <h2 className="text-xl font-semibold">Reviews</h2>
          <p className="text-sm text-muted-foreground">
            Showing {pageReviews.length} of {reviews.length} responses
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            disabled={page === 1}
            className="rounded-full border border-border/60 px-3 py-1 text-xs font-medium text-muted-foreground transition hover:border-primary hover:text-primary disabled:opacity-40"
          >
            Previous
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                key={index}
                onClick={() => goToPage(index + 1)}
                className={`h-2.5 w-2.5 rounded-full transition ${
                  page === index + 1 ? "bg-primary" : "bg-border hover:bg-primary/60"
                }`}
              />
            ))}
          </div>
          <button
            onClick={handleNext}
            disabled={page === totalPages}
            className="rounded-full border border-border/60 px-3 py-1 text-xs font-medium text-muted-foreground transition hover:border-primary hover:text-primary disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
      <div className="grid gap-6 px-6 pb-6 md:grid-cols-2">
        {pageReviews.map((review, index) => (
          <motion.article
            key={review.id}
            className="flex h-full flex-col gap-4 rounded-2xl border border-border/40 bg-gradient-to-br from-background via-background/95 to-background p-5 shadow-lg shadow-black/10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.35 }}
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 border border-border/50">
                  <AvatarImage src={review.avatar} alt={review.name} />
                  <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                    {review.name
                      .split(" ")
                      .map((part) => part[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{review.name}</p>
                  <p className="text-sm text-muted-foreground">{review.timeAgo}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, starIndex) => (
                  <IconStarFilled
                    key={starIndex}
                    className={`size-4 ${
                      starIndex < review.rating ? "text-amber-400" : "text-border"
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">{review.content}</p>
          </motion.article>
        ))}
      </div>
    </div>
  );
}

