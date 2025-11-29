"use server";

import { requireAdmin } from "@/app/data/admin/require-admin";
import { prisma } from "@/lib/db";
import { ApiResponse } from "@/lib/types";
import { lessonSchema, LessonSchemaType } from "@/lib/zodSchemas";

export async function updateLesson(
  values: LessonSchemaType,
  lessonId: string
): Promise<ApiResponse> {
  await requireAdmin();

  try {
    const result = lessonSchema.safeParse(values);

    if (!result.success) {
      return {
        status: "error",
        message: "Invalid data",
      };
    }

    await prisma.$transaction(async (tx) => {
      await tx.lesson.update({
        where: {
          id: lessonId,
        },
        data: {
          title: result.data.name,
          description: result.data.description,
          thumbnailKey: result.data.thumbnailKey,
          videoKey: result.data.videoKey,
          status: result.data.status ?? "Draft",
          releaseAt: result.data.releaseAt
            ? new Date(result.data.releaseAt)
            : null,
        },
      });

      // Handle assignment
      if (result.data.assignment?.title) {
        await tx.assignment.upsert({
          where: {
            lessonId: lessonId,
          },
          create: {
            title: result.data.assignment.title,
            description: result.data.assignment.description ?? null,
            fileKey: result.data.assignment.fileKey ?? null,
            points: result.data.assignment.points ?? 100,
            dueDate: result.data.assignment.dueDate
              ? new Date(result.data.assignment.dueDate)
              : null,
            lessonId: lessonId,
          },
          update: {
            title: result.data.assignment.title,
            description: result.data.assignment.description ?? null,
            fileKey: result.data.assignment.fileKey ?? null,
            points: result.data.assignment.points ?? 100,
            dueDate: result.data.assignment.dueDate
              ? new Date(result.data.assignment.dueDate)
              : null,
          },
        });
      } else {
        // Delete assignment if title is not provided
        await tx.assignment.deleteMany({
          where: {
            lessonId: lessonId,
          },
        });
      }

      // Handle quiz
      if (result.data.quiz && result.data.quiz.questions && result.data.quiz.questions.length > 0) {
        const existingQuiz = await tx.quiz.findUnique({
          where: { lessonId: lessonId },
          include: { questions: true },
        });

        if (existingQuiz) {
          // Update existing quiz
          await tx.quiz.update({
            where: { lessonId: lessonId },
            data: {
              title: result.data.quiz.title || null,
              points: result.data.quiz.points ?? 10,
              required: result.data.quiz.required ?? true,
            },
          });

          // Delete old questions
          await tx.quizQuestion.deleteMany({
            where: { quizId: existingQuiz.id },
          });
        } else {
          // Create new quiz
          await tx.quiz.create({
            data: {
              title: result.data.quiz.title || null,
              points: result.data.quiz.points ?? 10,
              required: result.data.quiz.required ?? true,
              lessonId: lessonId,
            },
          });
        }

        // Get quiz ID
        const quiz = await tx.quiz.findUnique({
          where: { lessonId: lessonId },
        });

        if (quiz) {
          // Create/update questions
          await Promise.all(
            result.data.quiz.questions.map((q, index) =>
              tx.quizQuestion.create({
                data: {
                  question: q.question,
                  options: q.options,
                  correctAnswer: q.correctAnswer,
                  position: index,
                  quizId: quiz.id,
                },
              })
            )
          );
        }
      } else {
        // Delete quiz if no questions provided
        await tx.quiz.deleteMany({
          where: {
            lessonId: lessonId,
          },
        });
      }
    });

    return {
      status: "success",
      message: "Course updated successfully",
    };
  } catch {
    return {
      status: "error",
      message: "Failed to update course",
    };
  }
}
