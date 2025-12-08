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
  User,
  Phone,
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
    course: {
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
    completedAt: string | null;
    lesson: {
      id: string;
      title: string;
      chapter: {
        course: {
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
  const constructUrl = useConstructUrl;

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
  
  const avatarUrl = useMemo(() => {
    if (student.image) {
      return student.image.startsWith("http")
        ? student.image
        : constructUrl(student.image);
    }
    return `https://avatar.vercel.sh/${student.email}`;
  }, [student.image, student.email, constructUrl]);

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
    <section className="py-8 md:py-12 bg-background min-h-screen">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-6xl">
        {/* Back Button */}
        <Link href="/students-gallery">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Gallery
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6 border-2">
              <CardContent className="p-6 space-y-6">
                {/* Avatar and Name */}
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <Avatar className="w-32 h-32 border-4 border-primary/30 shadow-lg">
                      <AvatarImage
                        src={avatarUrl}
                        alt={fullName}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-muted text-foreground font-bold text-3xl">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    {student.certificatesEarned > 0 && (
                      <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-primary flex items-center justify-center border-4 border-background shadow-lg">
                        <Award className="w-5 h-5 text-primary-foreground" />
                      </div>
                    )}
                  </div>

                  <div className="text-center space-y-2">
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                      {fullName}
                    </h1>
                    {student.designation && (
                      <p className="text-muted-foreground font-medium">
                        {student.designation}
                      </p>
                    )}
                    <Badge
                      variant="outline"
                      className={`${rankBadge.className} flex items-center gap-2 px-3 py-1.5 font-bold text-sm border-2 mt-2`}
                    >
                      {rankBadge.icon}
                      <span>Rank #{student.rank}</span>
                    </Badge>
                  </div>
                </div>

                <Separator />

                {/* Contact Info */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground truncate">{student.email}</span>
                  </div>
                  {student.phoneNumber && (
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{student.phoneNumber}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Joined {joinDate}</span>
                  </div>
                </div>

                {/* Social Links */}
                {(student.socialWebsite || student.socialGithub || student.socialFacebook || student.socialTwitter || student.socialLinkedin) && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-foreground">Social Links</p>
                      <div className="flex flex-wrap gap-2">
                        {student.socialWebsite && (
                          <a
                            href={student.socialWebsite}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg bg-muted hover:bg-primary/10 transition-colors"
                          >
                            <Globe className="w-4 h-4 text-muted-foreground" />
                          </a>
                        )}
                        {student.socialGithub && (
                          <a
                            href={student.socialGithub}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg bg-muted hover:bg-primary/10 transition-colors"
                          >
                            <Github className="w-4 h-4 text-muted-foreground" />
                          </a>
                        )}
                        {student.socialLinkedin && (
                          <a
                            href={student.socialLinkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg bg-muted hover:bg-primary/10 transition-colors"
                          >
                            <Linkedin className="w-4 h-4 text-muted-foreground" />
                          </a>
                        )}
                        {student.socialTwitter && (
                          <a
                            href={student.socialTwitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg bg-muted hover:bg-primary/10 transition-colors"
                          >
                            <Twitter className="w-4 h-4 text-muted-foreground" />
                          </a>
                        )}
                        {student.socialFacebook && (
                          <a
                            href={student.socialFacebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg bg-muted hover:bg-primary/10 transition-colors"
                          >
                            <Facebook className="w-4 h-4 text-muted-foreground" />
                          </a>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* Bio */}
                {student.bio && (
                  <>
                    <Separator />
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
            <Card className="border-2">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-primary/10">
                      <Star className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground font-medium">Total Points</p>
                      <p className="text-3xl font-bold text-foreground">
                        {student.points.toLocaleString()} XP
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground font-medium">Level</p>
                    <p className="text-3xl font-bold text-primary">Level {student.level}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6 flex flex-col items-center space-y-2">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <BookOpen className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-2xl font-bold text-foreground">{joined}</div>
                  <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                    Courses Joined
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 flex flex-col items-center space-y-2">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <GraduationCap className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-2xl font-bold text-foreground">{finished}</div>
                  <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                    Completed
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 flex flex-col items-center space-y-2">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <TrendingUp className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-2xl font-bold text-foreground">{onGoing}</div>
                  <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                    In Progress
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 flex flex-col items-center space-y-2">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Award className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-2xl font-bold text-foreground">
                    {student.completedLessonsCount}
                  </div>
                  <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                    Lessons Done
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Award className="w-5 h-5 text-primary" />
                    Certificates Earned
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">
                    {student.certificatesEarned}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Courses completed with certification
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Average Grade
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">
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
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    Enrolled Courses ({student.enrollment.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {student.enrollment.map((enrollment) => (
                      <div
                        key={enrollment.id}
                        className="flex items-center justify-between p-4 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground">
                            {enrollment.course.title}
                          </h4>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {enrollment.course.category}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {enrollment.course.level}
                            </Badge>
                            {enrollment.certificateEarned && (
                              <Badge className="text-xs bg-green-500/20 text-green-400 border-green-500/30">
                                <Award className="w-3 h-3 mr-1" />
                                Certified
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Link href={`/courses/${enrollment.course.slug}`}>
                          <Button variant="outline" size="sm">
                            View Course
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
