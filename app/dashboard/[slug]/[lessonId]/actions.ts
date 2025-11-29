"use server";

import { requireUser } from "@/app/data/user/require-user";
import { prisma } from "@/lib/db";
import { ApiResponse } from "@/lib/types";
import { assignmentSubmissionSchema, AssignmentSubmissionSchemaType } from "@/lib/zodSchemas";
import { revalidatePath } from "next/cache";

export async function markLessonComplete(
  lessonId: string,
  slug: string
): Promise<ApiResponse> {
  const session = await requireUser();

  try {
    // Check if already completed
    const existingProgress = await prisma.lessonProgress.findUnique({
      where: {
        userId_lessonId: {
          userId: session.id,
          lessonId: lessonId,
        },
      },
    });

    await prisma.lessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId: session.id,
          lessonId: lessonId,
        },
      },
      update: {
        completed: true,
      },
      create: {
        lessonId: lessonId,
        userId: session.id,
        completed: true,
      },
    });

    // Award 3 points only if this is the first time completing
    if (!existingProgress?.completed) {
      await prisma.user.update({
        where: { id: session.id },
        data: {
          points: {
            increment: 3,
          },
        },
      });
    }

    revalidatePath(`/dashboard/${slug}`);

    return {
      status: "success",
      message: existingProgress?.completed ? "Progress updated" : "Lesson completed! +3 points earned",
    };
  } catch {
    return {
      status: "error",
      message: "Failed to mark lesson as complete",
    };
  }
}

export async function submitAssignment(
  values: AssignmentSubmissionSchemaType,
  slug: string
): Promise<ApiResponse> {
  const session = await requireUser();

  try {
    const result = assignmentSubmissionSchema.safeParse(values);

    if (!result.success) {
      return {
        status: "error",
        message: result.error.errors[0]?.message ?? "Invalid submission data",
      };
    }

    // Verify assignment exists and get details
    const assignment = await prisma.assignment.findUnique({
      where: {
        id: result.data.assignmentId,
      },
      select: {
        id: true,
        dueDate: true,
      },
    });

    if (!assignment) {
      return {
        status: "error",
        message: "Assignment not found",
      };
    }

    // Get user's current points
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: { points: true },
    });

    if (!user) {
      return {
        status: "error",
        message: "User not found",
      };
    }

    // Check if submission already exists
    const existingSubmission = await prisma.assignmentSubmission.findUnique({
      where: {
        userId_assignmentId: {
          userId: session.id,
          assignmentId: result.data.assignmentId,
        },
      },
      select: {
        id: true,
        status: true,
        submissionCount: true,
        submittedAt: true,
      },
    });

    // Check if assignment is past due date
    const isPastDue = assignment.dueDate && new Date() > new Date(assignment.dueDate);
    const isResubmission = !!existingSubmission;
    const isEdit = isResubmission && (existingSubmission.status === "Returned" || existingSubmission.status === "Pending");
    const isAfterGraded = isResubmission && existingSubmission.status === "Graded";

    // Calculate points needed
    let pointsNeeded = 0;
    if (isPastDue && !existingSubmission) {
      pointsNeeded = 5; // 5 points to submit after due date
    } else if (isAfterGraded) {
      pointsNeeded = 10; // 10 points to resubmit after being graded
    } else if (isEdit) {
      pointsNeeded = 3; // 3 points to edit/resubmit
    }

    // Check if user has enough points
    if (pointsNeeded > 0 && user.points < pointsNeeded) {
      return {
        status: "error",
        message: `Insufficient points. You need ${pointsNeeded} points but only have ${user.points} points.`,
      };
    }

    // Deduct points if needed
    if (pointsNeeded > 0) {
      await prisma.user.update({
        where: { id: session.id },
        data: {
          points: {
            decrement: pointsNeeded,
          },
        },
      });
    }

    // Prepare data - convert empty strings to null
    const fileKey = result.data.fileKey && result.data.fileKey.trim() !== "" ? result.data.fileKey : null;
    const link = result.data.link && result.data.link.trim() !== "" ? result.data.link : null;
    const description = result.data.description && result.data.description.trim() !== "" ? result.data.description : null;

    // Create or update submission
    if (existingSubmission) {
      // Update existing submission
      await prisma.assignmentSubmission.update({
        where: {
          userId_assignmentId: {
            userId: session.id,
            assignmentId: result.data.assignmentId,
          },
        },
        data: {
          fileKey,
          link,
          description,
          status: "Pending",
          submittedAt: new Date(),
          submissionCount: existingSubmission.submissionCount + 1,
        },
      });
    } else {
      // Create new submission
      await prisma.assignmentSubmission.create({
        data: {
          assignmentId: result.data.assignmentId,
          userId: session.id,
          fileKey,
          link,
          description,
          status: "Pending",
          submissionCount: 1,
        },
      });

      // Award 6 points for first-time submission (if not past due)
      if (!isPastDue) {
        await prisma.user.update({
          where: { id: session.id },
          data: {
            points: {
              increment: 6,
            },
          },
        });
      }
    }

    revalidatePath(`/dashboard/${slug}`);

    let message = existingSubmission 
      ? `Assignment resubmitted successfully${pointsNeeded > 0 ? ` (-${pointsNeeded} points)` : ""}`
      : `Assignment submitted successfully${isPastDue ? ` (-${pointsNeeded} points)` : " (+6 points earned)"}`;

    return {
      status: "success",
      message,
    };
  } catch (error) {
    console.error("Failed to submit assignment:", error);
    return {
      status: "error",
      message: "Failed to submit assignment. Please try again.",
    };
  }
}

