"use client";

import { Trophy, Users, Award, TrendingUp } from "lucide-react";

export function StudentsHeroSection() {
  return (
    <section className="relative py-16 md:py-20 overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center space-y-6 max-w-4xl mx-auto">
          <div className="flex flex-col items-center space-y-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
              <span className="block text-primary">Students Gallery</span>
              <span className="block text-foreground mt-2">
                Celebrating Excellence
              </span>
            </h1>

            <p className="max-w-[600px] text-muted-foreground text-base md:text-lg mt-4">
              Discover our top-performing students ranked by their achievements,
              progress, and dedication to learning.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-8 pt-8 border-t border-border/50 w-full max-w-3xl">
            <div className="flex flex-col items-center text-center group">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-3 group-hover:bg-emerald-500/20 transition-colors duration-300">
                <Trophy className="w-6 h-6 md:w-7 md:h-7 text-emerald-500" />
              </div>
              <div className="text-sm md:text-base font-semibold text-foreground">
                Top Performers
              </div>
              <div className="text-xs md:text-sm text-muted-foreground mt-1">
                Ranked by achievements
              </div>
            </div>

            <div className="flex flex-col items-center text-center group">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-3 group-hover:bg-emerald-500/20 transition-colors duration-300">
                <Users className="w-6 h-6 md:w-7 md:h-7 text-emerald-500" />
              </div>
              <div className="text-sm md:text-base font-semibold text-foreground">
                Active Learners
              </div>
              <div className="text-xs md:text-sm text-muted-foreground mt-1">
                Engaged community
              </div>
            </div>

            <div className="flex flex-col items-center text-center group">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-3 group-hover:bg-emerald-500/20 transition-colors duration-300">
                <Award className="w-6 h-6 md:w-7 md:h-7 text-emerald-500" />
              </div>
              <div className="text-sm md:text-base font-semibold text-foreground">
                Certificates
              </div>
              <div className="text-xs md:text-sm text-muted-foreground mt-1">
                Earned achievements
              </div>
            </div>

            <div className="flex flex-col items-center text-center group">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-3 group-hover:bg-emerald-500/20 transition-colors duration-300">
                <TrendingUp className="w-6 h-6 md:w-7 md:h-7 text-emerald-500" />
              </div>
              <div className="text-sm md:text-base font-semibold text-foreground">
                Progress Tracking
              </div>
              <div className="text-xs md:text-sm text-muted-foreground mt-1">
                Real-time updates
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
