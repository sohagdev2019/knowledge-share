"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";

interface FeatureCardProps {
  number: string;
  title: string;
  description: string;
}

const featureCards: FeatureCardProps[] = [
  {
    number: "01",
    title: "Learn the latest skills",
    description:
      "Cursus sit amet dictum sit amet justo donec",
  },
  {
    number: "02",
    title: "Get ready for a career",
    description:
      "Cursus sit amet dictum sit amet justo donec",
  },
  {
    number: "03",
    title: "Earn a Certificate",
    description:
      "Cursus sit amet dictum sit amet justo donec",
  },
  {
    number: "04",
    title: "Upskill your organization",
    description:
      "Cursus sit amet dictum sit amet justo donec",
  },
];

export default function WhyLearnSection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16">
          <p
            className={`text-sm md:text-base font-semibold uppercase tracking-wider mb-4 transition-all duration-1000 ease-out ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
            style={{ transitionDelay: "0.1s", color: "#22d172" }}
          >
            WHY LEARN WITH US
          </p>
          <h2
            className={`text-3xl md:text-4xl lg:text-5xl font-bold mb-6 transition-all duration-1000 ease-out ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
            style={{ transitionDelay: "0.2s" }}
          >
            Build better skills, faster
          </h2>
          <p
            className={`max-w-2xl mx-auto text-muted-foreground text-base md:text-lg transition-all duration-1000 ease-out ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
            style={{ transitionDelay: "0.3s" }}
          >
            Explore new skills, deepen existing passions, and get lost in
            creativity. What you find just might surprise and inspire you.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featureCards.map((card, index) => (
            <Card
              key={index}
              className={`border border-border hover:border-primary/50 transition-all duration-500 rounded-lg ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${0.4 + index * 0.1}s` }}
            >
              <CardHeader>
                <div 
                  className="w-16 h-16 rounded-lg flex items-center justify-center mb-4"
                  style={{ backgroundColor: "#22d172" }}
                >
                  <span className="text-white text-2xl font-bold">
                    {card.number}
                  </span>
                </div>
                <CardTitle className="text-xl">{card.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{card.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

