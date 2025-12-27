"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Check, ShoppingCart, CreditCard, Clock, Gift, Share2, Verified } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { WishlistButton } from "@/app/(public)/courses/[slug]/_components/WishlistButton";

interface BuyCardProps {
  courseId: string;
  title: string;
  thumbnailUrl: string;
  price: {
    current: number;
    original: number;
    discountPercentage: number;
  };
  isEnrolled: boolean;
  isInWishlist: boolean;
  onEnroll: () => void;
  onAddToCart?: () => void;
}

export function BuyCard({
  courseId,
  title,
  thumbnailUrl,
  price,
  isEnrolled,
  isInWishlist,
  onEnroll,
  onAddToCart,
}: BuyCardProps) {
  const [couponCode, setCouponCode] = useState("");
  const [showCouponInput, setShowCouponInput] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount / 100);
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCode.trim()) {
      setAppliedCoupon(couponCode);
      setShowCouponInput(false);
      setCouponCode("");
    }
  };

  return (
    <Card className="lg:sticky lg:top-20 overflow-hidden border-2 p-0">
      {/* Course Thumbnail */}
      <div className="relative aspect-video w-full overflow-hidden bg-black group">
        <Image
          src={thumbnailUrl}
          alt={title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          priority
          sizes="(min-width: 1080px) 240px, (min-width: 43.8125rem) 600px, 100vw"
        />
      </div>

      <CardContent className="p-0">
        {/* Personal/Teams Tabs */}
        <Tabs defaultValue="personal" className="w-full">
          <div className="border-b border-border">
            <TabsList className="h-auto bg-transparent p-0 w-full justify-start rounded-none">
              <TabsTrigger
                value="personal"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary px-6 py-4 text-base font-medium"
              >
                Personal
              </TabsTrigger>
              <TabsTrigger
                value="teams"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary px-6 py-4 text-base font-medium"
              >
                Teams
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="personal" className="mt-0">
            <div className="p-6 space-y-4">
              {/* Premium Course Notice */}
              <div className="flex items-center gap-2 text-sm">
                <Verified className="size-4 text-blue-600 dark:text-blue-400" />
                <span className="text-muted-foreground">This Premium course is included in plans</span>
              </div>

              {/* Price Section */}
              <div className="space-y-2">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <div className="text-3xl font-bold">
                    <span className="sr-only">Current price</span>
                    {formatPrice(price.current)}
                  </div>
                  {price.discountPercentage > 0 && (
                    <>
                      <div className="text-xl text-muted-foreground">
                        <span className="sr-only">Original Price</span>
                        <s>{formatPrice(price.original)}</s>
                      </div>
                      <div className="text-sm font-semibold text-red-600 dark:text-red-400">
                        <span className="sr-only">Discount</span>
                        {price.discountPercentage}% off
                      </div>
                    </>
                  )}
                </div>
                {price.discountPercentage > 0 && (
                  <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                    <Clock className="size-4" aria-label="alarm" />
                    <span>
                      <b>23 hours</b> left at this price!
                    </span>
                  </div>
                )}
              </div>

              {/* CTAs */}
              {isEnrolled ? (
                <Link
                  href={`/dashboard/${courseId}`}
                  className={buttonVariants({
                    className: "w-full text-base py-6",
                  })}
                >
                  Go to Course
                </Link>
              ) : (
                <div className="space-y-3">
                  {onAddToCart && (
                    <Button
                      onClick={onAddToCart}
                      className="w-full text-base py-6 font-medium bg-primary hover:bg-primary/90 text-white rounded-md border-0"
                      size="lg"
                    >
                      Add to cart
                    </Button>
                  )}
                  <Button
                    onClick={onEnroll}
                    className="w-full text-base py-6 font-medium bg-primary hover:bg-primary/90 text-white rounded-md border-0 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                    size="lg"
                  >
                    Enroll Now!
                  </Button>
                  <WishlistButton
                    courseId={courseId}
                    initialIsInWishlist={isInWishlist}
                  />
                </div>
              )}

              {/* Money-Back Guarantee */}
              <div className="text-center text-sm">
                <span className="font-medium">30-Day Money-Back Guarantee</span>
              </div>

              {/* Full Lifetime Access */}
              <div className="text-center text-xs text-muted-foreground">
                Full Lifetime Access
              </div>

              {/* Course Actions */}
              <div className="flex items-center justify-center gap-4 text-sm">
                <button className="text-black dark:text-white hover:underline" aria-label="Share this course">
                  Share
                </button>
              </div>

              {/* Coupon Section */}
              {appliedCoupon && (
                <div className="space-y-2">
                  <div className="border border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-3 text-sm">
                    <ul className="space-y-1">
                      <li className="text-gray-600 dark:text-gray-400">
                        <b>{appliedCoupon}</b> is applied
                      </li>
                      <li className="text-gray-400 dark:text-gray-500 text-xs">Coupon</li>
                    </ul>
                  </div>
                </div>
              )}

              {!appliedCoupon && (
                <form onSubmit={handleApplyCoupon} className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter Coupon"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 border-gray-300 dark:border-gray-600"
                      aria-label="Enter Coupon"
                    />
                    <Button
                      type="submit"
                      size="sm"
                      className="bg-primary hover:bg-primary/90 text-white font-semibold"
                    >
                      Apply
                    </Button>
                  </div>
                </form>
              )}

              {/* Subscription Option */}
              {!isEnrolled && (
                <>
                  <div className="relative py-6 my-2">
                    <Separator className="bg-gray-300 dark:bg-gray-600" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="bg-background px-4 py-1 text-sm font-medium text-gray-600 dark:text-gray-400 rounded-md border border-gray-200 dark:border-gray-700 shadow-sm animate-in fade-in-0 zoom-in-95 duration-300">
                        or
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 text-center">
                    <div>
                      <h3 className="text-base font-semibold mb-1">
                        Subscribe to top courses
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Get this course, plus thousands of our top-rated courses, with Personal Plan.{" "}
                        <Link href="#" className="text-xs font-medium text-primary hover:underline">
                          Learn more
                        </Link>
                      </p>
                    </div>
                    <Button
                      className="w-full text-sm py-3 font-medium bg-transparent hover:bg-primary/10 text-primary border-2 border-primary rounded-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:border-primary/80 cursor-pointer animate-in fade-in-0 slide-in-from-bottom-2 duration-500"
                    >
                      Start subscription
                    </Button>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div>
                        Starting at <span className="font-semibold">$11.00</span> per month
                      </div>
                      <div>Cancel anytime</div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="teams" className="mt-0">
            <div className="p-6 space-y-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Try Teams</h3>
                  <p className="text-sm text-muted-foreground">
                    Get your team access to thousands of top courses anytime, anywhere.
                  </p>
                </div>
                <Button
                  className="w-full text-base py-6 font-semibold bg-primary hover:bg-primary/90"
                  size="lg"
                >
                  Try Teams
                </Button>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <Check className="size-4 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                    <span>For teams of 2 or more users</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="size-4 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                    <span>30,000+ fresh & in-demand courses</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="size-4 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                    <span>Learning Engagement tools</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="size-4 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                    <span>SSO and LMS Integrations</span>
                  </li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
