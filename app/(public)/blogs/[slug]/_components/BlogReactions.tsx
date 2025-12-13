"use client";

import { Heart, Lightbulb, Laugh, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface BlogReactionsProps {
  blogId: string;
  initialLikeCount: number;
}

export function BlogReactions({ blogId, initialLikeCount }: BlogReactionsProps) {
  const { data: session } = useSession();
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [loveCount, setLoveCount] = useState(0);
  const [insightfulCount, setInsightfulCount] = useState(0);
  const [funnyCount, setFunnyCount] = useState(0);
  const [reactedType, setReactedType] = useState<"Like" | "Love" | "Insightful" | "Funny" | null>(null);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(true);

  // Fetch user's existing reaction and counts on mount
  useEffect(() => {
    const fetchReactions = async () => {
      try {
        const response = await fetch(`/api/blogs/${blogId}/reactions`);
        if (response.ok) {
          const data = await response.json();
          setLikeCount(data.counts.Like || 0);
          setLoveCount(data.counts.Love || 0);
          setInsightfulCount(data.counts.Insightful || 0);
          setFunnyCount(data.counts.Funny || 0);
          
          if (data.userReaction) {
            setReactedType(data.userReaction);
          }
        }
      } catch (error) {
        console.error("Error fetching reactions:", error);
      } finally {
        setIsFetching(false);
      }
    };

    fetchReactions();
  }, [blogId]);

  const handleReaction = async (type: "Like" | "Love" | "Insightful" | "Funny") => {
    if (!session) {
      toast.error("Please login to react to blogs");
      return;
    }

    // If clicking the same reaction type, do nothing
    if (reactedType === type) {
      return;
    }

    setIsLoading(type);
    try {
      const response = await fetch(`/api/blogs/${blogId}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });

      const data = await response.json();

      if (response.ok) {
        const oldType = reactedType;
        
        // Refresh counts from server to ensure accuracy
        const countsResponse = await fetch(`/api/blogs/${blogId}/reactions`);
        if (countsResponse.ok) {
          const countsData = await countsResponse.json();
          setLikeCount(countsData.counts.Like || 0);
          setLoveCount(countsData.counts.Love || 0);
          setInsightfulCount(countsData.counts.Insightful || 0);
          setFunnyCount(countsData.counts.Funny || 0);
          setReactedType(countsData.userReaction);
        } else {
          // Fallback: update locally if fetch fails
          setReactedType(type);
        }
        
        toast.success(oldType ? "Reaction updated!" : "Reaction added!");
      } else {
        toast.error(data.error || "Failed to add reaction");
      }
    } catch (_error) {
      toast.error("An error occurred");
    } finally {
      setIsLoading(null);
    }
  };

  const reactionButtons = [
    { type: "Like" as const, icon: Heart, label: "Like", count: likeCount },
    { type: "Love" as const, icon: Heart, label: "Love", count: loveCount },
    { type: "Insightful" as const, icon: Lightbulb, label: "Insightful", count: insightfulCount },
    { type: "Funny" as const, icon: Laugh, label: "Funny", count: funnyCount },
  ];

  if (isFetching) {
    return (
      <div className="flex items-center gap-4 pt-6 border-t">
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-9 w-20 bg-muted animate-pulse rounded-md" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 pt-6 border-t">
      <div className="flex items-center gap-2">
        {reactionButtons.map(({ type, icon: Icon, label, count }) => {
          const isActive = reactedType === type;
          const isButtonLoading = isLoading === type;
          const isDisabled = !session || isButtonLoading;

          return (
            <motion.div
              key={type}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
        <Button
          variant="outline"
          size="sm"
                onClick={() => handleReaction(type)}
                disabled={isDisabled}
                className={`relative transition-all duration-300 ${
                  isActive
                    ? "bg-primary/10 border-primary text-primary"
                    : "hover:bg-accent"
                }`}
              >
                <motion.div
                  animate={isActive ? { scale: [1, 1.3, 1] } : { scale: 1 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="flex items-center"
                >
                  {isButtonLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Icon
                      className={`w-4 h-4 mr-2 transition-all duration-300 ${
                        isActive && type === "Like"
                          ? "fill-red-500 text-red-500"
                          : isActive && type === "Love"
                          ? "fill-pink-500 text-pink-500"
                          : ""
                      }`}
                    />
                  )}
                  {label}
                  {count !== undefined && ` (${count})`}
                </motion.div>
                {isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-md bg-primary/20"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    transition={{ duration: 0.6 }}
                  />
                )}
        </Button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}



