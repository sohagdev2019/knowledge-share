"use client";

import { GraduationCap, Users, Award, BookOpen } from "lucide-react";

export function InstructorsHeroSection() {
  return (
    <section className="relative py-16 md:py-20 overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center space-y-6 max-w-4xl mx-auto">
          <div className="flex flex-col items-center space-y-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
              <span className="block text-primary">Our Instructors</span>
              <span className="block text-foreground mt-2">
                Expert Teachers & Mentors
              </span>
            </h1>

            <p className="max-w-[600px] text-muted-foreground text-base md:text-lg mt-4">
              Meet our talented instructors who are passionate about sharing knowledge
              and helping you achieve your learning goals.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-8 pt-8 border-t border-border/50 w-full max-w-3xl">
            <div className="flex flex-col items-center text-center group">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors duration-300">
                <GraduationCap className="w-6 h-6 md:w-7 md:h-7 text-primary" />
              </div>
              <div className="text-sm md:text-base font-semibold text-foreground">
                Expert Teachers
              </div>
              <div className="text-xs md:text-sm text-muted-foreground mt-1">
                Industry professionals
              </div>
            </div>

            <div className="flex flex-col items-center text-center group">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors duration-300">
                <BookOpen className="w-6 h-6 md:w-7 md:h-7 text-primary" />
              </div>
              <div className="text-sm md:text-base font-semibold text-foreground">
                Quality Courses
              </div>
              <div className="text-xs md:text-sm text-muted-foreground mt-1">
                Comprehensive content
              </div>
            </div>

            <div className="flex flex-col items-center text-center group">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors duration-300">
                <Users className="w-6 h-6 md:w-7 md:h-7 text-primary" />
              </div>
              <div className="text-sm md:text-base font-semibold text-foreground">
                Active Students
              </div>
              <div className="text-xs md:text-sm text-muted-foreground mt-1">
                Engaged learners
              </div>
            </div>

            <div className="flex flex-col items-center text-center group">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors duration-300">
                <Award className="w-6 h-6 md:w-7 md:h-7 text-primary" />
              </div>
              <div className="text-sm md:text-base font-semibold text-foreground">
                Top Rated
              </div>
              <div className="text-xs md:text-sm text-muted-foreground mt-1">
                Highly reviewed
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
