"use client";

import { CreatorType } from "@/app/data/creator/get-all-creators";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRevealOnScroll } from "@/hooks/use-reveal-on-scroll";
import { useConstructUrl } from "@/hooks/use-construct-url";
import { 
  BookOpen, 
  Users, 
  Clock, 
  ExternalLink,
  Github,
  Linkedin,
  Twitter,
  Globe,
  GraduationCap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

interface CreatorsGridSectionProps {
  creators: CreatorType[];
}

export function CreatorsGridSection({ creators }: CreatorsGridSectionProps) {
  const { ref, isVisible } = useRevealOnScroll<HTMLElement>();

  if (creators.length === 0) {
    return (
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              No creators found. Check back soon!
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={ref}
      className="py-20 md:py-32 bg-gradient-to-b from-muted/10 via-background to-background"
    >
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
        <div className={`mb-16 text-center transition-all duration-1000 ease-out ${
          isVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-8"
        }`}>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground mb-6 bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
            Our Expert Creators
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            Each creator brings unique expertise and passion to their courses. 
            Explore their profiles and discover amazing learning opportunities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          {creators.map((creator, index) => (
            <CreatorCard key={creator.id} creator={creator} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CreatorCard({ creator, index }: { creator: CreatorType; index: number }) {
  const { ref, isVisible } = useRevealOnScroll<HTMLElement>();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fullName = `${creator.firstName}${creator.lastName ? ` ${creator.lastName}` : ""}`;
  const initials = `${creator.firstName[0]}${creator.lastName?.[0] || ""}`;
  const avatarUrl = creator.image
    ? creator.image.startsWith("http")
      ? creator.image
      : useConstructUrl(creator.image)
    : `https://avatar.vercel.sh/${creator.email}`;

  const totalEnrollments = creator.courses.reduce(
    (sum, course) => sum + (course._count.enrollment || 0),
    0
  );

  return (
    <Card
      ref={ref}
      className={`group relative overflow-hidden border-2 border-border/50 bg-gradient-to-br from-card via-card to-card/50 backdrop-blur-sm transition-all duration-700 ease-out ${
        isVisible && mounted
          ? "opacity-100 translate-y-0 scale-100"
          : "opacity-0 translate-y-12 scale-95"
      } hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-4 hover:border-primary/40 hover:scale-[1.03]`}
      style={{
        transitionDelay: `${index * 100}ms`,
        transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      {/* Animated gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-primary/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-out z-0" />
      
      {/* Shimmer effect on hover */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out z-0">
        <div className="w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      {/* Glow effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-lg opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-700 -z-10" />

      <CardContent className="p-8 space-y-6 relative z-10">
        {/* Profile Header */}
        <div className="flex items-start gap-5">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
            <Avatar className="w-24 h-24 border-[3px] border-primary/30 group-hover:border-primary/60 transition-all duration-500 group-hover:scale-110 group-hover:shadow-2xl group-hover:shadow-primary/40 ring-4 ring-primary/5 group-hover:ring-primary/20">
              <AvatarImage 
                src={avatarUrl} 
                alt={fullName}
                className="transition-transform duration-500 group-hover:scale-110"
              />
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-bold text-xl transition-all duration-500 group-hover:from-primary/30 group-hover:to-primary/20">
                {initials}
              </AvatarFallback>
            </Avatar>
            {creator._count.courses > 0 && (
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center border-[3px] border-background shadow-xl transition-all duration-500 group-hover:scale-125 group-hover:rotate-12 group-hover:shadow-primary/50">
                <GraduationCap className="w-4 h-4 text-white transition-transform duration-500 group-hover:scale-110" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-black text-2xl text-foreground group-hover:text-primary transition-all duration-500 line-clamp-1 group-hover:translate-x-1 bg-gradient-to-r from-foreground to-foreground/70 group-hover:from-primary group-hover:to-primary/80 bg-clip-text text-transparent">
              {fullName}
            </h3>
            {creator.designation && (
              <p className="text-sm font-semibold text-muted-foreground mt-2 line-clamp-1 transition-colors duration-500 group-hover:text-foreground/90">
                {creator.designation}
              </p>
            )}
            {creator.bio && (
              <p className="text-sm text-muted-foreground mt-3 line-clamp-2 leading-relaxed transition-colors duration-500 group-hover:text-foreground/80">
                {creator.bio}
              </p>
            )}
          </div>
        </div>

        {/* Social Links */}
        {(creator.socialGithub || creator.socialLinkedin || creator.socialTwitter || creator.socialWebsite) && (
          <div className="flex items-center gap-3 flex-wrap pt-4 border-t-2 border-border/30 group-hover:border-primary/30 transition-colors duration-500">
            {creator.socialGithub && (
              <a
                href={creator.socialGithub}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-muted to-muted/80 hover:from-primary/20 hover:to-primary/10 flex items-center justify-center transition-all duration-300 group/social hover:scale-110 hover:shadow-lg hover:shadow-primary/30 border border-border/50 hover:border-primary/40"
              >
                <Github className="w-5 h-5 text-muted-foreground group-hover/social:text-primary transition-all duration-300 group-hover/social:scale-110" />
              </a>
            )}
            {creator.socialLinkedin && (
              <a
                href={creator.socialLinkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-muted to-muted/80 hover:from-primary/20 hover:to-primary/10 flex items-center justify-center transition-all duration-300 group/social hover:scale-110 hover:shadow-lg hover:shadow-primary/30 border border-border/50 hover:border-primary/40"
              >
                <Linkedin className="w-5 h-5 text-muted-foreground group-hover/social:text-primary transition-all duration-300 group-hover/social:scale-110" />
              </a>
            )}
            {creator.socialTwitter && (
              <a
                href={creator.socialTwitter}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-muted to-muted/80 hover:from-primary/20 hover:to-primary/10 flex items-center justify-center transition-all duration-300 group/social hover:scale-110 hover:shadow-lg hover:shadow-primary/30 border border-border/50 hover:border-primary/40"
              >
                <Twitter className="w-5 h-5 text-muted-foreground group-hover/social:text-primary transition-all duration-300 group-hover/social:scale-110" />
              </a>
            )}
            {creator.socialWebsite && (
              <a
                href={creator.socialWebsite}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-muted to-muted/80 hover:from-primary/20 hover:to-primary/10 flex items-center justify-center transition-all duration-300 group/social hover:scale-110 hover:shadow-lg hover:shadow-primary/30 border border-border/50 hover:border-primary/40"
              >
                <Globe className="w-5 h-5 text-muted-foreground group-hover/social:text-primary transition-all duration-300 group-hover/social:scale-110" />
              </a>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t-2 border-border/30 group-hover:border-primary/30 transition-colors duration-500">
          <div className="flex items-center gap-3 p-3 rounded-xl transition-all duration-300 group-hover:bg-gradient-to-br group-hover:from-primary/10 group-hover:to-primary/5 group/stat border border-transparent group-hover:border-primary/20">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 group-hover/stat:from-blue-500/30 group-hover/stat:to-blue-600/30 transition-all duration-300 group-hover/stat:scale-110">
              <BookOpen className="w-5 h-5 text-blue-500 transition-transform duration-300 group-hover/stat:scale-110 group-hover/stat:rotate-3" />
            </div>
            <div>
              <div className="text-xl font-black text-foreground transition-all duration-300 group-hover/stat:scale-110">{creator._count.courses}</div>
              <div className="text-xs font-medium text-muted-foreground transition-colors duration-300 group-hover/stat:text-foreground/90">Courses</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl transition-all duration-300 group-hover:bg-gradient-to-br group-hover:from-primary/10 group-hover:to-primary/5 group/stat border border-transparent group-hover:border-primary/20">
            <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 group-hover/stat:from-emerald-500/30 group-hover/stat:to-emerald-600/30 transition-all duration-300 group-hover/stat:scale-110">
              <Users className="w-5 h-5 text-emerald-500 transition-transform duration-300 group-hover/stat:scale-110 group-hover/stat:rotate-3" />
            </div>
            <div>
              <div className="text-xl font-black text-foreground transition-all duration-300 group-hover/stat:scale-110">{totalEnrollments}</div>
              <div className="text-xs font-medium text-muted-foreground transition-colors duration-300 group-hover/stat:text-foreground/90">Students</div>
            </div>
          </div>
        </div>

        {/* Featured Courses */}
        {creator.courses.length > 0 && (
          <div className="pt-4 border-t border-border/30 group-hover:border-primary/20 transition-colors duration-500 space-y-3">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 transition-all duration-300 group-hover:text-primary group-hover:translate-x-1">
              <BookOpen className="w-4 h-4 text-primary transition-transform duration-300 group-hover:rotate-12" />
              Featured Courses
            </h4>
            <div className="space-y-2">
              {creator.courses.slice(0, 3).map((course, courseIndex) => {
                const courseThumbnailUrl = useConstructUrl(course.fileKey);
                return (
                  <Link
                    key={course.id}
                    href={`/courses/${course.slug}`}
                    className="group/course flex items-center gap-3 p-2 rounded-lg hover:bg-muted/70 transition-all duration-300 hover:shadow-md hover:shadow-primary/5 hover:-translate-y-0.5"
                    style={{
                      animationDelay: `${(index * 100) + (courseIndex * 50)}ms`,
                    }}
                  >
                    <div className="relative w-16 h-10 rounded overflow-hidden flex-shrink-0 ring-1 ring-border/50 group-hover/course:ring-primary/30 transition-all duration-300">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover/course:opacity-100 transition-opacity duration-300 z-10" />
                      <Image
                        src={courseThumbnailUrl}
                        alt={course.title}
                        fill
                        className="object-cover group-hover/course:scale-125 transition-transform duration-500 ease-out"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground line-clamp-1 group-hover/course:text-primary transition-all duration-300 group-hover/course:translate-x-1">
                        {course.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs px-1.5 py-0 transition-all duration-300 group-hover/course:bg-primary/10 group-hover/course:text-primary group-hover/course:scale-105">
                          {course.level}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground group-hover/course:text-foreground/80 transition-colors duration-300">
                          <Clock className="w-3 h-3 transition-transform duration-300 group-hover/course:scale-110" />
                          {course.duration}h
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground group-hover/course:text-foreground/80 transition-colors duration-300">
                          <Users className="w-3 h-3 transition-transform duration-300 group-hover/course:scale-110" />
                          {course._count.enrollment || 0}
                        </div>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-muted-foreground group-hover/course:text-primary transition-all duration-300 group-hover/course:scale-125 group-hover/course:translate-x-1 flex-shrink-0" />
                  </Link>
                );
              })}
            </div>
            {creator.courses.length > 3 && (
              <Link
                href="/courses"
                className="text-sm text-primary hover:underline inline-flex items-center gap-1 transition-all duration-300 hover:gap-2 group/link"
              >
                View all {creator.courses.length} courses
                <ExternalLink className="w-3 h-3 transition-transform duration-300 group-hover/link:translate-x-1" />
              </Link>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
