"use client";

import { resumeSubscription } from "../actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Check } from "lucide-react";
import Link from "next/link";

export default function ResumeSubscriptionPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleResume = async () => {
    setIsLoading(true);
    try {
      const result = await resumeSubscription();
      if (result.status === "success") {
        toast.success(result.message);
        router.push("/dashboard/subscription");
        router.refresh();
      } else {
        toast.error(result.message || "Failed to resume subscription");
        setIsLoading(false);
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Resume Subscription</h1>
        <p className="text-muted-foreground">Reactivate your subscription</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resume Subscription</CardTitle>
          <CardDescription>
            Reactivate your cancelled subscription to continue enjoying all features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              When you resume:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Your subscription will be reactivated immediately</li>
              <li>Billing will resume on your next billing cycle</li>
              <li>You'll regain access to all premium features</li>
            </ul>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleResume}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  Resuming...
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Resume Subscription
                </>
              )}
            </Button>
            <Link href="/dashboard/subscription">
              <Button variant="outline">Cancel</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

