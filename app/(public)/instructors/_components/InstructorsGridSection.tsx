"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { InstructorType } from "@/app/data/instructor/get-all-instructors";
import { useConstructUrl as constructFileUrl } from "@/hooks/use-construct-url";
import { 
  BookOpen, 
  Star,
  Briefcase,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

interface InstructorsGridSectionProps {
  instructors: InstructorType[];
}

export function InstructorsGridSection({ instructors }: InstructorsGridSectionProps) {
  if (instructors.length === 0) {
    return (
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center py-12 space-y-4">
            <p className="text-muted-foreground text-lg">
              No instructors found.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold">
              All Instructors
            </h2>
            <p className="text-muted-foreground mt-2">
              {instructors.length} instructor{instructors.length !== 1 ? "s" : ""} in total
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {instructors.map((instructor, index) => (
              <InstructorCard 
                key={instructor.id} 
                instructor={instructor} 
                index={index}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function InstructorCard({ instructor, index }: { instructor: InstructorType; index: number }) {
  const fullName = `${instructor.firstName} ${instructor.lastName || ""}`.trim();
  const initials = `${instructor.firstName[0]}${instructor.lastName?.[0] || ""}`.toUpperCase();
  const handle = `@${instructor.email.split("@")[0]}`;
  
  // Resolve avatar URL
  const resolveAvatar = () => {
    if (instructor.image) {
      return instructor.image.startsWith("http")
        ? instructor.image
        : constructFileUrl(instructor.image);
    }
    return `https://avatar.vercel.sh/${instructor.email}`;
  };
  const avatarUrl = resolveAvatar();
  
  return (
    <div
      className="group relative animate-instructor-card-enter"
      style={{
        animationDelay: `${index * 0.1}s`,
      }}
    >
      <Card className="relative overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm rounded-xl shadow-sm transition-all duration-500 ease-out hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 hover:border-primary/30 group-hover:bg-card">
        {/* Subtle gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:via-primary/0 group-hover:to-primary/5 transition-all duration-500 pointer-events-none" />
        
        <CardContent className="p-6 space-y-5 relative">
          {/* Avatar with elegant border */}
          <div className="flex items-start gap-4">
            <div className="relative flex-shrink-0 group/avatar">
              <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-500" />
              <div className="relative rounded-full p-0.5 bg-gradient-to-br from-border via-border to-border group-hover:from-primary/30 group-hover:via-border group-hover:to-border transition-all duration-500">
                <Avatar className="w-16 h-16 border-2 border-card">
                  <AvatarImage 
                    src={avatarUrl} 
                    alt={fullName}
                    className="object-cover transition-transform duration-500 group-hover/avatar:scale-105"
                  />
                  <AvatarFallback className="text-sm font-semibold bg-muted text-muted-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
            
            {/* Name, Handle, and Role */}
            <div className="flex-1 min-w-0 pt-1 space-y-1">
              <h3 className="font-semibold text-lg text-card-foreground truncate transition-colors duration-300 group-hover:text-primary">
                {fullName}
              </h3>
              <p className="text-sm text-muted-foreground truncate">
                {handle}
              </p>
              {instructor.designation && (
                <div className="text-sm text-muted-foreground font-medium mt-1.5 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 opacity-60" />
                  <span>{instructor.designation}</span>
                </div>
              )}
            </div>
          </div>

          {/* Stats Section */}
          <div className="flex items-center gap-8 pt-3 border-t border-border/50">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-muted-foreground/60" />
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Courses</span>
              </div>
              <span className="font-semibold text-lg text-card-foreground transition-colors duration-300 group-hover:text-primary">
                {instructor.coursesCount || 0}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-muted-foreground/60" />
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Rating</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-primary fill-primary/20 group-hover:fill-primary/40 transition-all duration-300" />
                <span className="font-semibold text-lg text-card-foreground transition-colors duration-300 group-hover:text-primary">
                  {instructor.averageRating > 0 ? instructor.averageRating.toFixed(1) : "0.0"}
                </span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          {instructor.coursesCount > 0 && (
            <div className="pt-2">
              <Link href={`/courses?instructor=${instructor.id}`}>
                <Button 
                  className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground font-medium rounded-lg px-4 py-2.5 text-sm shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 group/button"
                >
                  <span>View Courses</span>
                  <ExternalLink className="w-3.5 h-3.5 transition-transform duration-300 group-hover/button:translate-x-0.5 group-hover/button:-translate-y-0.5" />
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
