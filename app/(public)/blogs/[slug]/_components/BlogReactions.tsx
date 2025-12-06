"use client";

import { Heart, ThumbsUp, Lightbulb, Laugh } from "lucide-react";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface BlogReactionsProps {
  blogId: string;
  initialLikeCount: number;
}

export function BlogReactions({ blogId, initialLikeCount }: BlogReactionsProps) {
  const { data: session } = useSession();
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [reacted, setReacted] = useState(false);

  const handleReaction = async (type: "Like" | "Love" | "Insightful" | "Funny") => {
    if (!session) {
      toast.error("Please login to react to blogs");
      return;
    }

    try {
      const response = await fetch(`/api/blogs/${blogId}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });

      const data = await response.json();

      if (response.ok) {
        setReacted(true);
        if (type === "Like") {
          setLikeCount((prev) => prev + 1);
        }
        toast.success("Reaction added!");
      } else {
        toast.error(data.error || "Failed to add reaction");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  return (
    <div className="flex items-center gap-4 pt-6 border-t">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleReaction("Like")}
          disabled={reacted || !session}
        >
          <Heart className={`w-4 h-4 mr-2 ${reacted ? "fill-red-500 text-red-500" : ""}`} />
          Like ({likeCount})
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleReaction("Love")}
          disabled={reacted || !session}
        >
          <Heart className="w-4 h-4 mr-2" />
          Love
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleReaction("Insightful")}
          disabled={reacted || !session}
        >
          <Lightbulb className="w-4 h-4 mr-2" />
          Insightful
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleReaction("Funny")}
          disabled={reacted || !session}
        >
          <Laugh className="w-4 h-4 mr-2" />
          Funny
        </Button>
      </div>
    </div>
  );
}



