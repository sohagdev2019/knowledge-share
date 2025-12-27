"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StudentType } from "@/app/data/student/get-all-students";
import { useRouter } from "next/navigation";
import { 
  BookOpen, 
  CheckCircle2, 
  Award, 
  Trophy,
  Mail,
  Briefcase
} from "lucide-react";

interface StudentsGridSectionProps {
  students: StudentType[];
}

export function StudentsGridSection({ students }: StudentsGridSectionProps) {
  if (students.length === 0) {
    return (
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center py-12 space-y-4">
            <p className="text-muted-foreground text-lg">
              No students found.
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
              All Students
            </h2>
            <p className="text-muted-foreground mt-2">
              {students.length} student{students.length !== 1 ? "s" : ""} in total
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {students.map((student) => (
              <StudentCard key={student.id} student={student} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function StudentCard({ student }: { student: StudentType }) {
  const router = useRouter();
  const fullName = `${student.firstName} ${student.lastName || ""}`.trim();
  const initials = `${student.firstName[0]}${student.lastName?.[0] || ""}`.toUpperCase();
  
  const handleViewProfile = () => {
    router.push(`/students-gallery/${student.id}`);
  };
  
  return (
    <Card className="border border-border bg-card hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-6 space-y-5 relative flex flex-col h-full">
        {/* Rank Badge */}
        {student.rank && (
          <div className="absolute top-4 right-4 z-10">
            <Badge 
              variant={student.rank <= 3 ? "default" : "secondary"}
              className={student.rank <= 3 ? "bg-primary text-primary-foreground" : ""}
            >
              #{student.rank}
            </Badge>
          </div>
        )}

        {/* Profile Section */}
        <div className="flex flex-col items-center space-y-3 pt-2">
          <Avatar className="w-24 h-24 border-2 border-border">
            <AvatarImage 
              src={student.image || undefined} 
              alt={fullName}
            />
            <AvatarFallback className="text-lg font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="text-center space-y-1">
            <h3 className="font-semibold text-lg">{fullName}</h3>
            {student.designation ? (
              <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                <Briefcase className="w-3 h-3" />
                <span>{student.designation}</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                <Mail className="w-3 h-3" />
                <span className="truncate max-w-[200px]">{student.email}</span>
              </div>
            )}
          </div>
        </div>

        {/* Activity Statistics */}
        <div className="pt-2 border-t border-border">
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col items-center space-y-1">
              <div className="text-xs text-muted-foreground">Points</div>
              <div className="flex items-center gap-1">
                <Trophy className="w-4 h-4 text-yellow-500" />
                <span className="font-semibold">{student.points || 0}</span>
              </div>
            </div>
            <div className="flex flex-col items-center space-y-1">
              <div className="text-xs text-muted-foreground">Courses</div>
              <div className="flex items-center gap-1">
                <BookOpen className="w-4 h-4 text-blue-500" />
                <span className="font-semibold">{student.enrollmentsCount || 0}</span>
              </div>
            </div>
            <div className="flex flex-col items-center space-y-1">
              <div className="text-xs text-muted-foreground">Lessons</div>
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="font-semibold">{student.completedLessonsCount || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Achievement Badges */}
        {(student.certificatesEarned > 0 || student.totalQuizPoints > 0) && (
          <div className="pt-2 border-t border-border">
            <div className="flex flex-wrap gap-2 justify-center">
              {student.certificatesEarned > 0 && (
                <Badge variant="outline" className="gap-1">
                  <Award className="w-3 h-3" />
                  {student.certificatesEarned} Certificate{student.certificatesEarned !== 1 ? "s" : ""}
                </Badge>
              )}
              {student.totalQuizPoints > 0 && (
                <Badge variant="outline" className="gap-1">
                  <Trophy className="w-3 h-3" />
                  {student.totalQuizPoints} Quiz Pts
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* View Profile Button */}
        <div className="pt-4 mt-auto">
          <Button 
            variant="outline" 
            className="w-full cursor-pointer"
            onClick={handleViewProfile}
          >
            View Profile
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
