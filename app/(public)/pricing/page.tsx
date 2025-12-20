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

const pricingPlans = [
  {
    name: "Free",
    description: "Perfect for getting started",
    price: "$0",
    features: [
      "Access to 5 free courses",
      "Basic progress tracking",
      "Community support",
      "Certificate of completion",
      "Mobile app access",
      "Lifetime course access",
    ],
    ctaText: "Start for free",
    ctaLink: "/register",
    popular: false,
  },
  {
    name: "Pro",
    description: "For serious learners",
    price: "$20",
    features: [
      "Unlimited course access",
      "Advanced progress tracking",
      "Priority support",
      "Downloadable resources",
      "Live Q&A sessions",
      "Advanced analytics",
    ],
    ctaText: "Get started",
    ctaLink: "/register?plan=pro",
    popular: true,
  },
  {
    name: "Scale",
    description: "For teams & organizations",
    price: "$100",
    features: [
      "Everything in Pro",
      "Team management",
      "Custom learning paths",
      "Analytics dashboard",
      "Dedicated support",
      "Bulk enrollment",
    ],
    ctaText: "Get started",
    ctaLink: "/register?plan=scale",
    popular: false,
  },
];

const comparisonFeatures = [
  {
    category: "Course Access",
    icon: BookOpen,
    features: [
      {
        name: "Free courses",
        free: "5 courses",
        pro: "Unlimited",
        scale: "Unlimited",
        enterprise: "Unlimited",
      },
      {
        name: "Premium courses",
        free: false,
        pro: true,
        scale: true,
        enterprise: true,
      },
      {
        name: "New course releases",
        free: false,
        pro: true,
        scale: true,
        enterprise: true,
      },
      {
        name: "Course downloads",
        free: false,
        pro: true,
        scale: true,
        enterprise: true,
      },
      {
        name: "Offline access",
        free: false,
        pro: true,
        scale: true,
        enterprise: true,
      },
    ],
  },
  {
    category: "Learning Features",
    icon: Gamepad2,
    features: [
      {
        name: "Interactive quizzes",
        free: true,
        pro: true,
        scale: true,
        enterprise: true,
      },
      {
        name: "Hands-on projects",
        free: true,
        pro: true,
        scale: true,
        enterprise: true,
      },
      {
        name: "Video lessons",
        free: true,
        pro: true,
        scale: true,
        enterprise: true,
      },
      {
        name: "Code playground",
        free: false,
        pro: true,
        scale: true,
        enterprise: true,
      },
      {
        name: "Practice exercises",
        free: true,
        pro: true,
        scale: true,
        enterprise: true,
      },
      {
        name: "Learning paths",
        free: false,
        pro: true,
        scale: true,
        enterprise: true,
      },
    ],
  },
  {
    category: "Progress & Analytics",
    icon: BarChart3,
    features: [
      {
        name: "Basic progress tracking",
        free: true,
        pro: true,
        scale: true,
        enterprise: true,
      },
      {
        name: "Advanced analytics",
        free: false,
        pro: true,
        scale: true,
        enterprise: true,
      },
      {
        name: "Learning insights",
        free: false,
        pro: true,
        scale: true,
        enterprise: true,
      },
      {
        name: "Performance reports",
        free: false,
        pro: true,
        scale: true,
        enterprise: true,
      },
      {
        name: "Skill assessments",
        free: false,
        pro: true,
        scale: true,
        enterprise: true,
      },
      {
        name: "Export progress data",
        free: false,
        pro: false,
        scale: true,
        enterprise: true,
      },
    ],
  },
  {
    category: "Certificates & Credentials",
    icon: Award,
    features: [
      {
        name: "Course completion certificates",
        free: true,
        pro: true,
        scale: true,
        enterprise: true,
      },
      {
        name: "Downloadable certificates",
        free: false,
        pro: true,
        scale: true,
        enterprise: true,
      },
      {
        name: "Verifiable credentials",
        free: false,
        pro: true,
        scale: true,
        enterprise: true,
      },
      {
        name: "Learning transcripts",
        free: false,
        pro: true,
        scale: true,
        enterprise: true,
      },
      {
        name: "Digital badges",
        free: false,
        pro: true,
        scale: true,
        enterprise: true,
      },
    ],
  },
  {
    category: "Support & Community",
    icon: Users,
    features: [
      {
        name: "Community support",
        free: true,
        pro: true,
        scale: true,
        enterprise: true,
      },
      {
        name: "Priority support",
        free: false,
        pro: true,
        scale: true,
        enterprise: true,
      },
      {
        name: "Live Q&A sessions",
        free: false,
        pro: true,
        scale: true,
        enterprise: true,
      },
      {
        name: "1-on-1 mentoring",
        free: false,
        pro: false,
        scale: false,
        enterprise: true,
      },
      {
        name: "Dedicated account manager",
        free: false,
        pro: false,
        scale: false,
        enterprise: true,
      },
      {
        name: "Custom training sessions",
        free: false,
        pro: false,
        scale: false,
        enterprise: true,
      },
    ],
  },
  {
    category: "Team & Collaboration",
    icon: Users,
    features: [
      {
        name: "Team workspaces",
        free: false,
        pro: false,
        scale: true,
        enterprise: true,
      },
      {
        name: "Team members",
        free: "1",
        pro: "1",
        scale: "Up to 50",
        enterprise: "Unlimited",
      },
      {
        name: "Role-based access",
        free: false,
        pro: false,
        scale: true,
        enterprise: true,
      },
      {
        name: "Team progress tracking",
        free: false,
        pro: false,
        scale: true,
        enterprise: true,
      },
      {
        name: "Bulk enrollment",
        free: false,
        pro: false,
        scale: true,
        enterprise: true,
      },
      {
        name: "Custom learning paths",
        free: false,
        pro: false,
        scale: true,
        enterprise: true,
      },
    ],
  },
  {
    category: "Resources & Downloads",
    icon: Download,
    features: [
      {
        name: "Course materials",
        free: true,
        pro: true,
        scale: true,
        enterprise: true,
      },
      {
        name: "Downloadable resources",
        free: false,
        pro: true,
        scale: true,
        enterprise: true,
      },
      {
        name: "Source code access",
        free: false,
        pro: true,
        scale: true,
        enterprise: true,
      },
      {
        name: "Templates & tools",
        free: false,
        pro: true,
        scale: true,
        enterprise: true,
      },
      {
        name: "Resource library",
        free: false,
        pro: true,
        scale: true,
        enterprise: true,
      },
    ],
  },
  {
    category: "Platform Features",
    icon: Globe,
    features: [
      {
        name: "Mobile app access",
        free: true,
        pro: true,
        scale: true,
        enterprise: true,
      },
      {
        name: "Offline mode",
        free: false,
        pro: true,
        scale: true,
        enterprise: true,
      },
      {
        name: "API access",
        free: false,
        pro: false,
        scale: true,
        enterprise: true,
      },
      {
        name: "SSO integration",
        free: false,
        pro: false,
        scale: false,
        enterprise: true,
      },
      {
        name: "Custom branding",
        free: false,
        pro: false,
        scale: false,
        enterprise: true,
      },
      {
        name: "White-label option",
        free: false,
        pro: false,
        scale: false,
        enterprise: true,
      },
    ],
  },
];

