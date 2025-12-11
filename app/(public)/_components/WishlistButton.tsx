"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface WishlistButtonProps {
  courseId: string;
  className?: string;
  initialWishlisted?: boolean;
}

export function WishlistButton({ courseId, className, initialWishlisted }: WishlistButtonProps) {
  const [isWishlisted, setIsWishlisted] = useState(initialWishlisted ?? false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showRipple, setShowRipple] = useState(false);
  const [buttonScale, setButtonScale] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check initial state from prop first
    if (initialWishlisted !== undefined) {
      setIsWishlisted(initialWishlisted);
      return;
    }
    
    // Check server state for authenticated users
    const checkWishlistStatus = async () => {
      try {
        const response = await fetch(`/api/wishlist/${courseId}`);
        if (response.ok) {
          const data = await response.json();
          setIsWishlisted(data.isWishlisted ?? false);
          // Sync localStorage with server state
          if (typeof window !== "undefined") {
            const wishlist: string[] = JSON.parse(localStorage.getItem("wishlist") || "[]");
            if (data.isWishlisted && !wishlist.includes(courseId)) {
              localStorage.setItem("wishlist", JSON.stringify([...wishlist, courseId]));
            } else if (!data.isWishlisted && wishlist.includes(courseId)) {
              localStorage.setItem("wishlist", JSON.stringify(wishlist.filter(id => id !== courseId)));
            }
          }
        }
      } catch (error) {
        console.error("Failed to check wishlist status:", error);
        // Fallback to localStorage on error
        if (typeof window !== "undefined") {
          const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
          setIsWishlisted(wishlist.includes(courseId));
        }
      }
    };
    
    checkWishlistStatus();
  }, [courseId, initialWishlisted]);

  const toggleWishlist = async () => {
    if (typeof window === "undefined" || isAnimating || isLoading) return;

    const willBeWishlisted = !isWishlisted;
    const adding = !isWishlisted;
    
    setIsAnimating(true);
    setShowRipple(true);
    setIsAdding(adding);
    setIsLoading(true);
    
    // Immediate visual feedback with smooth scale animation
    setButtonScale(0.85);
    setTimeout(() => setButtonScale(1.15), 50);
    setTimeout(() => setButtonScale(1), 200);
    
    try {
      // Optimistic update
      setIsWishlisted(willBeWishlisted);
      
      const response = await fetch(`/api/wishlist/${courseId}`, {
        method: willBeWishlisted ? "POST" : "DELETE",
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Failed to update wishlist" }));
        throw new Error(error.error || "Failed to update wishlist");
      }

      // Update localStorage for quick access
      const wishlist: string[] = JSON.parse(localStorage.getItem("wishlist") || "[]");
      const newWishlist = willBeWishlisted 
        ? [...wishlist.filter((id) => id !== courseId), courseId]
        : wishlist.filter((id) => id !== courseId);
      localStorage.setItem("wishlist", JSON.stringify(newWishlist));

      const message = willBeWishlisted ? "Added to wishlist ✨" : "Removed from wishlist";
      toast.success(message, {
        duration: 2000,
        position: "top-center",
      });

      // Refresh the page to sync server state if on wishlist page
      if (window.location.pathname === "/dashboard/wishlist") {
        router.refresh();
      }
    } catch (error) {
      // Revert optimistic update on error
      setIsWishlisted(!willBeWishlisted);
      toast.error(error instanceof Error ? error.message : "Failed to update wishlist");
    } finally {
      setTimeout(() => {
        setIsAnimating(false);
        setShowRipple(false);
        setIsAdding(false);
        setIsLoading(false);
      }, 800);
    }
  };

  return (
    <motion.div 
      className="relative z-30"
      animate={{ scale: buttonScale }}
      transition={{ 
        type: "spring",
        stiffness: 400,
        damping: 17,
      }}
    >
      {/* Ripple Effect */}
      <AnimatePresence>
        {showRipple && (
          <motion.div
            initial={{ scale: 0, opacity: 0.9 }}
            animate={{ 
              scale: [0, 2.5, 3],
              opacity: [0.9, 0.4, 0],
            }}
            exit={{ scale: 3.5, opacity: 0 }}
            transition={{ 
              duration: 0.7,
              ease: [0.16, 1, 0.3, 1],
            }}
            className={cn(
              "absolute inset-0 rounded-full pointer-events-none",
              isWishlisted 
                ? "bg-destructive/40" 
                : "bg-primary/40"
            )}
            style={{
              left: "50%",
              top: "50%",
              x: "-50%",
              y: "-50%",
            }}
          />
        )}
      </AnimatePresence>

      {/* Particle Effects - Enhanced - Show when adding to wishlist */}
      <AnimatePresence>
        {isAnimating && isAdding && (
          <>
            {[...Array(8)].map((_, i) => {
              const angle = (i * 360) / 8;
              const radius = 25;
              return (
                <motion.div
                  key={i}
                  initial={{ 
                    scale: 0,
                    opacity: 1,
                    x: 0,
                    y: 0,
                  }}
                  animate={{
                    scale: [0, 1.2, 0],
                    opacity: [1, 1, 0],
                    x: Math.cos((angle * Math.PI) / 180) * radius,
                    y: Math.sin((angle * Math.PI) / 180) * radius,
                  }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{
                    duration: 0.8,
                    delay: i * 0.03,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  style={{
                    left: "50%",
                    top: "50%",
                  }}
                >
                  <motion.div
                    className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      i % 2 === 0 ? "bg-primary" : "bg-destructive"
                    )}
                    animate={{
                      scale: [0, 1.5, 0],
                    }}
                    transition={{
                      duration: 0.8,
                      delay: i * 0.03,
                    }}
                  />
                </motion.div>
              );
            })}
          </>
        )}
      </AnimatePresence>

      <Button
        variant="ghost"
        size="icon"
        onClick={toggleWishlist}
        disabled={isAnimating}
        className={cn(
          "relative z-30 rounded-full transition-all duration-200",
          "bg-black/50 backdrop-blur-md border border-white/10",
          "hover:bg-black/70 hover:border-white/20",
          "active:scale-95",
          "focus:ring-2 focus:ring-destructive/40 focus:ring-offset-2 focus:ring-offset-background",
          "cursor-pointer select-none",
          isWishlisted 
            ? "text-destructive hover:text-destructive" 
            : "text-white hover:text-destructive/80",
          className || "h-9 w-9"
        )}
        aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isWishlisted ? (
            <motion.div
              key="filled"
              initial={{ scale: 0, rotate: -180, opacity: 0 }}
              animate={{ 
                scale: isAnimating ? [0.7, 1.5, 1.1, 1] : 1,
                rotate: 0,
                opacity: 1,
              }}
              exit={{ scale: 0, rotate: 180, opacity: 0 }}
              transition={{ 
                duration: 0.5,
                ease: [0.34, 1.56, 0.64, 1],
              }}
              className="relative"
            >
              <Heart className="h-4 w-4 fill-destructive text-destructive drop-shadow-lg cursor-pointer" />
              {/* Enhanced glow effect when filled */}
              <motion.div
                className="absolute inset-0 rounded-full bg-destructive/30 blur-lg"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: isAnimating ? [0, 2, 1.2, 1] : [1, 1.1, 1],
                  opacity: isAnimating ? [0, 0.9, 0.4, 0.3] : [0.3, 0.5, 0.3],
                }}
                transition={{ 
                  duration: 0.6,
                  repeat: isAnimating ? 0 : Infinity,
                  repeatType: "reverse",
                  repeatDelay: 0.5,
                }}
              />
            </motion.div>
          ) : (
            <motion.div
              key="outline"
              initial={{ scale: 0, rotate: 180, opacity: 0 }}
              animate={{ 
                scale: isAnimating ? [0.7, 1.4, 1] : 1,
                rotate: 0,
                opacity: 1,
              }}
              exit={{ scale: 0, rotate: -180, opacity: 0 }}
              transition={{ 
                duration: 0.5,
                ease: [0.34, 1.56, 0.64, 1],
              }}
            >
              <Heart className="h-4 w-4 cursor-pointer" strokeWidth={2.5} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Subtle pulse animation for wishlisted state */}
        {isWishlisted && !isAnimating && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-destructive/40"
            animate={{
              scale: [1, 1.25, 1],
              opacity: [0.4, 0, 0.4],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}
      </Button>
    </motion.div>
  );
}