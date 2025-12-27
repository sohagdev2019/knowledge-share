"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Star, ThumbsUp, ThumbsDown, MoreVertical, Flag, EyeOff } from "lucide-react";
import { useState, useEffect } from "react";
import { ReviewsModal } from "./ReviewsModal";
import { env } from "@/lib/env";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  user: {
    id: string;
    firstName: string;
    lastName: string | null;
    image: string | null;
  };
}

interface CourseRatingSectionProps {
  averageRating: number;
  totalRatings: number;
  courseId: string;
  courseOwnerId: string;
}

export function CourseRatingSection({
  averageRating,
  totalRatings,
  courseId,
  courseOwnerId,
}: CourseRatingSectionProps) {
  const { data: session } = useSession();
  const currentUserId = (session?.user as { id?: string })?.id;
  const isCourseOwner = currentUserId === courseOwnerId;
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [hiddenReviews, setHiddenReviews] = useState<Set<string>>(new Set());
  const [reportedReviews, setReportedReviews] = useState<Set<string>>(new Set());
  const [reviewReactions, setReviewReactions] = useState<Map<string, "like" | "dislike">>(new Map());

  // Load reactions from API on mount
  useEffect(() => {
    const loadReactions = async () => {
      try {
        const response = await fetch(`/api/courses/${courseId}/reviews/reactions`);
        if (response.ok) {
          const data = await response.json();
          if (data.reactions) {
            setReviewReactions(new Map(Object.entries(data.reactions)));
          }
        }
      } catch (error) {
        console.error("Failed to load reactions:", error);
      }
    };
    loadReactions();
  }, [courseId]);

  useEffect(() => {
    loadReviews();
  }, [courseId]);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/courses/${courseId}/reviews`);
      if (response.ok) {
        const data = await response.json();
        setReviews((data.ratings || []).slice(0, 4)); // Show only first 4 reviews
      }
    } catch (error) {
      console.error("Failed to load reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - new Date(date).getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 7) {
      return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months > 1 ? "s" : ""} ago`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `${years} year${years > 1 ? "s" : ""} ago`;
    }
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.25 && rating % 1 < 0.75;

    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => {
          if (i < fullStars) {
            return (
              <Star
                key={i}
                className="size-4 fill-yellow-400 text-yellow-400"
              />
            );
          } else if (i === fullStars && hasHalfStar) {
            return (
              <div key={i} className="relative size-4">
                <Star className="absolute inset-0 size-4 text-gray-300" />
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: "50%" }}
                >
                  <Star className="size-4 fill-yellow-400 text-yellow-400" />
                </div>
              </div>
            );
          } else {
            return (
              <Star
                key={i}
                className="size-4 text-gray-300"
                fill="transparent"
              />
            );
          }
        })}
      </div>
    );
  };

  const fullStars = Math.floor(averageRating);
  const hasHalfStar = averageRating % 1 >= 0.25 && averageRating % 1 < 0.75;

  return (
    <>
      <section className="py-8 border-b">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center gap-1">
            <Star className="size-6 fill-yellow-400 text-yellow-400" />
            <span className="text-2xl font-bold">
              {averageRating.toFixed(1)}
            </span>
          </div>
          <span className="text-sm text-muted-foreground">
            course rating • {totalRatings.toLocaleString()} ratings
          </span>
        </div>

        {/* Reviews Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <Skeleton className="size-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-24" />
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Skeleton key={i} className="size-4 rounded" />
                          ))}
                        </div>
                      </div>
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
                <Skeleton className="h-16 w-full rounded" />
                <div className="flex items-center gap-4">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-8 w-8 rounded" />
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {reviews.filter(review => !hiddenReviews.has(review.id)).map((review) => {
              const userName = review.user.lastName
                ? `${review.user.firstName} ${review.user.lastName}`
                : review.user.firstName;
              const initials = `${review.user.firstName[0]}${review.user.lastName?.[0] || ""}`;

              return (
                <div key={review.id} className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <Avatar className="size-10">
                        {review.user.image ? (
                          <AvatarImage
                            src={
                              review.user.image.startsWith("http")
                                ? review.user.image
                                : `https://${env.NEXT_PUBLIC_S3_BUCKET_NAME_IMAGES}.fly.storage.tigris.dev/${review.user.image}`
                            }
                            alt={userName}
                          />
                        ) : null}
                        <AvatarFallback className="bg-gray-800 dark:bg-gray-700 text-white">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">
                            {userName}
                          </span>
                          {renderStars(review.rating)}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatTimeAgo(review.createdAt)}
                        </span>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {isCourseOwner && !reportedReviews.has(review.id) && (
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.preventDefault();
                              setReportedReviews(prev => new Set(prev).add(review.id));
                              toast.success("Review reported. Thank you for your feedback!");
                            }}
                          >
                            <Flag className="size-4 mr-2" />
                            Report
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.preventDefault();
                            setHiddenReviews(prev => new Set(prev).add(review.id));
                            toast.success("Review hidden");
                          }}
                        >
                          <EyeOff className="size-4 mr-2" />
                          Hide
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {review.comment}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-muted-foreground">Helpful?</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className={`h-8 gap-2 transition-all duration-200 ease-in-out ${
                        reviewReactions.get(review.id) === "like" 
                          ? "bg-primary/10 text-primary scale-105" 
                          : "hover:bg-muted/50"
                      }`}
                      onClick={async () => {
                        const currentReaction = reviewReactions.get(review.id);
                        const newReaction = currentReaction === "like" ? null : "like";
                        
                        // Optimistic update
                        setReviewReactions(prev => {
                          const newMap = new Map(prev);
                          if (newReaction) {
                            newMap.set(review.id, newReaction);
                          } else {
                            newMap.delete(review.id);
                          }
                          return newMap;
                        });

                        // Save to API
                        try {
                          const response = await fetch(
                            `/api/courses/${courseId}/reviews/${review.id}/reactions`,
                            {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                              },
                              body: JSON.stringify({ reaction: newReaction || "like" }),
                            }
                          );
                          if (!response.ok) {
                            // Revert on error
                            setReviewReactions(prev => {
                              const newMap = new Map(prev);
                              if (currentReaction) {
                                newMap.set(review.id, currentReaction);
                              } else {
                                newMap.delete(review.id);
                              }
                              return newMap;
                            });
                          }
                        } catch (error) {
                          console.error("Failed to save reaction:", error);
                          // Revert on error
                          setReviewReactions(prev => {
                            const newMap = new Map(prev);
                            if (currentReaction) {
                              newMap.set(review.id, currentReaction);
                            } else {
                              newMap.delete(review.id);
                            }
                            return newMap;
                          });
                        }
                      }}
                    >
                      <ThumbsUp 
                        className={`size-4 transition-all duration-200 ease-in-out ${
                          reviewReactions.get(review.id) === "like" 
                            ? "fill-current scale-110" 
                            : ""
                        }`} 
                      />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className={`h-8 gap-2 transition-all duration-200 ease-in-out ${
                        reviewReactions.get(review.id) === "dislike" 
                          ? "bg-primary/10 text-primary scale-105" 
                          : "hover:bg-muted/50"
                      }`}
                      onClick={async () => {
                        const currentReaction = reviewReactions.get(review.id);
                        const newReaction = currentReaction === "dislike" ? null : "dislike";
                        
                        // Optimistic update
                        setReviewReactions(prev => {
                          const newMap = new Map(prev);
                          if (newReaction) {
                            newMap.set(review.id, newReaction);
                          } else {
                            newMap.delete(review.id);
                          }
                          return newMap;
                        });

                        // Save to API
                        try {
                          const response = await fetch(
                            `/api/courses/${courseId}/reviews/${review.id}/reactions`,
                            {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                              },
                              body: JSON.stringify({ reaction: newReaction || "dislike" }),
                            }
                          );
                          if (!response.ok) {
                            // Revert on error
                            setReviewReactions(prev => {
                              const newMap = new Map(prev);
                              if (currentReaction) {
                                newMap.set(review.id, currentReaction);
                              } else {
                                newMap.delete(review.id);
                              }
                              return newMap;
                            });
                          }
                        } catch (error) {
                          console.error("Failed to save reaction:", error);
                          // Revert on error
                          setReviewReactions(prev => {
                            const newMap = new Map(prev);
                            if (currentReaction) {
                              newMap.set(review.id, currentReaction);
                            } else {
                              newMap.delete(review.id);
                            }
                            return newMap;
                          });
                        }
                      }}
                    >
                      <ThumbsDown 
                        className={`size-4 transition-all duration-200 ease-in-out ${
                          reviewReactions.get(review.id) === "dislike" 
                            ? "fill-current scale-110" 
                            : ""
                        }`} 
                      />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}

        {/* Show All Reviews Button */}
        <div className="flex justify-center">
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-primary hover:bg-primary/90 text-white font-semibold"
          >
            Show all reviews
          </Button>
        </div>
      </section>

      <ReviewsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        courseId={courseId}
        courseOwnerId={courseOwnerId}
        initialAverageRating={averageRating}
        initialTotalRatings={totalRatings}
      />
    </>
  );
}
