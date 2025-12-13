"use client";

import { LessonContentType } from "@/app/data/course/get-lesson-content";
import { RenderDescription } from "@/components/rich-text-editor/RenderDescription";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Uploader } from "@/components/file-uploader/Uploader";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { tryCatch } from "@/hooks/try-catch";
import { env } from "@/lib/env";
import { BookIcon, CheckCircle, FileText, Download, Calendar, Award, Upload, CheckCircle2, Clock, Link2, Edit, ChevronLeft, ChevronRight, Lock, Coins, AlertCircle } from "lucide-react";
import { useTransition, useState, useEffect } from "react";
import { markLessonComplete, submitAssignment } from "../actions";
import { toast } from "sonner";
import { useConfetti } from "@/hooks/use-confetti";
import { motion } from "framer-motion";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { LessonCountdown } from "./LessonCountdown";
import { QuizComponent } from "./QuizComponent";

interface iAppProps {
  data: LessonContentType;
}

export function CourseContent({ data }: iAppProps) {
  const [pending, startTransition] = useTransition();
  const [submissionPending, setSubmissionPending] = useTransition();
  const [submissionFileKey, setSubmissionFileKey] = useState<string>("");
  const [submissionLink, setSubmissionLink] = useState<string>("");
  const [submissionDescription, setSubmissionDescription] = useState<string>("");
  const [showEditForm, setShowEditForm] = useState<boolean>(false);
  const { triggerConfetti } = useConfetti();
  
  const constructFileUrl = (key: string) => {
    if (!key) return "";
    return `https://${env.NEXT_PUBLIC_S3_BUCKET_NAME_IMAGES}.fly.storage.tigris.dev/${key}`;
  };
  
  const assignmentFileUrl = data.assignment?.fileKey
    ? constructFileUrl(data.assignment.fileKey)
    : null;
  
  const submission = data.assignment?.submissions[0];
  const submissionFileUrl = submission?.fileKey
    ? constructFileUrl(submission.fileKey)
    : null;

  // Check if user can edit submission
  const canEditSubmission = !submission || submission.status === "Pending" || submission.status === "Returned";
  // Show form only if no submission exists OR if edit button was clicked and status allows editing
  const showSubmissionForm = !submission || (showEditForm && canEditSubmission);

  // Initialize form with existing submission data when editing
  useEffect(() => {
    if (submission && canEditSubmission && showEditForm) {
      // Initialize with existing submission values when edit form is shown
      if (submission.fileKey) {
        setSubmissionFileKey(submission.fileKey);
      }
      if (submission.link) {
        setSubmissionLink(submission.link);
      }
      if (submission.description) {
        setSubmissionDescription(submission.description);
      }
    } else if (!submission) {
      // Reset form when no submission exists
      setSubmissionFileKey("");
      setSubmissionLink("");
      setSubmissionDescription("");
      setShowEditForm(false); // Reset edit form state
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submission?.id, canEditSubmission, showEditForm]);

  function VideoPlayer({
    thumbnailKey,
    videoKey,
  }: {
    thumbnailKey: string;
    videoKey: string;
  }) {
    const videoUrl = constructFileUrl(videoKey);
    const thumbnailUrl = constructFileUrl(thumbnailKey);

    if (!videoKey) {
      return (
        <div className="aspect-video bg-muted rounded-lg flex flex-col items-center justify-center">
          <BookIcon className="size-16 text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">
            This lesson does not have a video yet
          </p>
        </div>
      );
    }

    return (
      <div className="aspect-video bg-black rounded-lg relative overflow-hidden">
        <video
          className="w-full h-full object-cover"
          controls
          poster={thumbnailUrl}
        >
          <source src={videoUrl} type="video/mp4" />
          <source src={videoUrl} type="video/webm" />
          <source src={videoUrl} type="video/ogg" />
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }

  function onSubmit() {
    startTransition(async () => {
      const { data: result, error } = await tryCatch(
        markLessonComplete(data.id, data.Chapter.Course.slug)
      );

      if (error) {
        toast.error("An unexpected error occurred. Please try again.");
        return;
      }

      if (result.status === "success") {
        toast.success(result.message);
        triggerConfetti();
      } else if (result.status === "error") {
        toast.error(result.message);
      }
    });
  }

  function onSubmitAssignment() {
    if (!data.assignment) {
      toast.error("Assignment not found");
      return;
    }

    // Validate that at least one field is provided
    if (!submissionFileKey && !submissionLink && !submissionDescription.trim()) {
      toast.error("Please provide at least one: file, link, or description");
      return;
    }

    setSubmissionPending(async () => {
      const { data: result, error } = await tryCatch(
        submitAssignment(
          {
            assignmentId: data.assignment!.id,
            fileKey: submissionFileKey || undefined,
            link: submissionLink.trim() || undefined,
            description: submissionDescription.trim() || undefined,
          },
          data.Chapter.Course.slug
        )
      );

      if (error) {
        toast.error("An unexpected error occurred. Please try again.");
        return;
      }

      if (result.status === "success") {
        toast.success(result.message);
        // Reset form and hide it
        setSubmissionFileKey("");
        setSubmissionLink("");
        setSubmissionDescription("");
        setShowEditForm(false);
        // Refresh the page to update lock status
        window.location.reload();
      } else if (result.status === "error") {
        toast.error(result.message);
      }
    });
  }
  // Check if lesson is scheduled (has future releaseAt and not early-unlocked)
  const isScheduled = 
    data.releaseAt && 
    new Date(data.releaseAt) > new Date() && 
    !(data as any).isEarlyUnlocked;
  const releaseAt = data.releaseAt ? new Date(data.releaseAt) : null;

  return (
    <div className="flex flex-col h-full bg-background pl-6">
      {isScheduled && releaseAt && (
        <div className="mb-4">
          <LessonCountdown
            lessonId={data.id}
            releaseAt={releaseAt}
            slug={data.Chapter.Course.slug}
            userPoints={data.userPoints}
            onUnlock={() => window.location.reload()}
          />
        </div>
      )}
      {!isScheduled && (
        <VideoPlayer
          thumbnailKey={data.thumbnailKey ?? ""}
          videoKey={data.videoKey ?? ""}
        />
      )}

      {isScheduled && (
        <div className="aspect-video bg-muted rounded-lg flex flex-col items-center justify-center border-2 border-dashed">
          <Lock className="size-16 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center px-4">
            This lesson will be available when it releases. Unlock it early with points above.
          </p>
        </div>
      )}

      <div className="py-4 border-b flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {data.previousLesson ? (
            <Link href={`/dashboard/${data.Chapter.Course.slug}/${data.previousLesson.id}`}>
              <Button variant="outline" size="sm" className="gap-2">
                <ChevronLeft className="size-4" />
                Previous
              </Button>
            </Link>
          ) : (
            <Button variant="outline" size="sm" disabled className="gap-2">
              <ChevronLeft className="size-4" />
              Previous
            </Button>
          )}
          {data.nextLesson ? (
            data.nextLesson.locked ? (
              <Button variant="outline" size="sm" disabled className="gap-2">
                <Lock className="size-4" />
                Next (Locked)
                {data.assignmentRequired && (
                  <span className="text-xs ml-1">- Submit Assignment</span>
                )}
                {data.quizRequired && (
                  <span className="text-xs ml-1">- Pass Quiz (70%+)</span>
                )}
              </Button>
            ) : (
              <Link href={`/dashboard/${data.Chapter.Course.slug}/${data.nextLesson.id}`}>
                <Button variant="outline" size="sm" className="gap-2">
                  Next
                  <ChevronRight className="size-4" />
                </Button>
              </Link>
            )
          ) : (
            <Button variant="outline" size="sm" disabled className="gap-2">
              Next
              <ChevronRight className="size-4" />
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          {data.lessonProgress.length > 0 ? (
            <Button
              variant="outline"
              className="bg-green-500/10 text-green-500 hover:text-green-600"
            >
              <CheckCircle className="size-4 mr-2 text-green-500" />
              Completed
            </Button>
          ) : (
            <Button variant="outline" onClick={onSubmit} disabled={pending}>
              <CheckCircle className="size-4 mr-2 text-green-500" />
              Mark as Complete (+3 pts)
            </Button>
          )}
          {/* Points Display */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/5 border border-primary/20">
            <Coins className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-primary">{data.userPoints || 0}</span>
            <span className="text-xs text-muted-foreground">points</span>
          </div>
        </div>
      </div>

      <div className="space-y-3 pt-3">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {data.title}
        </h1>

        {data.description && (
          <RenderDescription json={JSON.parse(data.description)} />
        )}
      </div>

      {data.assignment && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="pt-6"
        >
          <Separator className="mb-6" />
          <Card className={`border-primary/20 bg-gradient-to-br from-background/90 via-background to-background ${
            data.assignmentRequired ? "ring-2 ring-amber-500/50" : ""
          }`}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-2xl flex items-center gap-2">
                    Assignment
                    {data.assignmentRequired && (
                      <Badge variant="destructive" className="text-xs">
                        Required
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    {data.assignmentRequired 
                      ? "You must submit this assignment to proceed to the next lesson"
                      : "Complete this assignment to test your understanding"}
                    {submission && (
                      <span className="text-xs text-muted-foreground">
                        • Submit: +6 points
                        {data.assignment.dueDate && new Date() > new Date(data.assignment.dueDate) && !submission && (
                          <span className="text-amber-600 dark:text-amber-400"> • Late: -5 points</span>
                        )}
                        {submission.status === "Graded" && (
                          <span className="text-amber-600 dark:text-amber-400"> • Resubmit: -10 points</span>
                        )}
                        {(submission.status === "Returned" || submission.status === "Pending") && (
                          <span className="text-amber-600 dark:text-amber-400"> • Edit: -3 points</span>
                        )}
                      </span>
                    )}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {data.assignment.title}
                </h3>
                {data.assignment.description && (
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {data.assignment.description}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-4 pt-2">
                {data.assignment.points && (
                  <div className="flex items-center gap-2 text-sm">
                    <Award className="h-4 w-4 text-primary" />
                    <span className="text-muted-foreground">Points:</span>
                    <span className="font-semibold text-foreground">{data.assignment.points}</span>
                  </div>
                )}
                {data.assignment.dueDate && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span className="text-muted-foreground">Due Date:</span>
                    <span className="font-semibold text-foreground">
                      {new Date(data.assignment.dueDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                )}
              </div>

              {data.assignment.fileKey && assignmentFileUrl && (
                <div className="pt-4">
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={() => {
                      window.open(assignmentFileUrl, "_blank");
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Assignment File
                  </Button>
                </div>
              )}

              <Separator className="my-6" />

              {/* Submission Status */}
              {submission && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="text-base font-semibold text-foreground">
                          Your Submission
                        </h4>
                        {canEditSubmission && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setShowEditForm(!showEditForm);
                              // When opening edit form, populate with existing values
                              if (!showEditForm && submission) {
                                if (submission.fileKey) {
                                  setSubmissionFileKey(submission.fileKey);
                                }
                                if (submission.link) {
                                  setSubmissionLink(submission.link);
                                }
                                if (submission.description) {
                                  setSubmissionDescription(submission.description);
                                }
                              }
                            }}
                            className="h-8 px-2 text-primary hover:text-primary hover:bg-primary/10"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            {showEditForm ? "Cancel Edit" : "Edit"}
                          </Button>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Submitted on{" "}
                        {new Date(submission.submittedAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {submission.submissionCount && submission.submissionCount > 1 && (
                          <span className="ml-2">• Submission #{submission.submissionCount}</span>
                        )}
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

                  {/* Show submission content */}
                  <div className="space-y-3">
                    {submission.fileKey && submissionFileUrl && (
                      <div>
                        <Button
                          variant="outline"
                          className="w-full sm:w-auto"
                          onClick={() => {
                            window.open(submissionFileUrl, "_blank");
                          }}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          View Your Submission File
                        </Button>
                      </div>
                    )}

                    {submission.link && (
                      <div>
                        <Label className="text-sm font-semibold text-foreground mb-1 block">Submission Link:</Label>
                        <a
                          href={submission.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline flex items-center gap-2"
                        >
                          <Link2 className="h-4 w-4" />
                          {submission.link}
                        </a>
                      </div>
                    )}

                    {submission.description && (
                      <div>
                        <Label className="text-sm font-semibold text-foreground mb-1 block">Description:</Label>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted/50 p-3 rounded-lg">
                          {submission.description}
                        </p>
                      </div>
                    )}
                  </div>

                  {submission.grade !== null && (
                    <div className="flex items-center gap-2 text-sm">
                      <Award className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground">Grade:</span>
                      <span className="font-semibold text-foreground">
                        {submission.grade} / {data.assignment.points ?? 100}
                      </span>
                    </div>
                  )}

                  {submission.feedback && (
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-sm font-semibold text-foreground mb-1">Feedback:</p>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {submission.feedback}
                      </p>
                    </div>
                  )}

                  {submission.status === "Graded" && (
                    <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                      <p className="text-sm text-green-600">
                        This submission has been graded. You cannot edit it.
                      </p>
                    </div>
                  )}

                  {submission.status === "Returned" && !showEditForm && (
                    <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <p className="text-sm text-blue-600">
                        Your submission has been returned. Click "Edit" above to resubmit.
                      </p>
                    </div>
                  )}

                  {submission.status === "Pending" && !showEditForm && (
                    <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      <p className="text-sm text-amber-600">
                        Your submission is pending review. Click "Edit" above to make changes.
                      </p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Submission Form - Only show if no submission OR edit button clicked */}
              {showSubmissionForm && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4 pt-4"
                >
                  <Separator className="my-6" />
                  <div>
                    <h4 className="text-base font-semibold text-foreground mb-2 flex items-center gap-2">
                      {submission ? (
                        <>
                          <Edit className="h-4 w-4" />
                          {submission.status === "Returned" ? "Resubmit Assignment" : "Edit Submission"}
                        </>
                      ) : (
                        "Submit Your Assignment"
                      )}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Provide at least one of the following: file upload, link, or description. All fields are optional.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* File Upload */}
                    <div>
                      <Label htmlFor="assignment-file" className="text-sm font-medium mb-2 block">
                        Assignment File (Optional)
                      </Label>
                      <Uploader
                        fileTypeAccepted="document"
                        onChange={setSubmissionFileKey}
                        value={submissionFileKey}
                        uploadEndpoint="/api/s3/upload-submission"
                      />
                    </div>

                    {/* Link */}
                    <div>
                      <Label htmlFor="assignment-link" className="text-sm font-medium mb-2 block">
                        Assignment Link (Optional)
                      </Label>
                      <Input
                        id="assignment-link"
                        type="url"
                        placeholder="https://example.com/assignment"
                        value={submissionLink}
                        onChange={(e) => setSubmissionLink(e.target.value)}
                        className="w-full"
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <Label htmlFor="assignment-description" className="text-sm font-medium mb-2 block">
                        Description (Optional)
                      </Label>
                      <Textarea
                        id="assignment-description"
                        placeholder="Describe your submission or provide additional information..."
                        value={submissionDescription}
                        onChange={(e) => setSubmissionDescription(e.target.value)}
                        className="w-full min-h-[100px]"
                        maxLength={5000}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {submissionDescription.length} / 5000 characters
                      </p>
                    </div>

                    {/* Points Info */}
                    {(() => {
                      const isPastDue = data.assignment.dueDate && new Date() > new Date(data.assignment.dueDate);
                      const isResubmission = !!submission;
                      const isEdit = isResubmission && (submission.status === "Returned" || submission.status === "Pending");
                      const isAfterGraded = isResubmission && submission.status === "Graded";

                      let pointsNeeded = 0;
                      let pointsEarned = 0;
                      if (isPastDue && !submission) {
                        pointsNeeded = 5;
                      } else if (isAfterGraded) {
                        pointsNeeded = 10;
                      } else if (isEdit) {
                        pointsNeeded = 3;
                      } else if (!submission) {
                        pointsEarned = 6;
                      }

                      if (pointsNeeded > 0 || pointsEarned > 0) {
                        return (
                          <div className={`p-3 rounded-lg border flex items-center gap-2 ${
                            pointsNeeded > 0 
                              ? "bg-amber-500/10 border-amber-500/20" 
                              : "bg-green-500/10 border-green-500/20"
                          }`}>
                            {pointsNeeded > 0 ? (
                              <>
                                <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                <div className="flex-1">
                                  <div className="text-xs font-medium text-amber-700 dark:text-amber-400">
                                    Points Required: {pointsNeeded}
                                  </div>
                                  <div className="text-xs text-amber-600 dark:text-amber-500">
                                    Your Points: {data.userPoints || 0}
                                  </div>
                                </div>
                              </>
                            ) : (
                              <>
                                <Coins className="h-4 w-4 text-green-600 dark:text-green-400" />
                                <div className="text-xs font-medium text-green-700 dark:text-green-400">
                                  You will earn {pointsEarned} points upon submission
                                </div>
                              </>
                            )}
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>

                  <Button
                    onClick={onSubmitAssignment}
                    disabled={submissionPending || (!submissionFileKey && !submissionLink.trim() && !submissionDescription.trim())}
                    className="w-full sm:w-auto bg-primary hover:bg-primary/90"
                  >
                    {submissionPending ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        {submission ? "Update Submission" : "Submit Assignment"}
                      </>
                    )}
                  </Button>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {data.quiz && (
        <QuizComponent
          quiz={data.quiz}
          slug={data.Chapter.Course.slug}
          userPoints={data.userPoints}
          onComplete={() => window.location.reload()}
        />
      )}

      {/* Navigation Buttons at Bottom */}
      <div className="mt-8 pt-6 border-t">
        <div className="flex items-center justify-between gap-4">
          {data.previousLesson ? (
            <Link href={`/dashboard/${data.Chapter.Course.slug}/${data.previousLesson.id}`}>
              <motion.div
                whileHover={{ x: -4 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button variant="outline" className="w-full sm:w-auto gap-2">
                  <ChevronLeft className="size-4" />
                  <div className="text-left">
                    <div className="text-xs text-muted-foreground">Previous Lesson</div>
                    <div className="font-medium">{data.previousLesson.title}</div>
                  </div>
                </Button>
              </motion.div>
            </Link>
          ) : (
            <div className="flex-1" />
          )}
          {data.nextLesson ? (
            data.nextLesson.locked ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="ml-auto"
              >
                <Button variant="outline" disabled className="w-full sm:w-auto gap-2 opacity-60">
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">Next Lesson</div>
                    <div className="font-medium">{data.nextLesson.title}</div>
                    {data.assignmentRequired && (
                      <div className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                        Submit assignment to unlock
                      </div>
                    )}
                    {data.quizRequired && (
                      <div className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                        Pass quiz (70%+) to unlock
                      </div>
                    )}
                  </div>
                  <Lock className="size-4" />
                </Button>
              </motion.div>
            ) : (
              <Link href={`/dashboard/${data.Chapter.Course.slug}/${data.nextLesson.id}`}>
                <motion.div
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className="ml-auto"
                >
                  <Button variant="default" className="w-full sm:w-auto gap-2">
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">Next Lesson</div>
                      <div className="font-medium">{data.nextLesson.title}</div>
                    </div>
                    <ChevronRight className="size-4" />
                  </Button>
                </motion.div>
              </Link>
            )
          ) : (
            <div className="flex-1" />
          )}
        </div>
      </div>
    </div>
  );
}
