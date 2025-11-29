"use client";

import { useState, useTransition, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Award,
  Mail,
  Ban,
  CheckCircle2,
  AlertCircle,
  Trophy,
} from "lucide-react";
import { useConstructUrl } from "@/hooks/use-construct-url";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StudentTags, StudentTagType } from "./StudentTags";
import { CertificateManagement } from "./CertificateManagement";
import { LoginInfo } from "./LoginInfo";
import { ActivityTimeline } from "./ActivityTimeline";
import { AssignmentAnalytics } from "./AssignmentAnalytics";
import { StudentBadges, BadgeType } from "./StudentBadges";
import { StudentComparison } from "./StudentComparison";
import { EnhancedLeaderboard } from "./EnhancedLeaderboard";

interface iAppProps {
  courseId: string;
}

interface StudentData {
  id: string;
  enrollmentId: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string | null;
  image: string | null;
  enrolledAt: Date;
  progress: {
    totalLessons: number;
    completedLessons: number;
    percentage: number;
  };
  lastActivity: Date | null;
  banned: boolean;
  banUntil: Date | null;
  banReason: string | null;
  banType: "Temporary" | "Permanent" | null;
  followUpEmailSent: boolean;
  totalPoints: number;
  tags?: StudentTagType[];
  certificateEarned?: boolean;
  certificateIssuedAt?: Date | null;
  certificateKey?: string | null;
  certificateRevoked?: boolean;
  certificateRevokedAt?: Date | null;
  badges?: Array<{
    badgeType: BadgeType;
    earnedAt: Date;
    metadata?: any;
  }>;
  loginInfo?: {
    device: string | null;
    browser: string | null;
    country: string | null;
    ipAddress: string | null;
    lastLoginAt: Date;
  } | null;
  assignmentStats?: {
    submitted: number;
    late: number;
    pending: number;
    total: number;
  };
  quizStats?: {
    total: number;
    completed: number;
    passed: number;
    totalPointsEarned: number;
    averageScore: number;
  };
  quizzes?: Array<{
    quizId: string;
    quizTitle: string | null;
    quizPoints: number;
    quizRequired: boolean;
    lessonId: string;
    lessonTitle: string;
    chapterId: string;
    chapterTitle: string;
    chapterPosition: number;
    lessonPosition: number;
    submission: {
      id: string;
      score: number;
      totalQuestions: number;
      correctAnswers: number;
      pointsEarned: number;
      submittedAt: Date;
    } | null;
  }>;
}

