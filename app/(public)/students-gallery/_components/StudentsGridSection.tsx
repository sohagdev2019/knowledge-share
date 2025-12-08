"use client";

import { StudentType } from "@/app/data/student/get-all-students";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRevealOnScroll } from "@/hooks/use-reveal-on-scroll";
import { useConstructUrl } from "@/hooks/use-construct-url";
import {
  Trophy,
  BookOpen,
  Award,
  TrendingUp,
  Star,
  GraduationCap,
  Medal,
  Crown,
  User,
  Eye,
} from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface StudentsGridSectionProps {
  students: StudentType[];
}

export function StudentsGridSection({ students }: StudentsGridSectionProps) {
  const { ref, isVisible } = useRevealOnScroll<HTMLElement>();

  if (students.length === 0) {
    return (
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              No students found. Check back soon!
            </p>
          </div>
        </div>
      </section>
    );
  }

  // For single student, show in compact gallery style
  // For multiple students, show top 3 podium + rest in grid
  const topThree = students.length >= 3 ? students.slice(0, 3) : [];
  const restStudents = students.length >= 3 ? students.slice(3) : students;

  return (
    <section ref={ref} className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div
          className={`mb-12 text-center transition-all duration-1000 ease-out ${
            isVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            <span className="bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
              Students Gallery
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {students.length >= 3 
              ? "Ranked by points, enrollments, completed lessons, and overall achievements. See who's leading the way!"
              : "Browse our community of learners and their achievements."}
          </p>
        </div>

        {/* Top 3 Podium Display */}
        {topThree.length > 0 && (
          <div
            className={`mb-16 transition-all duration-1000 ease-out ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
            style={{ transitionDelay: "200ms" }}
          >
            <div className="flex flex-col md:flex-row items-end justify-center gap-4 md:gap-6 max-w-5xl mx-auto">
              {/* 2nd Place */}
              {topThree[1] && (
                <div className="flex-1 max-w-xs order-2 md:order-1">
                  <TopStudentCard student={topThree[1]} rank={2} index={1} />
                </div>
              )}
              {/* 1st Place */}
              {topThree[0] && (
                <div className="flex-1 max-w-xs order-1 md:order-2">
                  <TopStudentCard student={topThree[0]} rank={1} index={0} />
                </div>
              )}
              {/* 3rd Place */}
              {topThree[2] && (
                <div className="flex-1 max-w-xs order-3 md:order-3">
                  <TopStudentCard student={topThree[2]} rank={3} index={2} />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Students Grid - Compact gallery style */}
        {restStudents.length > 0 && (
          <div
            className={`transition-all duration-1000 ease-out ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
            style={{ transitionDelay: topThree.length > 0 ? "400ms" : "200ms" }}
          >
            {topThree.length > 0 && (
              <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-8 text-center">
                All Students
              </h3>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {restStudents.map((student, index) => (
                <StudentCard
                  key={student.id}
                  student={student}
                  index={index + (topThree.length > 0 ? 3 : 0)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// Special card for top 3 students
function TopStudentCard({
  student,
  rank,
  index,
}: {
  student: StudentType;
  rank: number;
  index: number;
}) {
  const { ref, isVisible } = useRevealOnScroll<HTMLDivElement>();
  const [mounted, setMounted] = useState(false);
  const constructUrl = useConstructUrl;

  useEffect(() => {
    setMounted(true);
  }, []);

  const fullName = `${student.firstName}${
    student.lastName ? ` ${student.lastName}` : ""
  }`;
  const initials = `${student.firstName[0]}${student.lastName?.[0] || ""}`;
  
  const avatarUrl = useMemo(() => {
    if (student.image) {
      return student.image.startsWith("http")
        ? student.image
        : constructUrl(student.image);
    }
    return `https://avatar.vercel.sh/${student.email}`;
  }, [student.image, student.email, constructUrl]);

  const getRankConfig = (rank: number) => {
    switch (rank) {
      case 1:
        return {
          badge: "bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 text-yellow-400 border-yellow-500/30",
          icon: <Crown className="w-4 h-4" />,
          height: "md:h-[460px]",
        };
      case 2:
        return {
          badge: "bg-gradient-to-br from-gray-400/20 to-gray-500/20 text-gray-300 border-gray-400/30",
          icon: <Medal className="w-4 h-4" />,
          height: "md:h-[440px]",
        };
      case 3:
        return {
          badge: "bg-gradient-to-br from-amber-600/20 to-amber-700/20 text-amber-400 border-amber-600/30",
          icon: <Medal className="w-4 h-4" />,
          height: "md:h-[420px]",
        };
      default:
        return {
          badge: "bg-primary/10 text-primary border-primary/20",
          icon: <Trophy className="w-4 h-4" />,
          height: "md:h-[400px]",
        };
    }
  };

  const config = getRankConfig(rank);

  return (
    <Card
      ref={ref}
      className={`group relative overflow-hidden border-2 border-border bg-card transition-all duration-500 ${config.height} ${
        isVisible && mounted
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-12"
      } hover:shadow-xl hover:border-primary/40 hover:-translate-y-2`}
      style={{
        transitionDelay: `${index * 100}ms`,
      }}
    >
      <CardContent className="p-8 space-y-6 relative h-full flex flex-col">
        {/* Rank Badge */}
        <div className="absolute top-5 right-5 z-10">
          <Badge
            variant="outline"
            className={`${config.badge} flex items-center gap-2 px-3 py-1.5 font-bold text-sm border-2 shadow-lg`}
          >
            {config.icon}
            <span>#{rank}</span>
          </Badge>
        </div>

        {/* Profile Header */}
        <div className="flex flex-col items-center space-y-4 pt-4">
          <div className="relative">
            <Avatar className="w-28 h-28 md:w-32 md:h-32 border-4 border-border shadow-lg">
              <AvatarImage
                src={avatarUrl}
                alt={fullName}
                className="object-cover"
              />
              <AvatarFallback className="bg-muted text-foreground font-bold text-2xl">
                {initials}
              </AvatarFallback>
            </Avatar>
            {student.certificatesEarned > 0 && (
              <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-primary flex items-center justify-center border-4 border-background shadow-lg">
                <Award className="w-3.5 h-3.5 text-primary-foreground" />
              </div>
            )}
          </div>

          <div className="flex flex-col items-center text-center space-y-1">
            <h3 className="font-bold text-xl md:text-2xl text-foreground">
              {fullName}
            </h3>
            {student.designation && (
              <p className="text-sm text-muted-foreground">
                {student.designation}
              </p>
            )}
          </div>
        </div>

        {/* Points Display */}
        <div className="pt-4 border-t border-border">
          <div className="flex items-center justify-center p-4 rounded-lg bg-muted/30 border border-border/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-primary/10">
                <Star className="w-5 h-5 text-primary" />
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground font-medium mb-1">
                  Total Points
                </div>
                <div className="text-2xl md:text-3xl font-bold text-foreground">
                  {student.points.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 pt-2 mt-auto">
          <div className="flex flex-col items-center space-y-2 p-3 rounded-lg bg-muted/20 border border-border/50">
            <div className="p-2 rounded-md bg-primary/10">
              <BookOpen className="w-4 h-4 text-primary" />
            </div>
            <div className="text-xl font-bold text-foreground">
              {student.enrollmentsCount}
            </div>
            <div className="text-xs text-muted-foreground font-medium">
              Courses
            </div>
          </div>
          
          <div className="flex flex-col items-center space-y-2 p-3 rounded-lg bg-muted/20 border border-border/50">
            <div className="p-2 rounded-md bg-primary/10">
              <GraduationCap className="w-4 h-4 text-primary" />
            </div>
            <div className="text-xl font-bold text-foreground">
              {student.completedLessonsCount}
            </div>
            <div className="text-xs text-muted-foreground font-medium">
              Lessons
            </div>
          </div>
          
          <div className="flex flex-col items-center space-y-2 p-3 rounded-lg bg-muted/20 border border-border/50">
            <div className="p-2 rounded-md bg-primary/10">
              <Award className="w-4 h-4 text-primary" />
            </div>
            <div className="text-xl font-bold text-foreground">
              {student.certificatesEarned}
            </div>
            <div className="text-xs text-muted-foreground font-medium">
              Certificates
            </div>
          </div>
          
          <div className="flex flex-col items-center space-y-2 p-3 rounded-lg bg-muted/20 border border-border/50">
            <div className="p-2 rounded-md bg-primary/10">
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
            <div className="text-xl font-bold text-foreground">
              {student.averageAssignmentGrade > 0
                ? `${student.averageAssignmentGrade}%`
                : "N/A"}
            </div>
            <div className="text-xs text-muted-foreground font-medium">
              Grade
            </div>
          </div>
        </div>

        {/* View Profile Button */}
        <div className="pt-4 mt-auto">
          <Button
            asChild
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm"
            size="default"
          >
            <Link href={`/students/${student.id}`}>
              <Eye className="w-4 h-4 mr-2" />
              View Profile
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function StudentCard({
  student,
  index,
}: {
  student: StudentType;
  index: number;
}) {
  const { ref, isVisible } = useRevealOnScroll<HTMLDivElement>();
  const [mounted, setMounted] = useState(false);
  const constructUrl = useConstructUrl;

  useEffect(() => {
    setMounted(true);
  }, []);

  const fullName = `${student.firstName}${
    student.lastName ? ` ${student.lastName}` : ""
  }`;
  const initials = `${student.firstName[0]}${student.lastName?.[0] || ""}`;
  
  const avatarUrl = useMemo(() => {
    if (student.image) {
      return student.image.startsWith("http")
        ? student.image
        : constructUrl(student.image);
    }
    return `https://avatar.vercel.sh/${student.email}`;
  }, [student.image, student.email, constructUrl]);

  // Calculate level from points (e.g., 100 points per level)
  const level = Math.floor(student.points / 100) + 1;
  
  // Calculate stats
  const joined = student.enrollmentsCount;
  const finished = student.certificatesEarned; // Courses completed with certificate
  const onGoing = Math.max(0, student.enrollmentsCount - student.certificatesEarned); // Active courses

  // Generate achievement badges
  const achievements = useMemo(() => {
    const badges = [];
    if (student.certificatesEarned > 0) {
      badges.push({ label: student.certificatesEarned, color: "bg-blue-500/20 text-blue-400 border-blue-500/30" });
    }
    if (student.completedLessonsCount >= 50) {
      badges.push({ label: "50+", color: "bg-green-500/20 text-green-400 border-green-500/30" });
    }
    if (student.points >= 1000) {
      badges.push({ label: "1K", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" });
    }
    if (student.rank <= 10) {
      badges.push({ label: "Top", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" });
    }
    return badges.slice(0, 4); // Limit to 4 badges
  }, [student.certificatesEarned, student.completedLessonsCount, student.points, student.rank]);

  return (
    <Card
      ref={ref}
      className={`group relative overflow-hidden border border-border bg-card transition-all duration-300 ${
        isVisible && mounted
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-8"
      } hover:shadow-xl hover:border-primary/40 hover:-translate-y-1`}
      style={{
        transitionDelay: `${index * 50}ms`,
      }}
    >
      <CardContent className="p-6 space-y-5 relative flex flex-col h-full">
        {/* Profile Section - Top Center */}
        <div className="flex flex-col items-center space-y-3 pt-2">
          {/* Avatar */}
          <div className="relative">
            <Avatar className="w-24 h-24 border-2 border-border shadow-md">
              <AvatarImage
                src={avatarUrl}
                alt={fullName}
                className="object-cover"
              />
              <AvatarFallback className="bg-muted text-foreground font-semibold text-xl">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Name */}
          <div className="text-center w-full">
            <h3 className="font-bold text-lg text-foreground line-clamp-1">
              {fullName}
            </h3>
          </div>

          {/* XP and Level */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{student.points.toLocaleString()} XP</span>
              {" | "}
              <span className="font-semibold text-foreground">Level {level}</span>
            </p>
          </div>
        </div>

        {/* Activity Statistics - Horizontal */}
        <div className="pt-2 border-t border-border">
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col items-center space-y-1">
              <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                Joined
              </div>
              <div className="text-xl font-bold text-foreground">
                {joined}
              </div>
            </div>
            <div className="flex flex-col items-center space-y-1">
              <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                Finished
              </div>
              <div className="text-xl font-bold text-foreground">
                {finished}
              </div>
            </div>
            <div className="flex flex-col items-center space-y-1">
              <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                On Going
              </div>
              <div className="text-xl font-bold text-foreground">
                {onGoing}
              </div>
            </div>
          </div>
        </div>

        {/* Achievement Badges */}
        {achievements.length > 0 && (
          <div className="pt-2 border-t border-border">
            <div className="flex flex-wrap gap-2 justify-center">
              {achievements.map((badge, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className={`${badge.color} border px-2.5 py-1 text-xs font-semibold`}
                >
                  {badge.label}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* View Profile Button */}
        <div className="pt-4 mt-auto">
          <Button
            asChild
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm"
            size="default"
          >
            <Link href={`/students/${student.id}`}>
              <Eye className="w-4 h-4" />
              View Profile
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Special card for single student view with enhanced animations
function SingleStudentCard({ student }: { student: StudentType }) {
  const { ref, isVisible } = useRevealOnScroll<HTMLDivElement>();
  const [mounted, setMounted] = useState(false);
  const constructUrl = useConstructUrl;

  useEffect(() => {
    setMounted(true);
  }, []);

  const fullName = `${student.firstName}${
    student.lastName ? ` ${student.lastName}` : ""
  }`;
  const initials = `${student.firstName[0]}${student.lastName?.[0] || ""}`;
  
  const avatarUrl = useMemo(() => {
    if (student.image) {
      return student.image.startsWith("http")
        ? student.image
        : constructUrl(student.image);
    }
    return `https://avatar.vercel.sh/${student.email}`;
  }, [student.image, student.email, constructUrl]);

  return (
    <Card
      ref={ref as React.Ref<HTMLDivElement>}
      className={`group relative overflow-hidden border-2 border-primary/30 bg-gradient-to-br from-card via-card/95 to-primary/5 backdrop-blur-sm transition-all duration-1000 ease-out ${
        isVisible && mounted
          ? "opacity-100 translate-y-0 scale-100"
          : "opacity-0 translate-y-16 scale-90"
      } hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-2 hover:border-primary/50 hover:scale-[1.02]`}
      style={{
        transitionDelay: "300ms",
        transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
    >
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-out z-0" />

      {/* Pulsing glow effect */}
      <div className="absolute inset-0 shadow-primary/30 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-2xl -z-10 animate-pulse" />

      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-1000">
        <div className="absolute top-10 left-10 w-2 h-2 bg-primary/40 rounded-full animate-ping" style={{ animationDelay: "0s", animationDuration: "3s" }} />
        <div className="absolute top-20 right-20 w-1.5 h-1.5 bg-primary/30 rounded-full animate-ping" style={{ animationDelay: "1s", animationDuration: "4s" }} />
        <div className="absolute bottom-20 left-20 w-2 h-2 bg-primary/40 rounded-full animate-ping" style={{ animationDelay: "2s", animationDuration: "3.5s" }} />
      </div>

      <CardContent className="p-8 md:p-12 space-y-6 relative z-10">
        {/* Rank Badge - Special styling for single student */}
        <div className="absolute top-6 right-6 z-20">
          <Badge
            className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-white flex items-center gap-2 px-5 py-2.5 font-bold text-lg shadow-xl transition-all duration-500 group-hover:scale-125 group-hover:rotate-6 border-2 border-primary/50"
          >
            <Crown className="w-5 h-5" />
            <span>#{student.rank}</span>
          </Badge>
        </div>

        {/* Profile Header - Centered and prominent */}
        <div className="flex flex-col items-center gap-6 pt-8">
          <div className="relative">
            {/* Glowing ring around avatar */}
            <div className="absolute inset-0 rounded-full bg-primary/40 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 animate-pulse" />
            <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl opacity-50 -z-10" />
            
            <Avatar className="w-32 h-32 md:w-40 md:h-40 border-4 border-primary/40 group-hover:border-primary/80 transition-all duration-500 group-hover:scale-110 group-hover:shadow-2xl group-hover:shadow-primary/50 relative z-10">
              <AvatarImage
                src={avatarUrl}
                alt={fullName}
                className="transition-transform duration-500 group-hover:scale-110"
              />
              <AvatarFallback className="bg-gradient-to-br from-primary/30 to-primary/20 text-primary font-bold text-4xl transition-all duration-500 group-hover:bg-gradient-to-br group-hover:from-primary/40 group-hover:to-primary/30">
                {initials}
              </AvatarFallback>
            </Avatar>
            
            {student.certificatesEarned > 0 && (
              <div className="absolute -bottom-3 -right-3 w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center border-4 border-background shadow-2xl transition-all duration-500 group-hover:scale-125 group-hover:rotate-12 animate-bounce">
                <Award className="w-6 h-6 text-white transition-transform duration-500 group-hover:scale-110" />
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col items-center text-center space-y-2">
            <h3 className="font-bold text-3xl md:text-4xl text-foreground group-hover:text-primary transition-all duration-500 group-hover:scale-105">
              {fullName}
            </h3>
            {student.designation && (
              <p className="text-base md:text-lg text-muted-foreground transition-colors duration-500 group-hover:text-foreground/80 font-medium">
                {student.designation}
              </p>
            )}
            {student.bio && (
              <p className="text-sm md:text-base text-muted-foreground mt-2 max-w-md transition-colors duration-500 group-hover:text-foreground/70">
                {student.bio}
              </p>
            )}
          </div>
        </div>

        {/* Points Display - Large and prominent */}
        <div className="pt-6 border-t-2 border-border/30 group-hover:border-primary/40 transition-colors duration-500">
          <div className="flex items-center justify-center p-6 rounded-2xl bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5 group-hover:from-primary/25 group-hover:via-primary/15 group-hover:to-primary/10 transition-all duration-300 border-2 border-primary/20 group-hover:border-primary/40">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary/30 to-primary/20 group-hover:from-primary/40 group-hover:to-primary/30 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                <Star className="w-8 h-8 text-primary" />
              </div>
              <div className="text-center">
                <div className="text-sm md:text-base text-muted-foreground font-medium">Total Points</div>
                <div className="text-4xl md:text-5xl font-bold transition-all duration-300 group-hover:scale-110 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                  {student.points.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid - Enhanced layout */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
          <div className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-300 group-hover:bg-primary/10 border border-border/30 group-hover:border-primary/30 group/stat">
            <div className="p-2.5 rounded-lg bg-primary/20 group-hover/stat:bg-primary/30 transition-all duration-300 group-hover/stat:scale-110 group-hover/stat:rotate-3">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div className="text-2xl md:text-3xl font-bold text-foreground transition-all duration-300 group-hover/stat:scale-110">
              {student.enrollmentsCount}
            </div>
            <div className="text-xs md:text-sm text-muted-foreground font-medium transition-colors duration-300 group-hover/stat:text-foreground/80">
              Courses
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-300 group-hover:bg-primary/10 border border-border/30 group-hover:border-primary/30 group/stat">
            <div className="p-2.5 rounded-lg bg-primary/20 group-hover/stat:bg-primary/30 transition-all duration-300 group-hover/stat:scale-110 group-hover/stat:rotate-3">
              <GraduationCap className="w-5 h-5 text-primary" />
            </div>
            <div className="text-2xl md:text-3xl font-bold text-foreground transition-all duration-300 group-hover/stat:scale-110">
              {student.completedLessonsCount}
            </div>
            <div className="text-xs md:text-sm text-muted-foreground font-medium transition-colors duration-300 group-hover/stat:text-foreground/80">
              Lessons
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-300 group-hover:bg-primary/10 border border-border/30 group-hover:border-primary/30 group/stat">
            <div className="p-2.5 rounded-lg bg-primary/20 group-hover/stat:bg-primary/30 transition-all duration-300 group-hover/stat:scale-110 group-hover/stat:rotate-3">
              <Award className="w-5 h-5 text-primary" />
            </div>
            <div className="text-2xl md:text-3xl font-bold text-foreground transition-all duration-300 group-hover/stat:scale-110">
              {student.certificatesEarned}
            </div>
            <div className="text-xs md:text-sm text-muted-foreground font-medium transition-colors duration-300 group-hover/stat:text-foreground/80">
              Certificates
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-300 group-hover:bg-primary/10 border border-border/30 group-hover:border-primary/30 group/stat">
            <div className="p-2.5 rounded-lg bg-primary/20 group-hover/stat:bg-primary/30 transition-all duration-300 group-hover/stat:scale-110 group-hover/stat:rotate-3">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div className="text-2xl md:text-3xl font-bold text-foreground transition-all duration-300 group-hover/stat:scale-110">
              {student.averageAssignmentGrade > 0
                ? `${student.averageAssignmentGrade}%`
                : "N/A"}
            </div>
            <div className="text-xs md:text-sm text-muted-foreground font-medium transition-colors duration-300 group-hover/stat:text-foreground/80">
              Avg Grade
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
