"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookOpenCheck,
  DollarSign,
  Globe,
  GraduationCap,
  Users,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { useRevealOnScroll } from "@/hooks/use-reveal-on-scroll";

const highlights = [
  {
    title: "Flexible Work",
    description: "Teach on your schedule from anywhere in the world.",
    icon: <BookOpenCheck className="h-6 w-6 text-primary" />,
  },
  {
    title: "Earning Potential",
    description: "Grow recurring revenue with courses, cohorts, and coaching.",
    icon: <DollarSign className="h-6 w-6 text-primary" />,
  },
  {
    title: "Impact",
    description: "Reach thousands of learners hungry for expertise.",
    icon: <Globe className="h-6 w-6 text-primary" />,
  },
  {
    title: "Support",
    description: "Dedicated success team, marketing kits, and resources.",
    icon: <Users className="h-6 w-6 text-primary" />,
  },
];

const workflowSteps = [
  {
    title: "Apply & Get Approved",
    description: "Submit your application and get approved to access the platform.",
  },
  {
    title: "Create & Upload Content",
    description: "Develop and upload your courses, including videos, assessments, and resources.",
  },
  {
    title: "Teach & Earn",
    description: "Reach learners worldwide, teach, and start earning with flexible schedules.",
  },
];

export default function BecomeAnInstructorPage() {
  const heroReveal = useRevealOnScroll<HTMLElement>();
  const highlightsReveal = useRevealOnScroll<HTMLElement>();
  const workflowReveal = useRevealOnScroll<HTMLElement>();

  return (
    <div className="bg-background text-foreground">
      {/* Hero */}
      <section
        ref={heroReveal.ref}
        className={`relative transition-all duration-700 ${
          heroReveal.isVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4"
        }`}
      >
        <div className="mx-auto max-w-6xl px-4 pt-10 text-center">
          <div className="text-3xl font-bold tracking-wide text-foreground">
            Become an Instructor
          </div>
        </div>
        <div className="relative mx-auto flex max-w-6xl flex-col gap-12 px-4 py-20 lg:flex-row lg:items-center">
          <div className="max-w-xl space-y-6">
            <Badge className="bg-pink-100 text-pink-700 hover:bg-pink-100 dark:bg-pink-500/20 dark:text-pink-100">
              Share Knowledge
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Share Your Knowledge. Inspire the Future.
            </h1>
            <p className="text-lg text-muted-foreground">
              Empower learners worldwide and earn doing what you love. Join a
              community of creators transforming education through engaging,
              high-impact learning experiences.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button size="lg" className="h-12 px-8 text-base">
                Register Now
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-8 text-base"
                asChild
              >
                <Link href="/courses">
                  Browse Courses <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="flex flex-wrap gap-6 pt-4 text-sm text-muted-foreground">
              <div>
                <span className="font-semibold text-foreground">
                  Personal onboarding
                </span>{" "}
                with curriculum coaches
              </div>
              <div>
                <span className="font-semibold text-foreground">
                  Revenue sharing
                </span>{" "}
                from day one
              </div>
            </div>
          </div>
          <div className="relative flex-1">
            <div className="relative mx-auto w-full max-w-[420px] rounded-[32px] border border-white/60 bg-white/80 p-4 shadow-2xl backdrop-blur dark:border-white/10 dark:bg-slate-900/80">
              <div className="grid grid-cols-2 gap-4">
                {highlights.slice(0, 2).map((highlight) => (
                  <div
                    key={highlight.title}
                    className="rounded-2xl border border-border/80 bg-white/80 p-4 text-sm shadow-sm dark:bg-slate-800/80"
                  >
                    <div className="mb-3 inline-flex items-center justify-center rounded-full bg-primary/10 p-2">
                      {highlight.icon}
                    </div>
                    <p className="font-semibold">{highlight.title}</p>
                    <p className="text-muted-foreground text-xs">
                      {highlight.description}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 text-center shadow-inner">
                <p className="text-sm uppercase tracking-wide text-primary/80">
                  Community Stories
                </p>
                <p className="text-2xl font-bold text-foreground">
                  “Teaching here changed my life.”
                </p>
                <p className="text-xs text-muted-foreground">
                  — Maya Chen, Product Design Lead
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section
        ref={highlightsReveal.ref}
        className="mx-auto max-w-6xl px-4 py-20"
      >
        <div className="grid gap-6 md:grid-cols-2">
          {highlights.map((highlight, index) => (
            <div
              key={highlight.title}
              className={`group rounded-2xl border border-border bg-card/60 p-6 shadow-sm transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg ${
                highlightsReveal.isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
              style={{
                transitionDuration: "700ms",
                transitionDelay: `${index * 100}ms`,
              }}
            >
              <div className="flex items-center gap-4">
                <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                  {highlight.icon}
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{highlight.title}</h3>
                  <p className="text-muted-foreground">
                    {highlight.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Workflow */}
      <section
        ref={workflowReveal.ref}
        className={`py-24 transition-all duration-700 ${
          workflowReveal.isVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-6"
        }`}
      >
        <div className="mx-auto w-full px-4 lg:px-10">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
              Our Workflow
            </p>
            <h2 className="mt-3 text-4xl font-bold text-foreground">
              How It Works
            </h2>
            <p className="mt-2 text-muted-foreground">
              Turn your expertise into impact in just three simple steps.
            </p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {workflowSteps.map((step, index) => (
              <div
                key={step.title}
                className={`h-full rounded-3xl border border-border bg-card p-8 text-center transition-all duration-700 ${
                  workflowReveal.isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4"
                }`}
                style={{ transitionDelay: `${index * 120}ms` }}
              >
                <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent dark:from-slate-600 dark:via-slate-700 dark:to-slate-800 border border-primary/20 dark:border-slate-500">
                  <span className="text-lg font-semibold text-primary dark:text-white">
                    Step {index + 1}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>


    </div>
  );
}


