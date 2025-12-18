"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InstructorType } from "@/app/data/instructor/get-all-instructors";
import { useConstructUrl as constructFileUrl } from "@/hooks/use-construct-url";
import { 
  BookOpen, 
  Users, 
  Star,
  Mail,
  Briefcase,
  ExternalLink,
  Github,
  Linkedin,
  Twitter,
  Globe
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

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {instructors.map((instructor) => (
              <InstructorCard key={instructor.id} instructor={instructor} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function InstructorCard({ instructor }: { instructor: InstructorType }) {
  const fullName = `${instructor.firstName} ${instructor.lastName || ""}`.trim();
  const initials = `${instructor.firstName[0]}${instructor.lastName?.[0] || ""}`.toUpperCase();
  
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
    <Card className="border border-border bg-card hover:shadow-lg transition-all duration-300 hover:border-primary/20">
      <CardContent className="p-6 space-y-5 relative flex flex-col h-full">
        {/* Profile Section */}
        <div className="flex flex-col items-center space-y-3 pt-2">
          <Avatar className="w-24 h-24 border-2 border-border">
            <AvatarImage 
              src={avatarUrl} 
              alt={fullName}
            />
            <AvatarFallback className="text-lg font-semibold bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="text-center space-y-1">
            <h3 className="font-semibold text-lg">{fullName}</h3>
            {instructor.designation ? (
              <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                <Briefcase className="w-3 h-3" />
                <span>{instructor.designation}</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                <Mail className="w-3 h-3" />
                <span className="truncate max-w-[200px]">{instructor.email}</span>
              </div>
            )}
            {instructor.bio && (
              <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                {instructor.bio}
              </p>
            )}
          </div>
        </div>

        {/* Statistics */}
        <div className="pt-2 border-t border-border">
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col items-center space-y-1">
              <div className="text-xs text-muted-foreground">Courses</div>
              <div className="flex items-center gap-1">
                <BookOpen className="w-4 h-4 text-primary" />
                <span className="font-semibold">{instructor.coursesCount || 0}</span>
              </div>
            </div>
            <div className="flex flex-col items-center space-y-1">
              <div className="text-xs text-muted-foreground">Students</div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4 text-primary" />
                <span className="font-semibold">{instructor.totalEnrollments || 0}</span>
              </div>
            </div>
            <div className="flex flex-col items-center space-y-1">
              <div className="text-xs text-muted-foreground">Rating</div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="font-semibold">
                  {instructor.averageRating > 0 ? instructor.averageRating.toFixed(1) : "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Social Links */}
        {(instructor.socialLinkedin || instructor.socialGithub || instructor.socialTwitter || instructor.socialWebsite) && (
          <div className="pt-2 border-t border-border">
            <div className="flex flex-wrap gap-2 justify-center">
              {instructor.socialLinkedin && (
                <a
                  href={instructor.socialLinkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-md hover:bg-muted transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-4 h-4 text-muted-foreground hover:text-primary" />
                </a>
              )}
              {instructor.socialGithub && (
                <a
                  href={instructor.socialGithub}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-md hover:bg-muted transition-colors"
                  aria-label="GitHub"
                >
                  <Github className="w-4 h-4 text-muted-foreground hover:text-primary" />
                </a>
              )}
              {instructor.socialTwitter && (
                <a
                  href={instructor.socialTwitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-md hover:bg-muted transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter className="w-4 h-4 text-muted-foreground hover:text-primary" />
                </a>
              )}
              {instructor.socialWebsite && (
                <a
                  href={instructor.socialWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-md hover:bg-muted transition-colors"
                  aria-label="Website"
                >
                  <Globe className="w-4 h-4 text-muted-foreground hover:text-primary" />
                </a>
              )}
            </div>
          </div>
        )}

        {/* View Courses Button */}
        {instructor.coursesCount > 0 && (
          <div className="pt-4 mt-auto">
            <Link href={`/courses?instructor=${instructor.id}`}>
              <Button 
                variant="outline" 
                className="w-full group"
              >
                View Courses
                <ExternalLink className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
