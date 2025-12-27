"use client";

import { Button } from "@/components/ui/button";
import { CreditCard, ShoppingCart } from "lucide-react";
import { useState, useEffect } from "react";

interface MobileStickyCTAProps {
  price: {
    current: number;
    original: number;
    discountPercentage: number;
  };
  isEnrolled: boolean;
  onEnroll: () => void;
  onAddToCart?: () => void;
}

export function MobileStickyCTA({
  price,
  isEnrolled,
  onEnroll,
  onAddToCart,
}: MobileStickyCTAProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show CTA after scrolling past 300px
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount / 100);
  };

  if (!isVisible || isEnrolled) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border shadow-lg lg:hidden">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold">
                {formatPrice(price.current)}
              </span>
              {price.discountPercentage > 0 && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice(price.original)}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {onAddToCart && (
              <Button
                onClick={onAddToCart}
                variant="outline"
                size="sm"
                className="hidden sm:flex"
              >
                <ShoppingCart className="size-4 mr-2" />
                Cart
              </Button>
            )}
            <Button onClick={onEnroll} size="sm" className="font-semibold">
              <CreditCard className="size-4 mr-2" />
              Buy Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

