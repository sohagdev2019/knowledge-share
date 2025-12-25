import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSubscriptionPlans } from "@/app/data/subscription/get-subscription-plans";

// Helper function to format price
const formatPrice = (cents: number | null | undefined): string => {
  if (cents === null || cents === undefined) return "$0";
  return `$${(cents / 100).toFixed(2)}`;
};

// Helper function to build feature list from plan
const buildFeaturesList = (plan: Awaited<ReturnType<typeof getSubscriptionPlans>>[0]): string[] => {
  // If custom feature list exists, use it
  if (plan.features && typeof plan.features === 'object' && 'list' in plan.features) {
    const customFeatures = (plan.features as { list?: string[] }).list;
    if (customFeatures && Array.isArray(customFeatures) && customFeatures.length > 0) {
      return customFeatures.filter(f => f && f.trim() !== "");
    }
  }
  
  // Otherwise, auto-generate from plan settings
  const features: string[] = [];
  
  if (plan.maxCourseAccess === null) {
    features.push("Unlimited course access");
  } else {
    features.push(`Access to ${plan.maxCourseAccess} courses`);
  }
  
  if (plan.allowsDownloads) {
    features.push("Downloadable resources");
  }
  
  if (plan.allowsCertificates) {
    features.push("Downloadable certificates");
  }
  
  if (plan.allowsLiveClasses) {
    features.push("Live Q&A sessions");
  }
  
  if (plan.prioritySupport) {
    features.push("Priority support");
  }
  
  if (plan.allowsTeamAccess) {
    if (plan.teamSeats === null || plan.teamSeats >= 999999) {
      features.push("Unlimited team members");
    } else {
      features.push(`Team access (up to ${plan.teamSeats} members)`);
    }
    features.push("Team management");
  }
  
  // Progress tracking - Basic for Personal/Team, Advanced for Enterprise
  if (plan.allowsProgressTracking) {
    // Check if plan is Enterprise based on planType or unlimited courses
    if ((plan.planType && plan.planType.toLowerCase() === "enterprise") || plan.maxCourseAccess === null) {
      features.push("Advanced progress tracking");
    } else {
      features.push("Basic progress tracking");
    }
  }
  
  // Always include community support
  features.push("Community support");
  
  // Mobile app access - only for Enterprise
  if (plan.planType && plan.planType.toLowerCase() === "enterprise") {
    features.push("Mobile app access");
  }
  
  return features;
};

export default async function PricingSection() {
  const plans = await getSubscriptionPlans();

  // Sort plans in specific order: Personal > Team > Enterprise
  const planOrder: Record<string, number> = {
    personal: 1,
    team: 2,
    enterprise: 3,
  };

  const sortedPlans = [...plans].sort((a, b) => {
    const orderA = planOrder[a.slug.toLowerCase()] ?? 999;
    const orderB = planOrder[b.slug.toLowerCase()] ?? 999;
    return orderA - orderB;
  });
  if (sortedPlans.length === 0) {
    return null;
  }

  return (
    <section id="pricing" className="py-20">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Pricing
          </p>
          <h2 className="text-2xl md:text-3xl font-semibold mb-3">
            Simple, transparent pricing
          </h2>
          <p className="text-muted-foreground">
            Start free with limited courses. Scale as you grow and unlock unlimited learning.
          </p>
        </div>
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-3 items-start">
            {sortedPlans.map((plan) => {
              const price = plan.priceMonthly;
              const features = buildFeaturesList(plan);
              const hasPrice = price !== null && price !== undefined;

              return (
                <div
                  key={plan.id}
                  className={`relative rounded-2xl border p-6 bg-white dark:bg-zinc-900 flex flex-col ${
                    plan.isPopular
                      ? "border-foreground ring-1 ring-foreground"
                      : "border-border/50"
                  }`}
                >
                  {plan.isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-foreground text-background text-xs font-medium px-3 py-1 rounded-full">
                        Most Popular
                      </span>
                    </div>
                  )}
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-1">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {plan.description || "Perfect for your learning journey"}
                    </p>
                  </div>
                  <div className="mb-4">
                    {hasPrice ? (
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-semibold">{formatPrice(price)}</span>
                        <span className="text-muted-foreground text-sm">
                          /month
                        </span>
                      </div>
                    ) : (
                      <div className="text-2xl font-semibold text-muted-foreground">
                        Request for demo
                      </div>
                    )}
                  </div>
                  <div className="space-y-2 mb-4">
                    {features.map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 text-sm"
                      >
                        <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                  {hasPrice ? (
                    <Link href={`/checkout?plan=${plan.slug}&billing=monthly`} className="block">
                      <Button
                        variant={plan.isPopular ? "default" : "outline"}
                        className="w-full h-10 rounded-full"
                      >
                        {plan.name === "Free" ? "Start for free" : "Get started"}
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/contact" className="block">
                      <Button
                        variant={plan.isPopular ? "default" : "outline"}
                        className="w-full h-10 rounded-full"
                      >
                        Request for demo
                      </Button>
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
          <p className="text-center text-sm text-muted-foreground mt-6">
            No credit card required • Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
}

