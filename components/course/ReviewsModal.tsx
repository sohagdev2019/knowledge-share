"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Star, X, Search, ThumbsUp, ThumbsDown, MoreVertical, Flag, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
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

interface ReviewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  courseOwnerId: string;
  initialAverageRating: number;
  initialTotalRatings: number;
}

export function ReviewsModal({
  isOpen,
  onClose,
  courseId,
  courseOwnerId,
  initialAverageRating,
  initialTotalRatings,
}: ReviewsModalProps) {
  const { data: session } = useSession();
  const currentUserId = (session?.user as { id?: string })?.id;
  const isCourseOwner = currentUserId === courseOwnerId;
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [hiddenReviews, setHiddenReviews] = useState<Set<string>>(new Set());
  const [reportedReviews, setReportedReviews] = useState<Set<string>>(new Set());
  const [reviewReactions, setReviewReactions] = useState<Map<string, "like" | "dislike">>(new Map());
  const [distributionPercentages, setDistributionPercentages] = useState({
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  });

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
    if (isOpen && courseId) {
      loadReviews();
      setHiddenReviews(new Set()); // Reset hidden reviews when modal opens
      setReportedReviews(new Set()); // Reset reported reviews when modal opens
      // Load reactions from API
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
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, courseId]);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/courses/${courseId}/reviews`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        const data = await response.json();
        setReviews(data.ratings || []);
        setDistributionPercentages(
          data.distributionPercentages || {
            5: 0,
            4: 0,
            3: 0,
            2: 0,
            1: 0,
          }
        );
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

  const filteredReviews = reviews.filter((review) => {
    if (hiddenReviews.has(review.id)) {
      return false;
    }
    if (selectedRating && review.rating !== selectedRating) {
      return false;
    }
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      review.comment?.toLowerCase().includes(query) ||
      review.user.firstName.toLowerCase().includes(query) ||
      review.user.lastName?.toLowerCase().includes(query)
    );
  });

  const handleRatingFilter = (rating: number) => {
    setSelectedRating(selectedRating === rating ? null : rating);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div
        className="relative z-50 w-[500px] max-h-[90vh] bg-background rounded-lg shadow-lg flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Star className="size-5 fill-yellow-400 text-yellow-400" />
              <span>{initialAverageRating.toFixed(1)} course rating</span>
              <span className="text-muted-foreground">•</span>
              <span>{initialTotalRatings.toLocaleString()} ratings</span>
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Rating Distribution & Search */}
          <div className="px-4 py-3 border-b shrink-0">
            {/* Rating Distribution */}
            <div className="space-y-1.5 mb-3">
              {[5, 4, 3, 2, 1].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRatingFilter(star)}
                  className={`w-full flex items-center gap-2 px-1.5 py-1 rounded-md transition-colors ${
                    selectedRating === star
                      ? "bg-primary/10 border border-primary"
                      : "hover:bg-muted"
                  }`}
                >
                  <div className="flex items-center gap-1.5 min-w-[50px]">
                    <span className="text-xs font-medium">{star}</span>
                    <Star className="size-3 fill-yellow-400 text-yellow-400" />
                  </div>
                  <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 transition-all duration-300"
                      style={{
                        width: `${distributionPercentages[star as keyof typeof distributionPercentages]}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground min-w-[35px] text-right">
                    {Math.round(distributionPercentages[star as keyof typeof distributionPercentages])}%
                  </span>
                </button>
              ))}
            </div>

            {/* Search */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
              }}
              className="flex gap-2"
            >
              <Input
                placeholder="Search reviews"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 h-8 text-sm"
              />
              <Button
                type="submit"
                size="icon"
                className="bg-primary hover:bg-primary/90 shrink-0 h-8 w-8"
              >
                <Search className="size-3.5" />
              </Button>
            </form>
          </div>

          {/* Reviews List */}
          <div className="flex-1 p-6 overflow-y-auto">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading reviews...
              </div>
            ) : filteredReviews.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No reviews found
              </div>
            ) : (
              <div className="space-y-6">
                {filteredReviews.map((review) => {
                  const userName = review.user.lastName
                    ? `${review.user.firstName} ${review.user.lastName}`
                    : review.user.firstName;
                  const initials = `${review.user.firstName[0]}${review.user.lastName?.[0] || ""}`;

                  return (
                    <div key={review.id} className="space-y-3 pb-6 border-b last:border-b-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <Avatar className="size-12 shrink-0">
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
                            <AvatarFallback className="bg-gray-800 dark:bg-gray-700 text-white text-base">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-semibold text-base">{userName}</h4>
                              {renderStars(review.rating)}
                              <span className="text-sm text-muted-foreground">
                                {formatTimeAgo(review.createdAt)}
                              </span>
                            </div>
                            {review.comment && (
                              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                                {review.comment}
                              </p>
                            )}
                            <div className="flex items-center gap-4 text-sm">
                              <span className="text-muted-foreground text-xs">Helpful?</span>
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
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
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
                    </div>
                  );
                })}
                {filteredReviews.length >= 10 && (
                  <Button
                    variant="outline"
                    className="w-full border-primary text-primary hover:bg-primary/10"
                    onClick={() => {
                      // Load more reviews logic
                    }}
                  >
                    Show more reviews
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
