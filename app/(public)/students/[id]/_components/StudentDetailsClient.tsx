"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Trophy,
  BookOpen,
  Award,
  TrendingUp,
  Star,
  GraduationCap,
  Medal,
  Crown,
  Calendar,
  Mail,
  Globe,
  Github,
  Facebook,
  Twitter,
  Linkedin,
  ArrowLeft,
  Phone,
  Zap,
  Target,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { useConstructUrl } from "@/hooks/use-construct-url";
import { Skeleton } from "@/components/ui/skeleton";

interface StudentDetails {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string;
  image: string | null;
  bio: string | null;
  designation: string | null;
  points: number;
  createdAt: string;
  username: string | null;
  phoneNumber: string | null;
  socialWebsite: string | null;
  socialGithub: string | null;
  socialFacebook: string | null;
  socialTwitter: string | null;
  socialLinkedin: string | null;
  enrollmentsCount: number;
  completedLessonsCount: number;
  totalQuizPoints: number;
  averageAssignmentGrade: number;
  certificatesEarned: number;
  rank: number;
  level: number;
  enrollment: Array<{
    id: string;
    courseId: string;
    certificateEarned: boolean;
    createdAt: string;
    Course: {
      id: string;
      title: string;
      slug: string;
      fileKey: string;
      category: string;
      level: string;
    };
  }>;
  lessonProgress: Array<{
    id: string;
    lessonId: string;
    updatedAt: string;
    Lesson: {
      id: string;
      title: string;
      Chapter: {
        Course: {
          id: string;
          title: string;
          slug: string;
        };
      };
    };
  }>;
}

