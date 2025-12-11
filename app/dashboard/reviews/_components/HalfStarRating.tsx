"use client";

import { IconStarFilled } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface HalfStarRatingProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  readOnly?: boolean;
  size?: number;
  className?: string;
}

export function HalfStarRating({
  rating,
  onRatingChange,
  readOnly = false,
  size = 24,
  className,
}: HalfStarRatingProps) {
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [hoveredHalf, setHoveredHalf] = useState<boolean>(false);

  const handleStarClick = (starValue: number, isHalf: boolean) => {
    if (!readOnly) {
      const newRating = isHalf ? starValue - 0.5 : starValue;
      onRatingChange(newRating);
    }
  };

  const handleMouseMove = (starValue: number, event: React.MouseEvent<HTMLDivElement>) => {
    if (readOnly) return;
    
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const width = rect.width;
    
    setHoveredStar(starValue);
    setHoveredHalf(x < width / 2);
  };

  const handleMouseLeave = () => {
    if (!readOnly) {
      setHoveredStar(null);
      setHoveredHalf(false);
    }
  };

  const getStarState = (starValue: number) => {
    // Calculate the rating to display (hover preview or actual)
    let displayRating = rating;
    if (hoveredStar !== null) {
      if (hoveredStar > starValue) {
        // Star is fully filled due to hover
        displayRating = hoveredStar;
      } else if (hoveredStar === starValue) {
        // Hovering on this specific star
        displayRating = hoveredHalf ? starValue - 0.5 : starValue;
      }
    }

    const isHalfFilled = displayRating >= starValue - 0.5 && displayRating < starValue;
    const isFilled = displayRating >= starValue;

    return { isHalfFilled, isFilled };
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {[1, 2, 3, 4, 5].map((starValue) => {
        const { isHalfFilled, isFilled } = getStarState(starValue);
        const isThisStarHovered = hoveredStar === starValue;

        return (
          <div
            key={starValue}
            className={cn(
              "relative cursor-pointer transition-transform",
              !readOnly && "hover:scale-110"
            )}
            onMouseMove={(e) => handleMouseMove(starValue, e)}
            onMouseLeave={handleMouseLeave}
            onClick={() => handleStarClick(starValue, isThisStarHovered ? hoveredHalf : false)}
            style={{ width: size, height: size }}
          >
            {/* Empty star background */}
            <IconStarFilled
              className={cn(
                "absolute inset-0",
                readOnly ? "text-border" : "text-border/60"
              )}
              style={{ width: size, height: size }}
            />
            
            {/* Half-filled star - show when rating is between starValue-0.5 and starValue */}
            {isHalfFilled && !isFilled && (
              <div 
                className="absolute inset-0 overflow-hidden" 
                style={{ width: size, height: size }}
              >
                <IconStarFilled
                  className="text-amber-400"
                  style={{ 
                    width: size, 
                    height: size,
                    clipPath: 'inset(0 50% 0 0)',
                  }}
                />
              </div>
            )}
            
            {/* Full-filled star */}
            {isFilled && (
              <IconStarFilled
                className="absolute inset-0 text-amber-400"
                style={{ width: size, height: size }}
              />
            )}
          </div>
        );
      })}
      {!readOnly && (
        <span className="ml-2 text-sm text-muted-foreground">
          Rating: {rating > 0 ? rating.toFixed(1) : "0.0"} / 5.0
        </span>
      )}
    </div>
  );
}

