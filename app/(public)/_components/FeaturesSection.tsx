"use client";

import { useEffect, useState } from "react";

interface featureProps {
  title: string;
  description: string;
  icon: string;
}

const features: featureProps[] = [
  {
    title: "Comprehensive Courses",
    description:
      "Access a wide range of carefully curated courses designed by industry experts.",
    icon: "📚",
  },
  {
    title: "Interactive Learning",
    description:
      "Engage with interactive content, quizzes, and assignments to enhance your learning experience.",
    icon: "🎮",
  },
  {
    title: "Progress Tracking",
    description:
      "Monitor your progress and achievements with detailed analytics and personalized dashboards.",
    icon: "📊",
  },
  {
    title: "Community Support",
    description:
      "Join a vibrant community of learners and instructors to collaborate and share knowledge.",
    icon: "👥",
  },
];

export default function FeaturesSection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="py-24 px-4 mb-32 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`group relative transition-all duration-1000 ease-out ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-12"
              }`}
              style={{ transitionDelay: `${index * 0.1}s` }}
            >
              <div
                className="relative h-full p-8 rounded-2xl border transition-all duration-500 hover:scale-[1.02] hover:-translate-y-2 bg-white/80 dark:bg-white/5 border-slate-200/70 dark:border-white/10 backdrop-blur-sm"
              >
                {/* Icon Container with Gradient */}
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 bg-gradient-to-br from-primary to-primary/70 text-white shadow-lg shadow-primary/40">
                  <span className="text-3xl drop-shadow-sm">{feature.icon}</span>
                </div>

                {/* Content */}
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-foreground leading-tight">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-base">
                    {feature.description}
                  </p>
                </div>

                {/* Hover Border Effect */}
                <div className="absolute inset-0 rounded-2xl border-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none border-primary/70 shadow-[0_0_0_6px_rgba(34,209,114,0.08)]" />

                {/* Subtle Glow on Hover */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none -z-10 blur-2xl bg-primary/10" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

