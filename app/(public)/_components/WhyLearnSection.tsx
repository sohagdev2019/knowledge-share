"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BookOpen, 
  Briefcase, 
  Award, 
  Users,
  Zap
} from "lucide-react";

interface FeatureCardProps {
  number: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const featureCards: FeatureCardProps[] = [
  {
    number: "01",
    title: "Learn the latest skills",
    description:
      "Access cutting-edge courses designed by industry experts to keep you ahead of the curve.",
    icon: <BookOpen className="w-5 h-5" />,
  },
  {
    number: "02",
    title: "Get ready for a career",
    description:
      "Build practical skills and real-world projects that employers are looking for.",
    icon: <Briefcase className="w-5 h-5" />,
  },
  {
    number: "03",
    title: "Earn a Certificate",
    description:
      "Receive recognized certificates upon completion to showcase your achievements.",
    icon: <Award className="w-5 h-5" />,
  },
  {
    number: "04",
    title: "Upskill your organization",
    description:
      "Empower your team with comprehensive training programs tailored to your needs.",
    icon: <Users className="w-5 h-5" />,
  },
];

export default function WhyLearnSection() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  return (
    <section className="py-20 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <p className="text-sm font-medium uppercase tracking-wider mb-4 text-emerald-500">
            WHY LEARN WITH US
          </p>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Build better skills, faster
          </h2>
          <p className="max-w-2xl mx-auto text-muted-foreground text-base md:text-lg">
            Explore new skills, deepen existing passions, and get lost in
            creativity. What you find just might surprise and inspire you.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featureCards.map((card, index) => (
            <div
              key={index}
              className="transform-gpu will-change-transform"
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <Card
                className={`border border-border/50 bg-card transition-all duration-300 ease-out ${
                  hoveredCard === index
                    ? "border-emerald-500/50 shadow-lg shadow-emerald-500/10 -translate-y-1"
                    : "hover:border-border"
                }`}
              >
                <CardHeader>
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-16 h-16 rounded-lg flex items-center justify-center transition-all duration-300 ease-out ${
                      hoveredCard === index
                        ? "bg-emerald-500 scale-110"
                        : "bg-emerald-500"
                    }`}>
                      <span className="text-white text-2xl font-bold">
                        {card.number}
                      </span>
                    </div>
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ease-out ${
                      hoveredCard === index
                        ? "bg-emerald-500/10 scale-110"
                        : "bg-emerald-500/10"
                    }`}>
                      <div className="text-emerald-500">
                        {card.icon}
                      </div>
                    </div>
                  </div>
                  <CardTitle className="text-xl">{card.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {card.description}
                  </p>
                  {hoveredCard === index && (
                    <Link
                      href="/courses"
                      className="mt-4 inline-flex items-center gap-2 text-emerald-500 text-xs font-medium animate-in fade-in slide-in-from-bottom-2 duration-300 hover:text-emerald-600 transition-colors cursor-pointer group"
                    >
                      <Zap className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                      <span>Learn more</span>
                    </Link>
                  )}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
