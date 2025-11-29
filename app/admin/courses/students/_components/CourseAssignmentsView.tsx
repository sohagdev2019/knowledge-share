"use client";

import { useState, useTransition, useEffect } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ChevronDown,
  ChevronRight,
  FileText,
  CheckCircle2,
  Clock,
  Award,
  Download,
  Link2,
  BookOpen,
  GraduationCap,
} from "lucide-react";
import { useConstructUrl } from "@/hooks/use-construct-url";
import { motion } from "framer-motion";
import { AssignmentReviewModal } from "@/app/admin/courses/[courseId]/edit/_components/AssignmentReviewModal";
import { CourseAssignmentsType } from "@/app/data/admin/admin-get-course-assignments";

interface iAppProps {
  courseId: string;
}

export function CourseAssignmentsView({ courseId }: iAppProps) {
  const [courseData, setCourseData] = useState<CourseAssignmentsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  const [expandedLessons, setExpandedLessons] = useState<Set<string>>(new Set());
  const [selectedSubmission, setSelectedSubmission] = useState<{
    submissionId: string;
    studentName: string;
    assignmentTitle: string;
    lessonTitle: string;
    chapterTitle?: string;
    assignmentId?: string;
    userId?: string;
    isMissing?: boolean;
  } | null>(null);
  const constructUrl = useConstructUrl;

  const loadCourseData = async () => {
    setLoading(true);
    setError(null);
    setExpandedChapters(new Set());
    setExpandedLessons(new Set());

    try {
      const response = await fetch(`/api/admin/courses/${courseId}/assignments`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        console.error("Failed to fetch course assignments:", errorData);
        const errorMessage = errorData.error || `HTTP error! status: ${response.status}`;
        setError(errorMessage);
        setCourseData(null);
        return;
      }
      const data = await response.json();
      setCourseData(data);
      setError(null);
    } catch (error) {
      console.error("Failed to fetch course assignments:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch course assignments");
      setCourseData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourseData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const toggleChapter = (chapterId: string) => {
    const newExpanded = new Set(expandedChapters);
    if (newExpanded.has(chapterId)) {
      newExpanded.delete(chapterId);
      // Also collapse all lessons in this chapter
      const newLessons = new Set(expandedLessons);
      courseData?.chapter
        .find((ch) => ch.id === chapterId)
        ?.lessons.forEach((lesson) => {
          newLessons.delete(lesson.id);
        });
      setExpandedLessons(newLessons);
    } else {
      newExpanded.add(chapterId);
    }
    setExpandedChapters(newExpanded);
  };

  const toggleLesson = (lessonId: string) => {
    const newExpanded = new Set(expandedLessons);
    if (newExpanded.has(lessonId)) {
      newExpanded.delete(lessonId);
    } else {
      newExpanded.add(lessonId);
    }
    setExpandedLessons(newExpanded);
  };

  const handleRefresh = async () => {
    await loadCourseData();
  };

  return (
    <div className="space-y-6">

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading course data...</div>
        </div>
      )}

      {error && (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="text-destructive font-medium">{error}</div>
          <Button onClick={loadCourseData} variant="outline">
            Retry
          </Button>
        </div>
      )}

      {!loading && !error && courseData && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">{courseData.title}</h3>
          </div>

          {courseData.chapter.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No chapters in this course yet.
            </div>
          ) : (
            <div className="space-y-3">
              {courseData.chapter.map((chapter, chapterIndex) => {
                const isChapterExpanded = expandedChapters.has(chapter.id);
                const lessonsWithAssignments = chapter.lessons.filter(
                  (lesson) => lesson.assignment
                );

                return (
                  <motion.div
                    key={chapter.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: chapterIndex * 0.05 }}
                  >
                    <Collapsible
                      open={isChapterExpanded}
                      onOpenChange={() => toggleChapter(chapter.id)}
                    >
                      <div className="border rounded-lg bg-card">
                        <CollapsibleTrigger asChild>
                          <div className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                            <div className="flex items-center gap-3">
                              {isChapterExpanded ? (
                                <ChevronDown className="h-5 w-5 text-muted-foreground" />
                              ) : (
                                <ChevronRight className="h-5 w-5 text-muted-foreground" />
                              )}
                              <BookOpen className="h-5 w-5 text-primary" />
                              <div>
                                <h4 className="font-semibold text-sm">
                                  Chapter {chapter.position + 1}: {chapter.title}
                                </h4>
                                <p className="text-xs text-muted-foreground">
                                  {lessonsWithAssignments.length} assignment
                                  {lessonsWithAssignments.length !== 1 ? "s" : ""}
                                </p>
                              </div>
                            </div>
                          </div>
                        </CollapsibleTrigger>

                        <CollapsibleContent>
                          <div className="border-t p-4 space-y-3">
                            {chapter.lessons.length === 0 ? (
                              <div className="text-sm text-muted-foreground text-center py-4">
                                No lessons in this chapter yet.
                              </div>
                            ) : (
                              chapter.lessons.map((lesson, lessonIndex) => {
                                const isLessonExpanded = expandedLessons.has(lesson.id);
                                const assignment = lesson.assignment;
                                const submissions = assignment?.submissions || [];

                                if (!assignment) {
                                  return null; // Skip lessons without assignments
                                }

                                return (
                                  <motion.div
                                    key={lesson.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{
                                      duration: 0.2,
                                      delay: lessonIndex * 0.03,
                                    }}
                                  >
                                    <Collapsible
                                      open={isLessonExpanded}
                                      onOpenChange={() => toggleLesson(lesson.id)}
                                    >
                                      <div className="border rounded-lg bg-muted/30 ml-4">
                                        <CollapsibleTrigger asChild>
                                          <div className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors cursor-pointer">
                                            <div className="flex items-center gap-3 flex-1">
                                              {isLessonExpanded ? (
                                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                              ) : (
                                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                              )}
                                              <FileText className="h-4 w-4 text-primary" />
                                              <div className="flex-1">
                                                <h5 className="font-medium text-sm">
                                                  Lesson {lesson.position + 1}: {lesson.title}
                                                </h5>
                                                <p className="text-xs text-muted-foreground">
                                                  Assignment: {assignment.title}
                                                </p>
                                              </div>
                                            </div>
                                            <Badge variant="outline" className="ml-2">
                                              {submissions.length} submission
                                              {submissions.length !== 1 ? "s" : ""}
                                            </Badge>
                                          </div>
                                        </CollapsibleTrigger>

                                        <CollapsibleContent>
                                          <div className="border-t p-4 space-y-3">
                                            {submissions.length === 0 ? (
                                              <div className="text-sm text-muted-foreground text-center py-4">
                                                No submissions yet for this assignment.
                                              </div>
                                            ) : (
                                              submissions.map((submission, subIndex) => {
                                                const user = submission.User;
                                                const pendingCount = submissions.filter(
                                                  (s) => s.status === "Pending"
                                                ).length;

                                                return (
                                                  <motion.div
                                                    key={submission.id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{
                                                      duration: 0.2,
                                                      delay: subIndex * 0.05,
                                                    }}
                                                    className="border rounded-lg p-3 bg-background ml-4"
                                                  >
                                                    <div className="flex items-start gap-3 mb-3">
                                                      <Avatar className="h-10 w-10">
                                                        <AvatarImage
                                                          src={
                                                            user.image
                                                              ? constructUrl(user.image)
                                                              : undefined
                                                          }
                                                          alt={user.firstName}
                                                        />
                                                        <AvatarFallback>
                                                          {user.firstName?.[0] || "U"}
                                                          {user.lastName?.[0] || ""}
                                                        </AvatarFallback>
                                                      </Avatar>
                                                      <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                          <h6 className="font-semibold text-sm">
                                                            {user.firstName} {user.lastName}
                                                          </h6>
                                                          {user.username && (
                                                            <Badge variant="outline" className="text-xs">
                                                              @{user.username}
                                                            </Badge>
                                                          )}
                                                        </div>
                                                        <p className="text-xs text-muted-foreground">
                                                          {user.email}
                                                        </p>
                                                      </div>
                                                      <Badge
                                                        variant="outline"
                                                        className={
                                                          submission.status === "Graded"
                                                            ? "bg-green-500/20 text-green-600 border-green-500/50"
                                                            : submission.status === "Returned"
                                                              ? "bg-blue-500/20 text-blue-600 border-blue-500/50"
                                                              : "bg-amber-500/20 text-amber-600 border-amber-500/50"
                                                        }
                                                      >
                                                        {submission.status === "Graded" ? (
                                                          <CheckCircle2 className="h-3 w-3 mr-1" />
                                                        ) : submission.status === "Returned" ? (
                                                          <FileText className="h-3 w-3 mr-1" />
                                                        ) : (
                                                          <Clock className="h-3 w-3 mr-1" />
                                                        )}
                                                        {submission.status}
                                                      </Badge>
                                                    </div>

                                                    <div className="space-y-2 text-sm">
                                                      <div className="text-xs text-muted-foreground">
                                                        Submitted:{" "}
                                                        {new Date(
                                                          submission.submittedAt
                                                        ).toLocaleDateString()}
                                                        {submission.submissionCount > 1 && (
                                                          <span className="ml-2">
                                                            • Submission #{submission.submissionCount}
                                                          </span>
                                                        )}
                                                      </div>

                                                      {submission.fileKey && (
                                                        <Button
                                                          variant="outline"
                                                          size="sm"
                                                          className="w-full sm:w-auto"
                                                          onClick={() => {
                                                            window.open(
                                                              constructUrl(submission.fileKey!),
                                                              "_blank"
                                                            );
                                                          }}
                                                        >
                                                          <Download className="h-3 w-3 mr-2" />
                                                          Download File
                                                        </Button>
                                                      )}

                                                      {submission.link && (
                                                        <div>
                                                          <a
                                                            href={submission.link}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-xs text-primary hover:underline flex items-center gap-1"
                                                          >
                                                            <Link2 className="h-3 w-3" />
                                                            View Submission Link
                                                          </a>
                                                        </div>
                                                      )}

                                                      {submission.description && (
                                                        <div className="text-xs bg-muted/50 p-2 rounded">
                                                          <p className="font-medium mb-1">Description:</p>
                                                          <p className="text-muted-foreground whitespace-pre-wrap">
                                                            {submission.description}
                                                          </p>
                                                        </div>
                                                      )}

                                                      {submission.grade !== null && (
                                                        <div className="flex items-center gap-2">
                                                          <Award className="h-4 w-4 text-primary" />
                                                          <span className="text-muted-foreground">Grade:</span>
                                                          <span className="font-semibold">
                                                            {submission.grade} / {assignment.points ?? 100}
                                                          </span>
                                                        </div>
                                                      )}

                                                      {submission.feedback && (
                                                        <div className="text-xs bg-muted/50 p-2 rounded">
                                                          <p className="font-medium mb-1">Feedback:</p>
                                                          <p className="text-muted-foreground whitespace-pre-wrap">
                                                            {submission.feedback}
                                                          </p>
                                                        </div>
                                                      )}

                                                      <Button
                                                        variant="default"
                                                        size="sm"
                                                        className="w-full sm:w-auto mt-2"
                                                        onClick={() => {
                                                          setSelectedSubmission({
                                                            submissionId: submission.id,
                                                            studentName: `${user.firstName} ${user.lastName}`,
                                                            assignmentTitle: assignment.title,
                                                            lessonTitle: lesson.title,
                                                            chapterTitle: chapter.title,
                                                          });
                                                        }}
                                                      >
                                                        <FileText className="h-3 w-3 mr-2" />
                                                        {submission.status === "Pending"
                                                          ? "Review & Grade"
                                                          : "Update Grade"}
                                                      </Button>
                                                    </div>
                                                  </motion.div>
                                                );
                                              })
                                            )}
                                          </div>
                                        </CollapsibleContent>
                                      </div>
                                    </Collapsible>
                                  </motion.div>
                                );
                              })
                            )}
                          </div>
                        </CollapsibleContent>
                      </div>
                    </Collapsible>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {selectedSubmission && (
        <AssignmentReviewModal
          submissionId={selectedSubmission.submissionId}
          studentName={selectedSubmission.studentName}
          assignmentTitle={selectedSubmission.assignmentTitle}
          lessonTitle={selectedSubmission.lessonTitle}
          chapterTitle={selectedSubmission.chapterTitle}
          assignmentId={selectedSubmission.assignmentId}
          userId={selectedSubmission.userId}
          isMissing={selectedSubmission.isMissing}
          onClose={() => setSelectedSubmission(null)}
          onSuccess={() => {
            handleRefresh();
            setSelectedSubmission(null);
          }}
        />
      )}
    </div>
  );
}