export function StudentDetailsClient({ studentId }: { studentId: string }) {
  const [student, setStudent] = useState<StudentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const constructUrl = useConstructUrl();
  
  // All hooks must be called before any conditional returns
  const avatarUrl = useMemo(() => {
    if (!student) return "";
    if (student.image) {
      return student.image.startsWith("http")
        ? student.image
        : constructUrl(student.image);
    }
    return `https://avatar.vercel.sh/${student.email || ""}`;
  }, [student?.image, student?.email, constructUrl]);

  useEffect(() => {
    async function fetchStudent() {
      try {
        setLoading(true);
        const response = await fetch(`/api/students/${studentId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Student not found");
          }
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = errorData.details || errorData.error || "Failed to fetch student";
          throw new Error(errorMessage);
        }
        
        const data = await response.json();
        setStudent(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching student:", err);
        const errorMessage = err instanceof Error ? err.message : "Failed to load student details.";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    fetchStudent();
  }, [studentId]);

  if (loading) {
    return <StudentDetailsSkeleton />;
  }

  if (error || !student) {
    return (
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center py-12 space-y-4">
            <p className="text-destructive text-lg font-semibold">
              {error || "Student not found"}
            </p>
            <Link href="/students-gallery">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Students Gallery
              </Button>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const fullName = `${student.firstName}${student.lastName ? ` ${student.lastName}` : ""}`;
  const initials = `${student.firstName[0]}${student.lastName?.[0] || ""}`;

  const joined = student.enrollmentsCount;
  const finished = student.certificatesEarned;
  const onGoing = Math.max(0, student.enrollmentsCount - student.certificatesEarned);

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return {
        className: "bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 text-yellow-400 border-yellow-500/30",
        icon: <Crown className="w-5 h-5" />,
      };
    } else if (rank === 2) {
      return {
        className: "bg-gradient-to-br from-gray-400/20 to-gray-500/20 text-gray-300 border-gray-400/30",
        icon: <Medal className="w-5 h-5" />,
      };
    } else if (rank === 3) {
      return {
        className: "bg-gradient-to-br from-amber-600/20 to-amber-700/20 text-amber-400 border-amber-600/30",
        icon: <Medal className="w-5 h-5" />,
      };
    } else if (rank <= 10) {
      return {
        className: "bg-gradient-to-br from-blue-500/20 to-blue-600/20 text-blue-400 border-blue-500/30",
        icon: <Trophy className="w-5 h-5" />,
      };
    }
    return {
      className: "bg-primary/10 text-primary border-primary/20",
      icon: <Trophy className="w-5 h-5" />,
    };
  };

  const rankBadge = getRankBadge(student.rank);
  const joinDate = new Date(student.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <section className="py-8 md:py-16 bg-gradient-to-b from-background to-muted/20 min-h-screen">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
        {/* Back Button */}
        <Link href="/students-gallery">
          <Button variant="ghost" className="mb-8 group">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Gallery
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6 border-2 shadow-xl bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6 space-y-6">
                {/* Avatar and Name */}
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/40 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <Avatar className="w-36 h-36 border-4 border-primary/40 shadow-2xl relative z-10 ring-4 ring-primary/10">
                      <AvatarImage
                        src={avatarUrl}
                        alt={fullName}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/40 text-foreground font-bold text-4xl">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    {student.certificatesEarned > 0 && (
                      <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center border-4 border-background shadow-xl animate-pulse">
                        <Award className="w-6 h-6 text-white" />
                      </div>
                    )}
                  </div>

                  <div className="text-center space-y-3">
                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                      {fullName}
                    </h1>
                    {student.designation && (
                      <p className="text-muted-foreground font-medium text-base">
                        {student.designation}
                      </p>
                    )}
                    <Badge
                      variant="outline"
                      className={`${rankBadge.className} flex items-center gap-2 px-4 py-2 font-bold text-sm border-2 shadow-lg`}
                    >
                      {rankBadge.icon}
                      <span>Rank #{student.rank}</span>
                    </Badge>
                  </div>
                </div>

                <Separator className="bg-gradient-to-r from-transparent via-border to-transparent" />

                {/* Contact Info */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="p-1.5 rounded-md bg-primary/10">
                      <Mail className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-muted-foreground truncate">{student.email}</span>
                  </div>
                  {student.phoneNumber && (
                    <div className="flex items-center gap-3 text-sm p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="p-1.5 rounded-md bg-primary/10">
                        <Phone className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-muted-foreground">{student.phoneNumber}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-sm p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="p-1.5 rounded-md bg-primary/10">
                      <Calendar className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-muted-foreground">Joined {joinDate}</span>
                  </div>
                </div>

                {/* Social Links */}
                {(student.socialWebsite || student.socialGithub || student.socialFacebook || student.socialTwitter || student.socialLinkedin) && (
                  <>
                    <Separator className="bg-gradient-to-r from-transparent via-border to-transparent" />
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-foreground">Connect</p>
                      <div className="flex flex-wrap gap-2">
                        {student.socialWebsite && (
                          <a
                            href={student.socialWebsite}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2.5 rounded-lg bg-muted hover:bg-primary/10 hover:scale-110 transition-all duration-200 border border-transparent hover:border-primary/20"
                          >
                            <Globe className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
                          </a>
                        )}
                        {student.socialGithub && (
                          <a
                            href={student.socialGithub}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2.5 rounded-lg bg-muted hover:bg-primary/10 hover:scale-110 transition-all duration-200 border border-transparent hover:border-primary/20"
                          >
                            <Github className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
                          </a>
                        )}
                        {student.socialLinkedin && (
                          <a
                            href={student.socialLinkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2.5 rounded-lg bg-muted hover:bg-primary/10 hover:scale-110 transition-all duration-200 border border-transparent hover:border-primary/20"
                          >
                            <Linkedin className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
                          </a>
                        )}
                        {student.socialTwitter && (
                          <a
                            href={student.socialTwitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2.5 rounded-lg bg-muted hover:bg-primary/10 hover:scale-110 transition-all duration-200 border border-transparent hover:border-primary/20"
                          >
                            <Twitter className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
                          </a>
                        )}
                        {student.socialFacebook && (
                          <a
                            href={student.socialFacebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2.5 rounded-lg bg-muted hover:bg-primary/10 hover:scale-110 transition-all duration-200 border border-transparent hover:border-primary/20"
                          >
                            <Facebook className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
                          </a>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* Bio */}
                {student.bio && (
                  <>
                    <Separator className="bg-gradient-to-r from-transparent via-border to-transparent" />
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-foreground">About</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {student.bio}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Stats and Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Points and Level Card */}
            <Card className="border-2 shadow-lg bg-gradient-to-br from-card to-card/50 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10"></div>
              <CardContent className="p-8 relative z-10">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/30 shadow-lg">
                      <Star className="w-10 h-10 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground font-medium mb-1">Total Points</p>
                      <p className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                        {student.points.toLocaleString()} <span className="text-2xl text-primary">XP</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-sm text-muted-foreground font-medium mb-1">Level</p>
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-primary" />
                      <p className="text-4xl font-bold text-primary">Level {student.level}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="border-2 hover:shadow-lg transition-all duration-300 hover:scale-105 hover:border-primary/30">
                <CardContent className="p-6 flex flex-col items-center space-y-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 shadow-md">
                    <BookOpen className="w-6 h-6 text-blue-500" />
                  </div>
                  <div className="text-3xl font-bold text-foreground">{joined}</div>
                  <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide text-center">
                    Courses Joined
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 hover:shadow-lg transition-all duration-300 hover:scale-105 hover:border-primary/30">
                <CardContent className="p-6 flex flex-col items-center space-y-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/20 shadow-md">
                    <GraduationCap className="w-6 h-6 text-green-500" />
                  </div>
                  <div className="text-3xl font-bold text-foreground">{finished}</div>
                  <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide text-center">
                    Completed
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 hover:shadow-lg transition-all duration-300 hover:scale-105 hover:border-primary/30">
                <CardContent className="p-6 flex flex-col items-center space-y-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 shadow-md">
                    <TrendingUp className="w-6 h-6 text-purple-500" />
                  </div>
                  <div className="text-3xl font-bold text-foreground">{onGoing}</div>
                  <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide text-center">
                    In Progress
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 hover:shadow-lg transition-all duration-300 hover:scale-105 hover:border-primary/30">
                <CardContent className="p-6 flex flex-col items-center space-y-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/20 shadow-md">
                    <Award className="w-6 h-6 text-amber-500" />
                  </div>
                  <div className="text-3xl font-bold text-foreground">
                    {student.completedLessonsCount}
                  </div>
                  <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide text-center">
                    Lessons Done
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-2 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-card to-card/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-500/20 to-yellow-600/20">
                      <Award className="w-5 h-5 text-yellow-500" />
                    </div>
                    Certificates Earned
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    {student.certificatesEarned}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Courses completed with certification
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-card to-card/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500/20 to-emerald-600/20">
                      <Target className="w-5 h-5 text-emerald-500" />
                    </div>
                    Average Grade
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    {student.averageAssignmentGrade > 0
                      ? `${student.averageAssignmentGrade}%`
                      : "N/A"}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Average assignment grade
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Enrolled Courses */}
            {student.enrollment.length > 0 && (
              <Card className="border-2 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
                  <CardTitle className="text-xl flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <BookOpen className="w-5 h-5 text-primary" />
                    </div>
                    Enrolled Courses ({student.enrollment.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {student.enrollment.map((enrollment) => (
                      <div
                        key={enrollment.id}
                        className="group flex items-center justify-between p-5 rounded-xl border-2 bg-gradient-to-r from-card to-card/50 hover:from-primary/5 hover:to-primary/10 hover:border-primary/30 transition-all duration-300 hover:shadow-lg"
                      >
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-lg text-foreground mb-2 group-hover:text-primary transition-colors">
                            {enrollment.Course.title}
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline" className="text-xs font-medium">
                              {enrollment.Course.category}
                            </Badge>
                            <Badge variant="outline" className="text-xs font-medium">
                              {enrollment.Course.level}
                            </Badge>
                            {enrollment.certificateEarned && (
                              <Badge className="text-xs bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-400 border-green-500/30 font-medium">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Certified
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Link href={`/courses/${enrollment.Course.slug}`} className="ml-4">
                          <Button variant="outline" size="sm" className="group/btn">
                            View Course
                            <ArrowLeft className="w-4 h-4 ml-2 rotate-180 group-hover/btn:translate-x-1 transition-transform" />
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function StudentDetailsSkeleton() {
  return (
    <section className="py-8 md:py-12 bg-background min-h-screen">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-6xl">
        <Skeleton className="h-10 w-32 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="flex flex-col items-center space-y-4">
                <Skeleton className="w-32 h-32 rounded-full" />
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-6 w-32" />
              </div>
              <Separator />
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </CardContent>
          </Card>
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-32 w-full" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
