import { getStudentById } from "@/app/data/student/get-student-by-id";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  CheckCircle2, 
  Award, 
  Trophy,
  Mail,
  Briefcase,
  Calendar,
  ArrowLeft,
  Globe,
  Github,
  Facebook,
  Twitter,
  Linkedin,
  User,
  Phone,
  GraduationCap,
  Target,
  TrendingUp
} from "lucide-react";
import Link from "next/link";
import { env } from "@/lib/env";
import Image from "next/image";

interface Params {
  params: Promise<{ id: string }>;
}

function constructUrl(key: string | null | undefined): string {
  if (!key) return "";
  return `https://${env.NEXT_PUBLIC_S3_BUCKET_NAME_IMAGES}.fly.storage.tigris.dev/${key}`;
}

export default async function StudentProfilePage({ params }: Params) {
  const { id } = await params;
  const student = await getStudentById(id);

  const fullName = `${student.firstName} ${student.lastName || ""}`.trim();
  const initials = `${student.firstName[0]}${student.lastName?.[0] || ""}`.toUpperCase();
  const imageUrl = student.image ? constructUrl(student.image) : undefined;
  
  // Calculate overall progress (if we have enrollment data)
  const totalEnrollments = student.enrollmentsCount || 0;
  const completedLessons = student.completedLessonsCount || 0;
  
  // Social links count
  const socialLinks = [
    student.socialWebsite,
    student.socialGithub,
    student.socialFacebook,
    student.socialTwitter,
    student.socialLinkedin,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="border-b">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 pt-8 pb-12">
          {/* Back Button */}
          <div className="mb-8">
            <Button variant="ghost" asChild>
              <Link href="/students-gallery" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Students Gallery
              </Link>
            </Button>
          </div>

          {/* Profile Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-8">
            <Avatar className="w-32 h-32 md:w-40 md:h-40 border-2 border-border">
              <AvatarImage src={imageUrl} alt={fullName} />
              <AvatarFallback className="text-3xl md:text-4xl font-semibold bg-muted">
                {initials}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">{fullName}</h1>
                <div className="flex flex-wrap items-center gap-3 text-muted-foreground">
                  {student.designation && (
                    <div className="flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4" />
                      <span className="text-sm md:text-base">{student.designation}</span>
                    </div>
                  )}
                  {student.username && (
                    <div className="flex items-center gap-1.5">
                      <User className="w-4 h-4" />
                      <span className="text-sm md:text-base">@{student.username}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm md:text-base">
                      Joined {new Date(student.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              {socialLinks > 0 && (
                <div className="flex flex-wrap gap-2">
                  {student.socialWebsite && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={student.socialWebsite} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        <span>Website</span>
                      </a>
                    </Button>
                  )}
                  {student.socialGithub && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={student.socialGithub} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                        <Github className="w-4 h-4" />
                        <span>GitHub</span>
                      </a>
                    </Button>
                  )}
                  {student.socialLinkedin && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={student.socialLinkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                        <Linkedin className="w-4 h-4" />
                        <span>LinkedIn</span>
                      </a>
                    </Button>
                  )}
                  {student.socialTwitter && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={student.socialTwitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                        <Twitter className="w-4 h-4" />
                        <span>Twitter</span>
                      </a>
                    </Button>
                  )}
                  {student.socialFacebook && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={student.socialFacebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                        <Facebook className="w-4 h-4" />
                        <span>Facebook</span>
                      </a>
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-muted">
                  <Trophy className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-3xl font-bold">{student.points || 0}</p>
                  <p className="text-sm text-muted-foreground">Total Points</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-muted">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-3xl font-bold">{student.enrollmentsCount || 0}</p>
                  <p className="text-sm text-muted-foreground">Enrolled Courses</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-muted">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-3xl font-bold">{student.completedLessonsCount || 0}</p>
                  <p className="text-sm text-muted-foreground">Completed Lessons</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-muted">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-3xl font-bold">{student.certificatesEarned || 0}</p>
                  <p className="text-sm text-muted-foreground">Certificates</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Stats */}
        {(student.totalQuizPoints > 0 || student.averageAssignmentGrade > 0) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-8">
            {student.totalQuizPoints > 0 && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      <Target className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Quiz Points</p>
                      <p className="text-2xl font-bold">{student.totalQuizPoints}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            {student.averageAssignmentGrade > 0 && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Avg. Assignment Grade</p>
                      <p className="text-2xl font-bold">{student.averageAssignmentGrade}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Left Column - About & Contact */}
          <div className="lg:col-span-1 space-y-6">
            {/* About Section */}
            {student.bio && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    About
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{student.bio}</p>
                </CardContent>
              </Card>
            )}

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <Mail className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground truncate">{student.email}</p>
                  </div>
                </div>
                {student.phoneNumber && (
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <Phone className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">Phone</p>
                      <p className="text-sm text-muted-foreground">{student.phoneNumber}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Courses & Achievements */}
          <div className="lg:col-span-2 space-y-6">
            {/* Enrolled Courses */}
            {student.enrollment.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <GraduationCap className="w-5 h-5" />
                        Enrolled Courses
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {student.enrollment.length} course{student.enrollment.length !== 1 ? "s" : ""} enrolled
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {student.enrollment.map((enrollment) => {
                      const courseImageUrl = enrollment.Course.fileKey 
                        ? constructUrl(enrollment.Course.fileKey) 
                        : undefined;
                      
                      return (
                        <Link
                          key={enrollment.id}
                          href={`/courses/${enrollment.Course.slug}`}
                          className="group"
                        >
                          <Card className="overflow-hidden hover:shadow-md transition-shadow">
                            {courseImageUrl && (
                              <div className="relative aspect-video w-full overflow-hidden bg-muted">
                                <Image
                                  src={courseImageUrl}
                                  alt={enrollment.Course.title}
                                  fill
                                  className="object-cover"
                                />
                                {enrollment.certificateEarned && (
                                  <div className="absolute top-2 right-2">
                                    <Badge variant="outline" className="bg-background/90">
                                      <Award className="w-3 h-3 mr-1" />
                                      Certified
                                    </Badge>
                                  </div>
                                )}
                              </div>
                            )}
                            <CardContent className="p-4">
                              <h3 className="font-semibold text-base mb-2 line-clamp-2">
                                {enrollment.Course.title}
                              </h3>
                              <div className="flex flex-wrap gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {enrollment.Course.level}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {enrollment.Course.category}
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Completed Lessons */}
            {student.lessonProgress.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    Recent Completed Lessons
                  </CardTitle>
                  <CardDescription>
                    {student.completedLessonsCount} lesson{student.completedLessonsCount !== 1 ? "s" : ""} completed in total
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {student.lessonProgress.slice(0, 8).map((progress) => (
                      <div
                        key={progress.id}
                        className="flex items-center gap-4 p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                      >
                        <div className="p-2 rounded-lg bg-muted">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {progress.Lesson.title}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            {progress.Lesson.Chapter.Course.title}
                          </p>
                        </div>
                      </div>
                    ))}
                    {student.lessonProgress.length > 8 && (
                      <div className="text-center pt-2">
                        <Badge variant="outline" className="text-sm">
                          +{student.lessonProgress.length - 8} more lessons
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Empty State */}
            {student.enrollment.length === 0 && student.lessonProgress.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="p-12 text-center">
                  <GraduationCap className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-semibold mb-2">No Activity Yet</h3>
                  <p className="text-muted-foreground">
                    This student hasn't enrolled in any courses or completed lessons yet.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
