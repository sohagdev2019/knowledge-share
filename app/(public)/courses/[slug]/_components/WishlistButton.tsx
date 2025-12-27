"use client";

import { Button } from "@/components/ui/button";
import { tryCatch } from "@/hooks/try-catch";
import { useTransition } from "react";
import { toggleWishlistAction } from "../actions";
import { toast } from "sonner";
import { Loader2, Heart } from "lucide-react";
import { useState } from "react";

export function WishlistButton({ 
  courseId,
  initialIsInWishlist 
}: { 
  courseId: string;
  initialIsInWishlist: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [isInWishlist, setIsInWishlist] = useState(initialIsInWishlist);

  function onSubmit() {
    startTransition(async () => {
      const { data: result, error } = await tryCatch(
        toggleWishlistAction(courseId)
      );

      if (error) {
        toast.error("An unexpected error occurred. Please try again.");
        return;
      }

      if (result.status === "success") {
        setIsInWishlist(result.isInWishlist);
        toast.success(
          result.isInWishlist 
            ? "Added to wishlist" 
            : "Removed from wishlist"
        );
      } else if (result.status === "error") {
        toast.error(result.message);
      }
    });
  }

  return (
    <Button 
      onClick={onSubmit} 
      disabled={pending} 
      variant="ghost"
      className="w-full mt-3 bg-white dark:bg-card text-primary border border-primary rounded-md transition-all duration-300 hover:bg-primary/10 hover:scale-[1.02] hover:shadow-sm font-medium cursor-pointer"
    >
      {pending ? (
        <>
          <Loader2 className="size-4 animate-spin mr-2" />
          Loading...
        </>
      ) : (
        <>
          <Heart 
            className={`size-4 mr-2 transition-all duration-300 ${
              isInWishlist 
                ? "fill-red-500 text-red-500" 
                : ""
            }`} 
          />
          {isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
        </>
      )}
    </Button>
  );
}

