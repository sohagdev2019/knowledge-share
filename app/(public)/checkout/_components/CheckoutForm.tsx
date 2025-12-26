"use client";

import { useState } from "react";
import { SubscriptionPlanType } from "@/app/data/subscription/get-subscription-plans";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import { createSubscriptionCheckout } from "../actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface CheckoutFormProps {
  plan: SubscriptionPlanType;
  billingCycle: "monthly" | "yearly";
}

export function CheckoutForm({ plan, billingCycle: initialBillingCycle }: CheckoutFormProps) {
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(initialBillingCycle);
  const [couponCode, setCouponCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const price = billingCycle === "yearly" ? plan.priceYearly : plan.priceMonthly;
  const monthlyEquivalent = billingCycle === "yearly" ? Math.round(plan.priceYearly / 12) : plan.priceMonthly;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await createSubscriptionCheckout({
        planId: plan.id,
        billingCycle,
        couponCode: couponCode || undefined,
      });

      if (result.status === "success" && result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      } else {
        toast.error(result.message || "Failed to create checkout session");
        setIsLoading(false);
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      setIsLoading(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-emerald-500" />
              <CardTitle>Plan Details</CardTitle>
            </div>
            <CardDescription>Review your subscription plan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold">{plan.name}</h3>
              <p className="text-muted-foreground">{plan.description}</p>
            </div>

            <div className="space-y-2">
              <Label>Billing Cycle</Label>
              <Select
                value={billingCycle}
                onValueChange={(value) => setBillingCycle(value as "monthly" | "yearly")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">
                    <div className="flex items-center justify-between w-full">
                      <span>Monthly</span>
                      <span className="ml-4 font-semibold">${(plan.priceMonthly / 100).toFixed(0)}/month</span>
                    </div>
                  </SelectItem>
                  {plan.priceYearly && (
                    <SelectItem value="yearly">
                      <div className="flex items-center justify-between w-full">
                        <div>
                          <span>Yearly</span>
                          <span className="ml-2 text-xs text-emerald-600 font-medium">
                            (Save {Math.round((1 - plan.priceYearly / (plan.priceMonthly * 12)) * 100)}%)
                          </span>
                        </div>
                        <span className="ml-4 font-semibold">${(plan.priceYearly / 100).toFixed(0)}/year</span>
                      </div>
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Apply Coupon</CardTitle>
            <CardDescription>Have a discount code? Enter it here</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                className="uppercase"
              />
              <Button type="button" variant="outline">
                Apply
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Plan</span>
              <span className="font-medium">{plan.name} ({billingCycle === "yearly" ? "Yearly" : "Monthly"})</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>${price ? (price / 100).toFixed(2) : "0.00"}</span>
            </div>
            <AnimatePresence>
              {couponCode && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex justify-between text-sm text-emerald-600"
                >
                  <span>Discount ({couponCode})</span>
                  <span>-</span>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="border-t pt-3 flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span>${price ? (price / 100).toFixed(2) : "0.00"}</span>
            </div>
            {billingCycle === "yearly" && plan.priceYearly && (
              <p className="text-xs text-muted-foreground">
                ${(monthlyEquivalent / 100).toFixed(2)}/month billed annually
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isLoading || !price}
          >
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center"
                >
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </motion.div>
              ) : (
                <motion.div
                  key="text"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Complete Purchase - ${price ? (price / 100).toFixed(2) : "0.00"}
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </motion.div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-xs text-center text-muted-foreground"
      >
        By completing your purchase, you agree to our Terms of Service and Privacy Policy.
        Your subscription will automatically renew unless cancelled.
      </motion.p>
    </motion.form>
  );
}

