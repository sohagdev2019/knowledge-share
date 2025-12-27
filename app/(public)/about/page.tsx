"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRevealOnScroll } from "@/hooks/use-reveal-on-scroll";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  GraduationCap,
  Users,
  TrendingUp,
  School,
  DollarSign,
  ArrowRight,
  Sparkles,
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

// Animated stat card
function StatCard({
  value,
  label,
  index,
}: {
  value: string;
  label: string;
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
      className="text-center border-t pt-6"
    >
      <motion.h3
        className="text-4xl md:text-5xl font-bold mb-2"
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
      >
        {value}
      </motion.h3>
      <p className="text-sm md:text-base uppercase text-muted-foreground">
        {label}
      </p>
    </motion.div>
  );
}

// Animated value card
function ValueCard({
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
      variants={fadeInUp}
      transition={{ duration: 0.6, delay: index * 0.15 }}
    >
      <Card className="p-6 md:p-8 h-full hover:shadow-lg transition-all duration-300 hover:border-primary/50 group">
        <CardContent className="p-0">
          <div className="flex flex-col items-start">
            <motion.div
              className="p-3 rounded-lg bg-primary/10 mb-4 group-hover:bg-primary/20 transition-colors duration-300"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Icon className="w-6 h-6 text-primary" />
            </motion.div>
            <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors duration-300">
              {title}
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Team member card
function TeamMemberCard({
  name,
  role,
  index,
}: {
  name: string;
  role: string;
  index: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-30px" });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={scaleIn}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="flex flex-col items-center text-center"
    >
      <motion.div
        className="relative w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 mb-3 overflow-hidden border-2 border-primary/10"
        whileHover={{ scale: 1.1, borderColor: "hsl(var(--primary))" }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <Users className="w-8 h-8 md:w-10 md:h-10 text-primary/60" />
        </div>
      </motion.div>
      <h4 className="text-sm font-bold mb-1">{name}</h4>
      <p className="text-xs text-muted-foreground">{role}</p>
    </motion.div>
  );
}

export default function AboutPage() {
  const { ref: heroRef, isVisible: heroVisible } =
    useRevealOnScroll<HTMLElement>();

  const teamMembers = [
    { name: "Paul Haney", role: "CEO" },
    { name: "Gail Lanier", role: "Engineering" },
    { name: "Sarah Johnson", role: "Manager" },
    { name: "Mary Holler", role: "Sales" },
    { name: "Gilbert Farr", role: "Operator" },
    { name: "Charlie Holland", role: "Designer" },
    { name: "James Butler", role: "Developer" },
    { name: "Richard Lane", role: "Insight" },
    { name: "Emma Wilson", role: "SEO" },
    { name: "David Chen", role: "Content" },
    { name: "Lisa Anderson", role: "Designer" },
    { name: "Michael Brown", role: "Developer" },
  ];

  const stats = [
    { value: "20M", label: "Learners" },
    { value: "57K", label: "Instructors" },
    { value: "21K", label: "Courses" },
    { value: "380M", label: "Course enrollments" },
  ];

  const values = [
    {
      icon: School,
      title: "Make Education Accessible",
      description:
        "We believe that quality education should be available to everyone, regardless of their background or location. Our platform breaks down barriers and makes learning accessible to all.",
    },
    {
      icon: TrendingUp,
      title: "Learn and Grow",
      description:
        "Continuous learning is at the heart of personal and professional growth. We provide the tools and resources needed for lifelong learning and skill development.",
    },
    {
      icon: DollarSign,
      title: "Affordable Excellence",
      description:
        "We strive to provide high-quality educational content at affordable prices, ensuring that financial constraints don't limit anyone's learning journey.",
    },
  ];

  return (
    <div className="pb-12 pt-8 md:pt-16 overflow-hidden">
      {/* Hero Section */}
      <AnimatedSection>
        <section
          ref={heroRef}
          className="pb-12 md:pb-20 relative"
        >
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
                Hi there, we're{" "}
                <span className="text-primary relative inline-block">
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
                </span>
              </motion.h1>
            </motion.div>
            <motion.p
              className="text-xl md:text-2xl font-medium mb-6 text-muted-foreground"
              initial={{ opacity: 0, y: 20 }}
              animate={heroVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              We're building the best next-generation interactive learning
              platform for students, instructors, developers, and lifelong
              learners.
            </motion.p>
            <motion.p
              className="text-lg md:text-xl text-muted-foreground leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={heroVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              EduPeak provides clean and consistent course designs to help you
              create beautiful learning experiences. EduPeak is a feature-rich
              platform with beautifully designed courses that help you create the
              best possible educational content and learning projects.
            </motion.p>
          </div>
        </section>
      </AnimatedSection>

      {/* Image Gallery Section */}
      <AnimatedSection delay={0.2}>
        <section className="pb-12 md:pb-20">
          <div className="max-w-7xl mx-auto px-4">
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
            >
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <motion.div
                  key={num}
                  variants={scaleIn}
                  className="relative aspect-video rounded-lg overflow-hidden bg-gradient-to-br from-muted to-muted/50 group cursor-pointer"
                  whileHover={{ scale: 1.02, y: -4 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-muted-foreground text-sm font-medium">
                      Image {num}
                    </p>
                  </div>
                  <div className="absolute inset-0 bg-muted" />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      </AnimatedSection>

      {/* Global Reach Section */}
      <AnimatedSection delay={0.1}>
        <section className="py-12 md:py-20 bg-muted/30 relative overflow-hidden">
          {/* Background decoration */}
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
                Our global reach
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                EduPeak is the leading global marketplace for teaching and
                learning, connecting millions of students to the skills they need
                to succeed.
              </p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mt-12">
              {stats.map((stat, index) => (
                <StatCard
                  key={stat.label}
                  value={stat.value}
                  label={stat.label}
                  index={index}
                />
              ))}
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Core Values Section */}
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
                Our core values
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                Our core values are the fundamental beliefs of EduPeak. We help
                people understand the difference between right and wrong, and
                empower them to achieve their learning goals.
              </p>
            </motion.div>

            <motion.div
              className="grid md:grid-cols-3 gap-6 mt-12"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
            >
              {values.map((value, index) => (
                <ValueCard
                  key={value.title}
                  icon={value.icon}
                  title={value.title}
                  description={value.description}
                  index={index}
                />
              ))}
            </motion.div>
          </div>
        </section>
      </AnimatedSection>

      {/* Our Team Section */}
      <AnimatedSection delay={0.1}>
        <section className="py-12 md:py-20 bg-muted/30 relative overflow-hidden">
          {/* Background decoration */}
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
                Our Team
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                Want to work with some of the best global talent and build a tool
                used by all the companies you know and love? Join the EduPeak
                team and help shape the future of education.
              </p>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Button asChild size="lg" className="rounded-full">
                  <Link href="/career">
                    View Openings
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
              </motion.div>
            </motion.div>

            {/* Team Members Grid */}
            <motion.div
              className="grid grid-cols-3 md:grid-cols-6 gap-4 md:gap-6 mt-12"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
            >
              {teamMembers.map((member, index) => (
                <TeamMemberCard
                  key={index}
                  name={member.name}
                  role={member.role}
                  index={index}
                />
              ))}
            </motion.div>
          </div>
        </section>
      </AnimatedSection>

      {/* CTA Section */}
      <AnimatedSection delay={0.1}>
        <section className="py-12 md:py-20 bg-primary text-primary-foreground relative overflow-hidden">
          {/* Animated background gradient */}
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
          
          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <motion.div
              className="grid md:grid-cols-2 gap-8 items-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              <div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                  Join the EduPeak team & shape the future of education
                </h2>
                <p className="text-lg md:text-xl text-primary-foreground/80 mb-6">
                  If you're passionate and ready to dive in, we'd love to meet you.
                  We're committed to supporting our employee professional
                  development and well-being.
                </p>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    asChild
                    size="lg"
                    variant="secondary"
                    className="rounded-full"
                  >
                    <Link href="/career">
                      View Opportunities
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                </motion.div>
              </div>
              <motion.div
                className="hidden md:block text-center"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="relative aspect-square max-w-md mx-auto">
                  <motion.div
                    className="absolute inset-0 rounded-lg bg-primary-foreground/10 flex items-center justify-center"
                    animate={{
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                      duration: 6,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <GraduationCap className="w-32 h-32 text-primary-foreground/20" />
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </AnimatedSection>
    </div>
  );
}
