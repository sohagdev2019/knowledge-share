"use client";

import { UserSubscriptionType } from "@/app/data/subscription/get-user-subscription";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cancelSubscription } from "../../actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, X } from "lucide-react";
import Link from "next/link";

interface CancelSubscriptionFormProps {
  subscription: UserSubscriptionType;
}

export function CancelSubscriptionForm({ subscription }: CancelSubscriptionFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel your subscription? You'll retain access until the end of your billing period.")) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await cancelSubscription();
      if (result.status === "success") {
        toast.success(result.message);
        router.push("/dashboard/subscription");
        router.refresh();
      } else {
        toast.error(result.message || "Failed to cancel subscription");
        setIsLoading(false);
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      setIsLoading(false);
    }
  };

  const endDate = subscription.endDate ? new Date(subscription.endDate) : null;
  const daysRemaining = endDate
    ? Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Cancel Subscription</h1>
        <p className="text-muted-foreground">Cancel your subscription plan</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Subscription</CardTitle>
          <CardDescription>{subscription.plan.name}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              What happens when you cancel:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Your subscription will remain active until {endDate?.toLocaleDateString() || "the end of your billing period"}</li>
              <li>You'll retain access to all features until then</li>
              <li>Your subscription will not auto-renew</li>
              {daysRemaining !== null && (
                <li>You have {daysRemaining} days of access remaining</li>
              )}
            </ul>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  Cancelling...
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                </>
              ) : (
                <>
                  <X className="mr-2 h-4 w-4" />
                  Cancel Subscription
                </>
              )}
            </Button>
            <Link href="/dashboard/subscription">
              <Button variant="outline">Keep Subscription</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

