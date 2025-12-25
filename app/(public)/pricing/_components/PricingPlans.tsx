"use client";

import React from "react";
import Link from "next/link";
import { Check, X, BookOpen, Users, Award, BarChart3, Download, MessageSquare, Zap, Clock, Globe, Shield, Headphones, Code, Video, FileText, Gamepad2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SubscriptionPlanType } from "@/app/data/subscription/get-subscription-plans";

interface PricingPlansProps {
  plans: SubscriptionPlanType[];
}

// Helper function to format price
const formatPrice = (cents: number | null | undefined): string => {
  if (cents === null || cents === undefined) return "$0";
  return `$${(cents / 100).toFixed(2)}`;
};

// Helper function to build feature list from plan
const buildFeaturesList = (plan: SubscriptionPlanType): string[] => {
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
    features.push(`Team access (${plan.teamSeats} seats)`);
    features.push("Team management");
  }
  
  // Always include these
  features.push("Basic progress tracking");
  features.push("Community support");
  features.push("Mobile app access");
  
  return features;
};

const comparisonFeatures = [
  {
    category: "Course Access",
    icon: BookOpen,
    features: [
      {
        name: "Free courses",
        getValue: (plan: SubscriptionPlanType) => 
          plan.maxCourseAccess === null ? "Unlimited" : `${plan.maxCourseAccess} courses`,
      },
      {
        name: "Premium courses",
        getValue: (plan: SubscriptionPlanType) => plan.maxCourseAccess === null || plan.maxCourseAccess > 5,
      },
      {
        name: "Course downloads",
        getValue: (plan: SubscriptionPlanType) => plan.allowsDownloads,
      },
    ],
  },
  {
    category: "Certificates & Credentials",
    icon: Award,
    features: [
      {
        name: "Course completion certificates",
        getValue: () => true,
      },
      {
        name: "Downloadable certificates",
        getValue: (plan: SubscriptionPlanType) => plan.allowsCertificates,
      },
    ],
  },
  {
    category: "Support & Community",
    icon: Users,
    features: [
      {
        name: "Community support",
        getValue: () => true,
      },
      {
        name: "Priority support",
        getValue: (plan: SubscriptionPlanType) => plan.prioritySupport,
      },
      {
        name: "Live Q&A sessions",
        getValue: (plan: SubscriptionPlanType) => plan.allowsLiveClasses,
      },
    ],
  },
  {
    category: "Team & Collaboration",
    icon: Users,
    features: [
      {
        name: "Team workspaces",
        getValue: (plan: SubscriptionPlanType) => plan.allowsTeamAccess,
      },
      {
        name: "Team members",
        getValue: (plan: SubscriptionPlanType) => 
          plan.allowsTeamAccess ? `Up to ${plan.teamSeats}` : "1",
      },
    ],
  },
];

const faqItems = [
  {
    question: "How does the free plan work?",
    answer:
      "The free plan gives you access to limited free courses with basic progress tracking and community support. You can upgrade anytime to unlock unlimited courses and advanced features. All courses you start on the free plan remain accessible even if you don't upgrade.",
  },
  {
    question: "Can I change my plan anytime?",
    answer:
      "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any charges or credits based on your billing cycle. You can also cancel your subscription at any time without losing access to courses you've already enrolled in.",
  },
  {
    question: "Do I lose access to courses if I cancel?",
    answer:
      "No, you'll retain lifetime access to all courses you've enrolled in, even after canceling your subscription. However, you won't be able to enroll in new premium courses or access premium features until you resubscribe.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards (Visa, Mastercard, American Express) through Stripe. All payments are processed securely. You can also pay annually to save money.",
  },
  {
    question: "Are certificates included in all plans?",
    answer:
      "Yes, all plans include course completion certificates. Free plan certificates are viewable online, while Pro and Business plans include downloadable PDF certificates.",
  },
];

export function PricingPlans({ plans }: PricingPlansProps) {
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

  // Show empty state if no plans
  if (sortedPlans.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <section className="pt-24 pb-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">
              Pricing Plans
            </h1>
            <p className="text-muted-foreground mb-8">
              No pricing plans available at the moment. Please check back later.
            </p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="pt-24 pb-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Pricing
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-muted-foreground text-base max-w-md mx-auto">
            Start free with limited courses. Scale as you grow and unlock unlimited learning.
          </p>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="pb-12">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-3 max-w-4xl mx-auto items-start">
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
      </section>

      {/* Comparison Table */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-semibold mb-3">
              Compare all features
            </h2>
            <p className="text-muted-foreground">
              A detailed breakdown of everything included in each plan.
            </p>
          </div>
          <div className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-medium">Feature</th>
                    {sortedPlans.map((plan) => (
                      <th key={plan.id} className="text-center p-4 font-medium">
                        {plan.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((category, categoryIndex) => (
                    <React.Fragment key={categoryIndex}>
                      <tr>
                        <td colSpan={sortedPlans.length + 1} className="p-4 pt-6">
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <category.icon className="w-4 h-4 text-emerald-500" />
                            {category.category}
                          </div>
                        </td>
                      </tr>
                      {category.features.map((feature, featureIndex) => (
                        <tr
                          key={featureIndex}
                          className="border-b border-border/30"
                        >
                          <td className="p-4 text-muted-foreground">
                            {feature.name}
                          </td>
                          {sortedPlans.map((plan) => {
                            const value = feature.getValue(plan);
                            return (
                              <td key={plan.id} className="p-4 text-center">
                                {typeof value === "boolean" ? (
                                  value ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-500 mx-auto" />
                                  ) : (
                                    <X className="w-3.5 h-3.5 text-red-400 mx-auto" />
                                  )
                                ) : (
                                  <span className="text-[12px] text-muted-foreground">
                                    {value}
                                  </span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-semibold mb-3">
              Pricing FAQ
            </h2>
            <p className="text-muted-foreground">
              Common questions about our pricing and plans.
            </p>
          </div>
          <div className="max-w-2xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              {faqItems.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger>{item.question}</AccordionTrigger>
                  <AccordionContent>{item.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-semibold mb-3">
            Ready to start learning?
          </h2>
          <p className="text-muted-foreground mb-8">
            Create your free account and start your first course in minutes.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/register">
              <Button size="lg" className="h-10 px-6 rounded-full">
                Start for free
              </Button>
            </Link>
            <Link href="/courses">
              <Button variant="outline" size="lg" className="h-10 px-6 rounded-full">
                Browse courses
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

