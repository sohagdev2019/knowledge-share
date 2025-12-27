"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRevealOnScroll } from "@/hooks/use-reveal-on-scroll";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

// Smooth scroll function
const scrollToSection = (id: string) => {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};
import {
  Briefcase,
  MapPin,
  Clock,
  Users,
  Heart,
  Globe,
  Coffee,
  GraduationCap,
  DollarSign,
  Calendar,
  ArrowRight,
  Sparkles,
  Building2,
  Target,
  Lightbulb,
  Rocket,
} from "lucide-react";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 },
};

// Reusable animated section component
function AnimatedSection({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={fadeInUp}
      transition={{ duration: 0.6, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Job listing card
function JobCard({
  title,
  department,
  location,
  type,
  index,
}: {
  title: string;
  department: string;
  location: string;
  type: string;
  index: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={fadeInUp}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="p-6 h-full hover:shadow-lg transition-all duration-300 hover:border-primary/50 group cursor-pointer">
        <CardContent className="p-0">
          <div className="flex flex-col h-full">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors duration-300">
                  {title}
                </h3>
                <Badge variant="secondary" className="mb-3">
                  {department}
                </Badge>
              </div>
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Briefcase className="w-8 h-8 text-primary/60 group-hover:text-primary transition-colors duration-300" />
              </motion.div>
            </div>
            <div className="space-y-2 mb-4 flex-1">
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 mr-2" />
                {location}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="w-4 h-4 mr-2" />
                {type}
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300"
            >
              View Details
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Benefit card
function BenefitCard({
  icon: Icon,
  title,
  description,
  index,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  index: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={scaleIn}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="p-6 h-full hover:shadow-lg transition-all duration-300 hover:border-primary/50 group">
        <CardContent className="p-0">
          <div className="flex flex-col items-start">
            <motion.div
              className="p-3 rounded-lg bg-primary/10 mb-4 group-hover:bg-primary/20 transition-colors duration-300"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Icon className="w-6 h-6 text-primary" />
            </motion.div>
            <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors duration-300">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Process step card
function ProcessStep({
  step,
  title,
  description,
  index,
}: {
  step: number;
  title: string;
  description: string;
  index: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={fadeInUp}
      transition={{ duration: 0.5, delay: index * 0.15 }}
      className="relative"
    >
      <div className="flex gap-4">
        <div className="flex flex-col items-center">
          <motion.div
            className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg mb-2"
            whileHover={{ scale: 1.1, rotate: 360 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {step}
          </motion.div>
          {index < 3 && (
            <div className="w-0.5 h-full bg-primary/20 flex-1" />
          )}
        </div>
        <div className="flex-1 pb-8">
          <h3 className="text-xl font-bold mb-2">{title}</h3>
          <p className="text-muted-foreground">{description}</p>
        </div>
      </div>
    </motion.div>
  );
}

export default function CareerPage() {
  const { ref: heroRef, isVisible: heroVisible } =
    useRevealOnScroll<HTMLElement>();

  const jobs: Array<{
    title: string;
    department: string;
    location: string;
    type: string;
  }> = [];

  const benefits = [
    {
      icon: DollarSign,
      title: "Competitive Salary",
      description:
        "We offer competitive compensation packages that reflect your skills and experience.",
    },
    {
      icon: Heart,
      title: "Health & Wellness",
      description:
        "Comprehensive health, dental, and vision insurance for you and your family.",
    },
    {
      icon: Coffee,
      title: "Flexible Work",
      description:
        "Work from anywhere with flexible hours that fit your lifestyle.",
    },
    {
      icon: GraduationCap,
      title: "Learning Budget",
      description:
        "Annual budget for courses, conferences, and professional development.",
    },
    {
      icon: Calendar,
      title: "Unlimited PTO",
      description:
        "Take time off when you need it. We trust you to manage your own schedule.",
    },
    {
      icon: Globe,
      title: "Remote First",
      description:
        "Work from anywhere in the world. We're a fully distributed team.",
    },
  ];

  const values = [
    {
      icon: Target,
      title: "Mission-Driven",
      description:
        "We're building tools that help millions of people learn and grow.",
    },
    {
      icon: Lightbulb,
      title: "Innovation",
      description:
        "We encourage creative thinking and experimentation to solve problems.",
    },
    {
      icon: Users,
      title: "Collaboration",
      description:
        "We believe the best work happens when diverse teams work together.",
    },
    {
      icon: Rocket,
      title: "Growth",
      description:
        "We invest in your professional development and career advancement.",
    },
  ];

  const processSteps = [
    {
      step: 1,
      title: "Apply",
      description:
        "Submit your application through our portal. We review every application carefully.",
    },
    {
      step: 2,
      title: "Initial Screening",
      description:
        "Our team will review your application and reach out if there's a good fit.",
    },
    {
      step: 3,
      title: "Interviews",
      description:
        "Meet with the team through video calls. We'll discuss your experience and goals.",
    },
    {
      step: 4,
      title: "Offer",
      description:
        "If it's a match, we'll extend an offer and welcome you to the team!",
    },
  ];

  return (
    <div className="pb-12 pt-8 md:pt-16 overflow-hidden">
      {/* Hero Section */}
      <AnimatedSection>
        <section ref={heroRef} className="pb-12 md:pb-20 relative">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={heroVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
            >
              <motion.h1
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={heroVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Join the <span className="text-primary relative inline-block">
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={heroVisible ? { opacity: 1, scale: 1 } : {}}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    EduPeak
                  </motion.span>
                  <motion.span
                    className="absolute -top-2 -right-2"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={heroVisible ? { opacity: 1, scale: 1 } : {}}
                    transition={{ duration: 0.3, delay: 0.6 }}
                  >
                    <Sparkles className="w-6 h-6 text-primary animate-pulse" />
                  </motion.span>
                </span>{" "}
                Team
              </motion.h1>
            </motion.div>
            <motion.p
              className="text-xl md:text-2xl font-medium mb-6 text-muted-foreground"
              initial={{ opacity: 0, y: 20 }}
              animate={heroVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Shape the future of education with us
            </motion.p>
            <motion.p
              className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={heroVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              We're looking for passionate individuals who want to make a
              difference in how people learn and grow. Join us in building the
              best learning platform in the world.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={heroVisible ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="lg"
                  className="rounded-full"
                  onClick={() => scrollToSection("openings")}
                >
                  Learn More
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button asChild variant="outline" size="lg" className="rounded-full">
                  <Link href="/contact">
                    Get in Touch
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </AnimatedSection>

      {/* Why Work With Us Section */}
      <AnimatedSection delay={0.1}>
        <section className="py-12 md:py-20 bg-muted/30 relative overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 left-0 w-96 h-96 bg-primary rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary rounded-full blur-3xl" />
          </div>

          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                Why Work With Us
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                We're building something special, and we need talented people to
                help us get there.
              </p>
            </motion.div>

            <motion.div
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
            >
              {values.map((value, index) => (
                <motion.div key={value.title} variants={scaleIn}>
                  <Card className="p-6 h-full hover:shadow-lg transition-all duration-300 hover:border-primary/50 group text-center">
                    <CardContent className="p-0">
                      <motion.div
                        className="p-3 rounded-lg bg-primary/10 mb-4 inline-block group-hover:bg-primary/20 transition-colors duration-300"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <value.icon className="w-6 h-6 text-primary mx-auto" />
                      </motion.div>
                      <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors duration-300">
                        {value.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {value.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      </AnimatedSection>

      {/* Benefits Section */}
      <AnimatedSection delay={0.1}>
        <section className="py-12 md:py-20">
          <div className="max-w-7xl mx-auto px-4">
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                Benefits & Perks
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                We take care of our team with comprehensive benefits and perks
                that support your well-being and growth.
              </p>
            </motion.div>

            <motion.div
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
            >
              {benefits.map((benefit, index) => (
                <BenefitCard
                  key={benefit.title}
                  icon={benefit.icon}
                  title={benefit.title}
                  description={benefit.description}
                  index={index}
                />
              ))}
            </motion.div>
          </div>
        </section>
      </AnimatedSection>

      {/* Open Positions Section */}
      <AnimatedSection delay={0.1}>
        <section
          id="openings"
          className="py-12 md:py-20 bg-muted/30 relative overflow-hidden"
        >
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary rounded-full blur-3xl" />
          </div>

          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                Open Positions
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                We're not currently hiring, but we're always interested in
                connecting with talented people.
              </p>
            </motion.div>

            {/* Empty State */}
            <motion.div
              className="text-center py-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <motion.div
                className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 mb-6"
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Briefcase className="w-12 h-12 text-primary/60" />
              </motion.div>
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                No Open Positions Right Now
              </h3>
              <p className="text-muted-foreground mb-8 max-w-xl mx-auto text-lg">
                We're not actively hiring at the moment, but we're always looking
                for exceptional talent. Feel free to reach out or send us your
                resume for future opportunities.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button asChild size="lg" className="rounded-full">
                    <Link href="/contact">
                      Get in Touch
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="rounded-full"
                  >
                    <Link
                      href="/contact?subject=Resume Submission&message=I'm interested in future opportunities at EduPeak. Please find my resume attached or I can provide it upon request."
                    >
                      Send Us Your Resume
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>
      </AnimatedSection>

      {/* Application Process Section */}
      <AnimatedSection delay={0.1}>
        <section className="py-12 md:py-20">
          <div className="max-w-4xl mx-auto px-4">
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                Our Hiring Process
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground">
                We've designed a straightforward process to help you succeed.
              </p>
            </motion.div>

            <div className="space-y-0">
              {processSteps.map((step, index) => (
                <ProcessStep
                  key={step.step}
                  step={step.step}
                  title={step.title}
                  description={step.description}
                  index={index}
                />
              ))}
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* CTA Section */}
      <AnimatedSection delay={0.1}>
        <section className="py-12 md:py-20 bg-primary text-primary-foreground relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <motion.div
              className="absolute top-1/4 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.1, 0.2, 0.1],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white rounded-full blur-3xl"
              animate={{
                scale: [1.2, 1, 1.2],
                opacity: [0.1, 0.2, 0.1],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>

          <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              <Building2 className="w-16 h-16 mx-auto mb-6 text-primary-foreground/80" />
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                Ready to Join Us?
              </h2>
              <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
                We're excited to meet you! Even though we're not actively hiring,
                we're always interested in connecting with talented people.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    size="lg"
                    variant="secondary"
                    className="rounded-full"
                    onClick={() => scrollToSection("openings")}
                  >
                    Learn More
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="rounded-full border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
                  >
                    <Link
                      href="/contact?subject=Resume Submission&message=I'm interested in future opportunities at EduPeak. Please find my resume attached or I can provide it upon request."
                    >
                      Send Us Your Resume
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>
      </AnimatedSection>
    </div>
  );
}