const faqItems = [
  {
    question: "How does the free plan work?",
    answer:
      "The free plan gives you access to 5 free courses with basic progress tracking and community support. You can upgrade anytime to unlock unlimited courses and advanced features. All courses you start on the free plan remain accessible even if you don't upgrade.",
  },
  {
    question: "Can I change my plan anytime?",
    answer:
      "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any charges or credits based on your billing cycle. You can also cancel your subscription at any time without losing access to courses you've already enrolled in.",
  },
  {
    question: "What happens if I exceed my course limit?",
    answer:
      "If you're on the free plan and want to access more than 5 courses, you'll need to upgrade to Pro or Scale. Your progress in existing courses is always saved, and you can continue learning from where you left off after upgrading.",
  },
  {
    question: "Do I lose access to courses if I cancel?",
    answer:
      "No, you'll retain lifetime access to all courses you've enrolled in, even after canceling your subscription. However, you won't be able to enroll in new premium courses or access premium features until you resubscribe.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and bank transfers for Enterprise plans. All payments are processed securely through our payment partners. You can also pay annually to save up to 20%.",
  },
  {
    question: "Are certificates included in all plans?",
    answer:
      "Yes, all plans include course completion certificates. Free plan certificates are viewable online, while Pro and Scale plans include downloadable PDF certificates. Enterprise plans can also get verifiable digital credentials and learning transcripts.",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Pricing
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-muted-foreground text-base max-w-md mx-auto">
            Start free with 5 courses. Scale as you grow and unlock unlimited learning.
          </p>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="pb-20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl border p-6 bg-white dark:bg-zinc-900 ${
                  plan.popular
                    ? "border-foreground ring-1 ring-foreground"
                    : "border-border/50"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-foreground text-background text-xs font-medium px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-1">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {plan.description}
                  </p>
                </div>
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-semibold">{plan.price}</span>
                    <span className="text-muted-foreground text-sm">
                      /month
                    </span>
                  </div>
                </div>
                <div className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-sm"
                    >
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                <Link href={plan.ctaLink} className="block">
                  <Button
                    variant={plan.popular ? "default" : "outline"}
                    className="w-full h-10 rounded-full"
                  >
                    {plan.ctaText}
                  </Button>
                </Link>
              </div>
            ))}
          </div>

          {/* Enterprise Section */}
          <div className="mt-6 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-900 max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-1">Enterprise</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  For large organizations with custom requirements
                </p>
                <div className="flex flex-wrap gap-x-6 gap-y-2">
                  <span className="text-sm flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" />
                    Unlimited everything
                  </span>
                  <span className="text-sm flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" />
                    Custom learning paths
                  </span>
                  <span className="text-sm flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" />
                    SSO & API access
                  </span>
                  <span className="text-sm flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" />
                    Dedicated support
                  </span>
                </div>
              </div>
              <a href="mailto:sales@example.com">
                <Button className="h-10 px-6 rounded-full">
                  Contact Sales
                </Button>
              </a>
            </div>
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
                    <th className="text-center p-4 font-medium">Free</th>
                    <th className="text-center p-4 font-medium">Pro</th>
                    <th className="text-center p-4 font-medium">Scale</th>
                    <th className="text-center p-4 font-medium">Enterprise</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((category, categoryIndex) => (
                    <React.Fragment key={categoryIndex}>
                      <tr>
                        <td colSpan={5} className="p-4 pt-6">
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
                          <td className="p-4 text-center">
                            {typeof feature.free === "boolean" ? (
                              feature.free ? (
                                <Check className="w-3.5 h-3.5 text-emerald-500 mx-auto" />
                              ) : (
                                <X className="w-3.5 h-3.5 text-red-400 mx-auto" />
                              )
                            ) : (
                              <span className="text-[12px] text-muted-foreground">
                                {feature.free}
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-center">
                            {typeof feature.pro === "boolean" ? (
                              feature.pro ? (
                                <Check className="w-3.5 h-3.5 text-emerald-500 mx-auto" />
                              ) : (
                                <X className="w-3.5 h-3.5 text-red-400 mx-auto" />
                              )
                            ) : (
                              <span className="text-[12px] text-muted-foreground">
                                {feature.pro}
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-center">
                            {typeof feature.scale === "boolean" ? (
                              feature.scale ? (
                                <Check className="w-3.5 h-3.5 text-emerald-500 mx-auto" />
                              ) : (
                                <X className="w-3.5 h-3.5 text-red-400 mx-auto" />
                              )
                            ) : (
                              <span className="text-[12px] text-muted-foreground">
                                {feature.scale}
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-center">
                            {typeof feature.enterprise === "boolean" ? (
                              feature.enterprise ? (
                                <Check className="w-3.5 h-3.5 text-emerald-500 mx-auto" />
                              ) : (
                                <X className="w-3.5 h-3.5 text-red-400 mx-auto" />
                              )
                            ) : (
                              <span className="text-[12px] text-muted-foreground">
                                {feature.enterprise}
                              </span>
                            )}
                          </td>
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