export function StudentManagementView({ courseId }: iAppProps) {
  const [students, setStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null);
  const [banDays, setBanDays] = useState<string>("1");
  const [banHours, setBanHours] = useState<string>("0");
  const [banType, setBanType] = useState<"Temporary" | "Permanent">("Temporary");
  const [banReason, setBanReason] = useState<string>("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const constructUrl = useConstructUrl;

  const loadStudents = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/courses/${courseId}/students-management`);
      
      if (!response.ok) {
        let errorMessage = `Failed to fetch students (${response.status})`;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
          console.error("API error:", errorData);
        } catch (parseError) {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage;
          console.error("Failed to parse error response:", parseError);
        }
        
        setError(errorMessage);
        setStudents([]);
        setLoading(false);
        return;
      }

      const data = await response.json();
      console.log("Fetched students:", data);
      setStudents(Array.isArray(data) ? data : []);
      setError(null);
    } catch (error: any) {
      console.error("Failed to fetch students:", error);
      setError(error?.message || "Failed to fetch students. Please try again.");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  // Load students on mount
  useEffect(() => {
    loadStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const handleBanStudent = () => {
    if (!selectedStudent) return;

    startTransition(async () => {
      try {
        const banUntil =
          banType === "Temporary"
            ? new Date(
                Date.now() + parseInt(banDays) * 24 * 60 * 60 * 1000 + parseInt(banHours) * 60 * 60 * 1000
              )
            : null;

        const response = await fetch(`/api/admin/courses/${courseId}/ban-student`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: selectedStudent.id,
            banType,
            banUntil: banUntil?.toISOString(),
            banReason,
          }),
        });

        if (response.ok) {
          // Refresh students list
          loadStudents();
          setBanDialogOpen(false);
          setSelectedStudent(null);
          setBanDays("1");
          setBanHours("0");
          setBanReason("");
        }
      } catch (error) {
        console.error("Failed to ban student:", error);
      }
    });
  };

  const handleUnbanStudent = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/courses/${courseId}/unban-student`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        loadStudents();
      }
    } catch (error) {
      console.error("Failed to unban student:", error);
    }
  };

  const handleSendFollowUp = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/courses/${courseId}/send-followup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        loadStudents();
      }
    } catch (error) {
      console.error("Failed to send follow-up:", error);
    }
  };

  // Filter students who haven't been active
  const inactiveStudents = students.filter((student) => {
    if (!student.lastActivity) return true;
    const daysSinceActivity =
      (Date.now() - new Date(student.lastActivity).getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceActivity > 7; // Inactive for more than 7 days
  });

  return (
    <div className="space-y-6">

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading students...</div>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-center py-12">
          <div className="text-destructive">{error}</div>
        </div>
      )}

      {!loading && !error && students.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <User className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Students Enrolled</h3>
          <p className="text-sm text-muted-foreground">
            This course doesn't have any enrolled students yet.
          </p>
        </div>
      )}

      {!loading && !error && students.length > 0 && (
        <Tabs defaultValue="all-students" className="w-full">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="all-students">All Students</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            <TabsTrigger value="inactive">Inactive Students</TabsTrigger>
            <TabsTrigger value="banned">Banned Students</TabsTrigger>
          </TabsList>

          <TabsContent value="all-students" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                All Students ({students.length})
              </h3>
              <StudentComparison students={students} courseId={courseId} />
            </div>

            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Points</TableHead>
                    <TableHead>Assignments</TableHead>
                    <TableHead>Quizzes</TableHead>
                    <TableHead>Badges</TableHead>
                    <TableHead>Certificate</TableHead>
                    <TableHead>Login Info</TableHead>
                    <TableHead>Last Activity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student, index) => (
                    <motion.tr
                      key={student.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.03 }}
                      className={student.banned ? "bg-destructive/10" : ""}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage
                              src={student.image ? constructUrl(student.image) : undefined}
                              alt={student.firstName}
                            />
                            <AvatarFallback>
                              {student.firstName[0]}
                              {student.lastName?.[0] || ""}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {student.firstName} {student.lastName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {student.email}
                            </div>
                            {student.username && (
                              <div className="text-xs text-muted-foreground">
                                @{student.username}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <StudentTags tags={student.tags || []} loading={loading} />
                      </TableCell>
                      <TableCell>
                        <div className="w-32">
                          <Progress value={student.progress.percentage} className="h-2 mb-1" />
                          <div className="text-xs text-muted-foreground">
                            {student.progress.completedLessons} / {student.progress.totalLessons}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Award className="h-4 w-4 text-primary" />
                          <span className="font-semibold">{student.totalPoints}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {student.assignmentStats ? (
                          <AssignmentAnalytics
                            submitted={student.assignmentStats.submitted}
                            late={student.assignmentStats.late}
                            pending={student.assignmentStats.pending}
                            total={student.assignmentStats.total}
                            loading={loading}
                          />
                        ) : (
                          <span className="text-xs text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {student.quizStats ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Trophy className="h-4 w-4 text-primary" />
                              <span className="font-medium">
                                {student.quizStats.completed}/{student.quizStats.total}
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {student.quizStats.passed} passed
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Avg: {student.quizStats.averageScore}%
                            </div>
                            <div className="text-xs text-primary font-medium">
                              +{student.quizStats.totalPointsEarned} pts
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <StudentBadges badges={student.badges || []} loading={loading} />
                      </TableCell>
                      <TableCell>
                        {student.enrollmentId && (
                          <CertificateManagement
                            certificateEarned={student.certificateEarned || false}
                            certificateIssuedAt={student.certificateIssuedAt}
                            certificateKey={student.certificateKey}
                            certificateRevoked={student.certificateRevoked || false}
                            enrollmentId={student.enrollmentId}
                            courseId={courseId}
                            userId={student.id}
                            onUpdate={loadStudents}
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        {student.loginInfo ? (
                          <LoginInfo
                            device={student.loginInfo.device}
                            browser={student.loginInfo.browser}
                            country={student.loginInfo.country}
                            ipAddress={student.loginInfo.ipAddress}
                            lastLoginAt={student.loginInfo.lastLoginAt}
                            loading={loading}
                          />
                        ) : (
                          <span className="text-xs text-muted-foreground">No data</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {student.lastActivity ? (
                          <div className="text-sm">
                            {new Date(student.lastActivity).toLocaleDateString()}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">Never</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {(() => {
                          const isBanned =
                            student.banned &&
                            (student.banType === "Permanent" ||
                              (student.banUntil && new Date(student.banUntil) > new Date()));
                          return isBanned ? (
                            <Badge variant="destructive">
                              <Ban className="h-3 w-3 mr-1" />
                              {student.banType === "Permanent" ? "Permanently Banned" : "Banned"}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-green-500/20 text-green-600">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Active
                            </Badge>
                          );
                        })()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2 flex-wrap">
                          <ActivityTimeline
                            enrollmentId={student.enrollmentId}
                            courseId={courseId}
                            userId={student.id}
                          />
                          {(() => {
                            const isBanned =
                              student.banned &&
                              (student.banType === "Permanent" ||
                                (student.banUntil && new Date(student.banUntil) > new Date()));
                            return isBanned ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUnbanStudent(student.id)}
                              >
                                Unban
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedStudent(student);
                                  setBanDialogOpen(true);
                                }}
                              >
                                <Ban className="h-3 w-3 mr-1" />
                                Ban
                              </Button>
                            );
                          })()}
                          {!student.followUpEmailSent && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSendFollowUp(student.id)}
                            >
                              <Mail className="h-3 w-3 mr-1" />
                              Follow-up
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-4">
            <EnhancedLeaderboard students={students} loading={loading} />
          </TabsContent>

          <TabsContent value="inactive" className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              <h3 className="text-lg font-semibold">
                Inactive Students ({inactiveStudents.length})
              </h3>
            </div>

            <div className="space-y-2">
              {inactiveStudents.map((student, index) => (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.03 }}
                  className="border rounded-lg p-4 bg-card"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={student.image ? constructUrl(student.image) : undefined}
                          alt={student.firstName}
                        />
                        <AvatarFallback>
                          {student.firstName[0]}
                          {student.lastName?.[0] || ""}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold">
                          {student.firstName} {student.lastName}
                        </div>
                        <div className="text-sm text-muted-foreground">{student.email}</div>
                        <div className="text-xs text-muted-foreground">
                          Last active:{" "}
                          {student.lastActivity
                            ? new Date(student.lastActivity).toLocaleDateString()
                            : "Never"}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSendFollowUp(student.id)}
                      disabled={student.followUpEmailSent}
                    >
                      <Mail className="h-3 w-3 mr-1" />
                      {student.followUpEmailSent ? "Follow-up Sent" : "Send Follow-up"}
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="banned" className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Ban className="h-5 w-5 text-destructive" />
              <h3 className="text-lg font-semibold">
                Banned Students (
                {
                  students.filter(
                    (s) =>
                      s.banned &&
                      (s.banType === "Permanent" ||
                        (s.banUntil && new Date(s.banUntil) > new Date()))
                  ).length
                }
                )
              </h3>
            </div>

            <div className="space-y-2">
              {students
                .filter(
                  (s) =>
                    s.banned &&
                    (s.banType === "Permanent" ||
                      (s.banUntil && new Date(s.banUntil) > new Date()))
                )
                .map((student, index) => (
                  <motion.div
                    key={student.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                    className="border rounded-lg p-4 bg-destructive/10"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={student.image ? constructUrl(student.image) : undefined}
                            alt={student.firstName}
                          />
                          <AvatarFallback>
                            {student.firstName[0]}
                            {student.lastName?.[0] || ""}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold">
                            {student.firstName} {student.lastName}
                          </div>
                          <div className="text-sm text-muted-foreground">{student.email}</div>
                          <div className="text-xs text-muted-foreground">
                            Reason: {student.banReason || "No reason provided"}
                          </div>
                          {student.banUntil && (
                            <div className="text-xs text-muted-foreground">
                              Until: {new Date(student.banUntil).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUnbanStudent(student.id)}
                      >
                        Unban
                      </Button>
                    </div>
                  </motion.div>
                ))}
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* Ban Dialog */}
      <Dialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ban Student</DialogTitle>
            <DialogDescription>
              Ban {selectedStudent?.firstName} {selectedStudent?.lastName} from this course
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label>Ban Type</Label>
              <Select value={banType} onValueChange={(value: "Temporary" | "Permanent") => setBanType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Temporary">Temporary</SelectItem>
                  <SelectItem value="Permanent">Permanent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {banType === "Temporary" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Days</Label>
                  <Input
                    type="number"
                    min="0"
                    value={banDays}
                    onChange={(e) => setBanDays(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Hours</Label>
                  <Input
                    type="number"
                    min="0"
                    max="23"
                    value={banHours}
                    onChange={(e) => setBanHours(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div>
              <Label>Reason</Label>
              <Textarea
                placeholder="Enter reason for ban..."
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setBanDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleBanStudent} disabled={pending}>
                {pending ? "Banning..." : "Ban Student"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

