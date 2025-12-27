"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check, X, BookOpen, Users, Award, BarChart3, Download, MessageSquare, Zap, Clock, Globe, Headphones, Code, Video, FileText, Gamepad2, Loader2, Sparkles, CheckCircle2, GraduationCap, UserCog, Shield, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SubscriptionPlanType } from "@/app/data/subscription/get-subscription-plans";
import { UserSubscriptionType } from "@/app/data/subscription/get-user-subscription";
import { cancelSubscription, upgradeSubscription } from "../actions";
import { filterPlansByRole, isAdminPlan } from "@/lib/plan-utils";
import type { UserRole } from "@/lib/role-access";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

interface PricingPlansProps {
  plans: SubscriptionPlanType[];
  currentSubscription: UserSubscriptionType | null;
  userRole: UserRole | null;
  isLoggedIn: boolean;
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
    if (plan.teamSeats === null) {
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

export function PricingPlans({ plans, currentSubscription, userRole, isLoggedIn }: PricingPlansProps) {
  const router = useRouter();
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"student" | "teacher" | "all">(() => {
    // Set initial tab based on user role
    if (!isLoggedIn) return "student"; // Default for guests
    if (userRole === "admin") return "teacher";
    if (userRole === "user") return "student";
    if (userRole === "superadmin") return "all";
    return "student";
  });

  // Determine if tabs should be shown and locked
  const showTabs = !isLoggedIn || userRole === "superadmin";
  const tabsLocked = isLoggedIn && userRole !== "superadmin";

  // Filter plans based on selected role and user role
  const getFilteredPlans = () => {
    if (!isLoggedIn) {
      // Guest: show plans based on selected tab
      return filterPlansByRole(plans, selectedRole);
    }
    
    if (userRole === "user") {
      // User: only show student plans
      return filterPlansByRole(plans, "student");
    }
    
    if (userRole === "admin") {
      // Admin: only show teacher plans
      return filterPlansByRole(plans, "teacher");
    }
    
    if (userRole === "superadmin") {
      // SuperAdmin: show plans based on selected tab
      return filterPlansByRole(plans, selectedRole);
    }
    
    return plans;
  };

  // Sort plans in specific order
  // Student plans: Personal > Team > Enterprise
  // Teacher plans: Starter Teacher > Pro Teacher > Elite Teacher
  const planOrder: Record<string, number> = {
    // Student plans
    personal: 1,
    team: 2,
    enterprise: 3,
    // Teacher plans
    "starter-teacher": 1,
    "pro-teacher": 2,
    "elite-teacher": 3,
  };

  const filteredPlans = getFilteredPlans();
  const sortedPlans = [...filteredPlans].sort((a, b) => {
    // Check if plans are teacher plans
    const aIsTeacher = isAdminPlan(a);
    const bIsTeacher = isAdminPlan(b);
    
    // If both are teacher plans or both are student plans, use the order
    if (aIsTeacher === bIsTeacher) {
      const orderA = planOrder[a.slug.toLowerCase()] ?? 999;
      const orderB = planOrder[b.slug.toLowerCase()] ?? 999;
      return orderA - orderB;
    }
    
    // If different types, keep original order (shouldn't happen after filtering)
    return 0;
  });

  const handleGetStarted = async (plan: SubscriptionPlanType) => {
    // SuperAdmin: disable subscription
    if (userRole === "superadmin") {
      toast.info("Super Admin accounts do not require subscriptions.");
      return;
    }

    // Guest: redirect to login
    if (!isLoggedIn) {
      router.push(`/login?redirect=/checkout?plan=${plan.slug}&billing=monthly`);
      return;
    }

    // Check if user is trying to subscribe to wrong plan type
    const planIsAdminPlan = isAdminPlan(plan);
    if (userRole === "user" && planIsAdminPlan) {
      toast.error("Student accounts cannot subscribe to teacher plans.");
      return;
    }
    if (userRole === "admin" && !planIsAdminPlan) {
      toast.error("Teacher accounts cannot subscribe to student plans.");
      return;
    }

    setLoadingPlanId(plan.id);
    
    // If user has an active subscription, treat it as an upgrade
    if (currentSubscription && (currentSubscription.status === "Active" || currentSubscription.status === "Trial")) {
      if (currentSubscription.planId === plan.id) {
        // Same plan - redirect to subscription management (role-aware)
        const subscriptionPath = userRole === "admin" ? "/admin/subscription" : "/dashboard/subscription";
        router.push(subscriptionPath);
        setLoadingPlanId(null);
        return;
      } else {
        // Different plan - trigger upgrade
        await handleUpgrade(plan.id);
        return;
      }
    }
    
    // Add animation delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    router.push(`/checkout?plan=${plan.slug}&billing=monthly`);
  };

  const handleUpgrade = async (planId: string) => {
    setLoadingPlanId(planId);
    try {
      const result = await upgradeSubscription(planId);
      if (result.status === "success") {
        if (result.checkoutUrl) {
          window.location.href = result.checkoutUrl;
        } else {
          toast.success(result.message || "Subscription upgraded successfully");
          router.refresh();
        }
      } else {
        toast.error(result.message || "Failed to upgrade subscription");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoadingPlanId(null);
    }
  };

  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      const result = await cancelSubscription();
      if (result.status === "success") {
        toast.success(result.message || "Subscription cancelled successfully");
        router.refresh();
      } else {
        toast.error(result.message || "Failed to cancel subscription");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsCancelling(false);
    }
  };

  // Check if there are any plans at all (for complete empty state)
  const hasAnyPlans = plans.length > 0;

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
            {!isLoggedIn 
              ? "Whether you're learning or teaching, we've got a plan for you."
              : userRole === "user"
              ? "Start free with limited courses. Scale as you grow and unlock unlimited learning."
              : userRole === "admin"
              ? "Teacher plans are designed for course creators."
              : "Choose the plan that fits your needs."}
          </p>
        </div>
      </section>

      {/* Role Switcher Tabs */}
      {showTabs && (
        <section className="pb-8">
          <div className="max-w-4xl mx-auto px-4">
            <Tabs 
              value={selectedRole === "all" ? "all" : selectedRole} 
              onValueChange={(value) => setSelectedRole(value as "student" | "teacher" | "all")}
              className="w-full"
            >
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
                <TabsTrigger value="student" disabled={tabsLocked && userRole !== "superadmin"}>
                  <GraduationCap className="w-4 h-4 mr-2" />
                  Student
                </TabsTrigger>
                <TabsTrigger value="teacher" disabled={tabsLocked && userRole !== "superadmin"}>
                  <UserCog className="w-4 h-4 mr-2" />
                  Teacher
                </TabsTrigger>
                {userRole === "superadmin" && (
                  <TabsTrigger value="all">
                    <Shield className="w-4 h-4 mr-2" />
                    All
                  </TabsTrigger>
                )}
              </TabsList>
            </Tabs>
          </div>
        </section>
      )}

      {/* Current Subscription Banner */}
      {currentSubscription && (currentSubscription.status === "Active" || currentSubscription.status === "Trial") && (
        <motion.section
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-5xl mx-auto px-4 mb-8"
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <div>
                <p className="font-semibold text-emerald-900 dark:text-emerald-100">
                  Current Plan: {currentSubscription.plan.name} 
                  {currentSubscription.status === "Trial" && (
                    <span className="ml-2 text-xs font-normal bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">
                      Trial
                    </span>
                  )}
                </p>
                <p className="text-sm text-emerald-700 dark:text-emerald-300">
                  {currentSubscription.nextBillingDate
                    ? `Next billing: ${new Date(currentSubscription.nextBillingDate).toLocaleDateString()}`
                    : currentSubscription.status === "Trial"
                    ? `Trial ends: ${currentSubscription.endDate ? new Date(currentSubscription.endDate).toLocaleDateString() : "N/A"}`
                    : "Active subscription"}
                </p>
              </div>
            </div>
            <Link href={userRole === "admin" ? "/admin/subscription" : "/dashboard/subscription"}>
              <Button variant="outline" size="sm" className="border-emerald-300 dark:border-emerald-700">
                Manage Subscription
              </Button>
            </Link>
          </motion.div>
        </motion.section>
      )}

      {/* Pricing Plans */}
      <section className="pb-12">
        <div className="max-w-5xl mx-auto px-4">
          {sortedPlans.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg mb-2">
                {selectedRole === "teacher" 
                  ? "No teacher plans available at the moment."
                  : selectedRole === "student"
                  ? "No student plans available at the moment."
                  : "No pricing plans available at the moment."}
              </p>
              <p className="text-sm text-muted-foreground">
                Please check back later or contact support for more information.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-3 max-w-4xl mx-auto items-start">
              {sortedPlans.map((plan, index) => {
              const price = plan.priceMonthly;
              const features = buildFeaturesList(plan);
              const hasPrice = price !== null && price !== undefined;
              const isCurrentPlan = currentSubscription?.planId === plan.id;
              const isCurrentPlanActive = isCurrentPlan && (currentSubscription?.status === "Active" || currentSubscription?.status === "Trial");
              const hasAnyActiveSubscription = currentSubscription && (currentSubscription.status === "Active" || currentSubscription.status === "Trial");
              const isLoading = loadingPlanId === plan.id;

              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={`relative rounded-2xl border p-6 bg-white dark:bg-zinc-900 flex flex-col transition-all duration-300 ${
                    plan.isPopular
                      ? "border-foreground ring-1 ring-foreground shadow-lg"
                      : "border-border/50"
                  } ${isCurrentPlanActive ? "ring-2 ring-emerald-500" : ""}`}
                >
                  {plan.isPopular && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2 }}
                      className="absolute -top-3 left-1/2 -translate-x-1/2"
                    >
                      <span className="bg-foreground text-background text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Most Popular
                      </span>
                    </motion.div>
                  )}
                  {isCurrentPlanActive && (
                    <div className="absolute -top-3 right-4">
                      <span className="bg-emerald-500 text-white text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        {currentSubscription?.status === "Trial" ? "Current Plan (Trial)" : "Current Plan"}
                      </span>
                    </div>
                  )}
                  {hasAnyActiveSubscription && !isCurrentPlanActive && (
                    <div className="absolute -top-3 right-4">
                      <span className="bg-blue-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                        Upgrade Available
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
                  <div className="space-y-2 mb-4 flex-grow">
                    {features.map((feature, featureIndex) => (
                      <motion.div
                        key={featureIndex}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + featureIndex * 0.05 }}
                        className="flex items-center gap-2 text-sm"
                      >
                        <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>{feature}</span>
                      </motion.div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    {isCurrentPlanActive ? (
                      <>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              className="w-full h-10 rounded-full"
                              disabled={isCancelling}
                            >
                              {isCancelling ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Cancelling...
                                </>
                              ) : (
                                "Cancel Subscription"
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Cancel Subscription?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to cancel your subscription? You'll retain access until the end of your current billing period. You can reactivate anytime.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={handleCancel}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Cancel Subscription
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        {(() => {
                          const currentPlanOrder = planOrder[plan.slug.toLowerCase()] ?? 999;
                          const upgradePlan = sortedPlans.find(p => {
                            const otherPlanOrder = planOrder[p.slug.toLowerCase()] ?? 999;
                            return otherPlanOrder > currentPlanOrder && p.priceMonthly !== null;
                          });
                          
                          return upgradePlan ? (
                            <Button
                              variant="outline"
                              className="w-full h-10 rounded-full"
                              onClick={() => handleUpgrade(upgradePlan.id)}
                              disabled={isLoading}
                            >
                              {isLoading ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Processing...
                                </>
                              ) : (
                                `Upgrade to ${upgradePlan.name}`
                              )}
                            </Button>
                          ) : null;
                        })()}
                      </>
                    ) : hasPrice ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <motion.div
                            whileHover={userRole !== "superadmin" ? { scale: 1.02 } : {}}
                            whileTap={userRole !== "superadmin" ? { scale: 0.98 } : {}}
                          >
                            <Button
                              variant={plan.isPopular ? "default" : "outline"}
                              className={`w-full h-10 rounded-full relative overflow-hidden group ${
                                userRole === "superadmin" ? "opacity-60 cursor-not-allowed" : ""
                              }`}
                              onClick={() => handleGetStarted(plan)}
                              disabled={
                                isLoading || 
                                (hasAnyActiveSubscription && !isCurrentPlanActive) ||
                                userRole === "superadmin"
                              }
                            >
                              <AnimatePresence mode="wait">
                                {isLoading ? (
                                  <motion.div
                                    key="loading"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex items-center justify-center"
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
                                    className="flex items-center justify-center"
                                  >
                                    {userRole === "superadmin" ? (
                                      <>
                                        <Lock className="mr-2 h-4 w-4" />
                                        Not Required
                                      </>
                                    ) : !isLoggedIn ? (
                                      <>
                                        Login to Subscribe
                                        <Sparkles className="ml-2 h-4 w-4 group-hover:animate-pulse" />
                                      </>
                                    ) : hasAnyActiveSubscription && !isCurrentPlanActive ? (
                                      <>
                                        <Sparkles className="mr-2 h-4 w-4" />
                                        Upgrade to {plan.name}
                                      </>
                                    ) : isAdminPlan(plan) && userRole === "admin" ? (
                                      <>
                                        Subscribe as Teacher
                                        <Sparkles className="ml-2 h-4 w-4 group-hover:animate-pulse" />
                                      </>
                                    ) : (
                                      <>
                                        Get Started
                                        <Sparkles className="ml-2 h-4 w-4 group-hover:animate-pulse" />
                                      </>
                                    )}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </Button>
                          </motion.div>
                        </TooltipTrigger>
                        {userRole === "superadmin" && (
                          <TooltipContent>
                            <p>Super Admin accounts don&apos;t need subscriptions.</p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    ) : (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div>
                            {userRole === "superadmin" ? (
                              <Button
                                variant={plan.isPopular ? "default" : "outline"}
                                className="w-full h-10 rounded-full opacity-60 cursor-not-allowed"
                                disabled
                              >
                                <Lock className="mr-2 h-4 w-4" />
                                Not Required
                              </Button>
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
                        </TooltipTrigger>
                        {userRole === "superadmin" && (
                          <TooltipContent>
                            <p>Super Admin accounts don&apos;t need subscriptions.</p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    )}
                  </div>
                </motion.div>
              );
            })}
            </div>
          )}

          {sortedPlans.length > 0 && (
            <p className="text-center text-sm text-muted-foreground mt-6">
              No credit card required • Cancel anytime
            </p>
          )}
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