export async function submitQuiz(
  quizId: string,
  answers: Record<string, number>,
  slug: string
): Promise<ApiResponse & { data?: { score: number; totalQuestions: number; correctAnswers: number; pointsEarned: number } }> {
  const session = await requireUser();

  try {
    // Get quiz with questions
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          orderBy: {
            position: "asc",
          },
        },
      },
    });

    if (!quiz) {
      return {
        status: "error",
        message: "Quiz not found",
      };
    }

    // Check if already submitted
    const existingSubmission = await prisma.quizSubmission.findUnique({
      where: {
        userId_quizId: {
          userId: session.id,
          quizId: quizId,
        },
      },
    });

    // Allow retake if quiz is required and user didn't pass (score < 70%)
    const canRetake = existingSubmission && quiz.required && existingSubmission.score < 70;
    
    if (existingSubmission && !canRetake) {
      return {
        status: "error",
        message: "You have already submitted this quiz",
      };
    }

    // Validate all questions are answered
    if (Object.keys(answers).length !== quiz.questions.length) {
      return {
        status: "error",
        message: "Please answer all questions",
      };
    }

    // Calculate score
    let correctAnswers = 0;
    const answerMap: Record<string, number> = {};

    quiz.questions.forEach((question) => {
      const userAnswer = answers[question.id];
      answerMap[question.id] = userAnswer;
      if (userAnswer === question.correctAnswer) {
        correctAnswers++;
      }
    });

    const totalQuestions = quiz.questions.length;
    const score = Math.round((correctAnswers / totalQuestions) * 100);

    // Calculate points earned based on correct answers only
    // Each correct answer = (total points / total questions)
    // Example: 10 points, 2 questions = 5 points per correct answer
    const pointsPerQuestion = quiz.points / totalQuestions;
    const pointsEarned = Math.round(correctAnswers * pointsPerQuestion);

    // Get user's current points
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: { points: true },
    });

    if (!user) {
      return {
        status: "error",
        message: "User not found",
      };
    }

    if (canRetake && existingSubmission) {
      // Retaking quiz - update existing submission and adjust points
      const previousPointsEarned = existingSubmission.pointsEarned;
      const pointsDifference = pointsEarned - previousPointsEarned;

      // Update submission
      await prisma.quizSubmission.update({
        where: {
          userId_quizId: {
            userId: session.id,
            quizId: quizId,
          },
        },
        data: {
          score: score,
          totalQuestions: totalQuestions,
          correctAnswers: correctAnswers,
          pointsEarned: pointsEarned,
          answers: answerMap,
          updatedAt: new Date(),
        },
      });

      // Adjust points (add difference)
      if (pointsDifference !== 0) {
        await prisma.user.update({
          where: { id: session.id },
          data: {
            points: {
              increment: pointsDifference,
            },
          },
        });
      }
    } else {
      // First time submission - create new submission
      await prisma.quizSubmission.create({
        data: {
          quizId: quizId,
          userId: session.id,
          score: score,
          totalQuestions: totalQuestions,
          correctAnswers: correctAnswers,
          pointsEarned: pointsEarned,
          answers: answerMap,
        },
      });

      // Award points
      if (pointsEarned > 0) {
        await prisma.user.update({
          where: { id: session.id },
          data: {
            points: {
              increment: pointsEarned,
            },
          },
        });
      }
    }

    revalidatePath(`/dashboard/${slug}`);

    return {
      status: "success",
      message: canRetake 
        ? `Quiz retaken! ${pointsEarned > existingSubmission!.pointsEarned ? `You earned ${pointsEarned - existingSubmission!.pointsEarned} more points.` : pointsEarned < existingSubmission!.pointsEarned ? `You lost ${existingSubmission!.pointsEarned - pointsEarned} points.` : "Your score has been updated."}`
        : `Quiz submitted! You earned ${pointsEarned} points.`,
      data: {
        score,
        totalQuestions,
        correctAnswers,
        pointsEarned,
      },
    };
  } catch (error) {
    console.error("Failed to submit quiz:", error);
    return {
      status: "error",
      message: "Failed to submit quiz. Please try again.",
    };
  }
}
