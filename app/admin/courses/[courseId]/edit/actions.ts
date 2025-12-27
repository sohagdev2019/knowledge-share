"use server";

import { requireAdmin } from "@/app/data/admin/require-admin";
import { prisma } from "@/lib/db";
import { ApiResponse } from "@/lib/types";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import {
  courseSchema,
  CourseSchemaType,
  chapterSchema,
  ChapterSchemaType,
  lessonSchema,
  LessonSchemaType,
} from "@/lib/zodSchemas";

const gradeAssignmentSchema = z.object({
  submissionId: z.string().uuid(),
  grade: z.number().min(0).max(1000),
  feedback: z.string().max(2000).optional(),
  status: z.enum(["Graded", "Returned"]),
});

export async function editCourse(
  data: CourseSchemaType,
  courseId: string
): Promise<ApiResponse> {
  await requireAdmin();

  try {
    const result = courseSchema.safeParse(data);

    if (!result.success) {
      return {
        status: "error",
        message: "Invalid data",
      };
    }

    await prisma.course.update({
      where: {
        id: courseId,
      },
      data: {
        title: result.data.title,
        description: result.data.description,
        fileKey: result.data.fileKey,
        price: Math.round(result.data.price * 100), // Convert to cents
        duration: result.data.duration,
        level: result.data.level,
        status: result.data.status,
        smallDescription: result.data.smallDescription,
        category: result.data.category,
        slug: result.data.slug,
        availableInSubscription: result.data.availableInSubscription,
      },
    });

    revalidatePath(`/admin/courses/${courseId}/edit`);

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

export async function createChapter(
  values: ChapterSchemaType
): Promise<ApiResponse> {
  await requireAdmin();

  try {
    const result = chapterSchema.safeParse(values);

    if (!result.success) {
      return {
        status: "error",
        message: "Invalid data",
      };
    }

    // Get the current max position for chapters in this course
    const maxPosition = await prisma.chapter.findFirst({
      where: {
        courseId: result.data.courseId,
      },
      orderBy: {
        position: "desc",
      },
      select: {
        position: true,
      },
    });

    await prisma.chapter.create({
      data: {
        title: result.data.name,
        courseId: result.data.courseId,
        position: (maxPosition?.position ?? -1) + 1,
        status: result.data.status ?? "Draft",
        releaseAt: result.data.releaseAt
          ? new Date(result.data.releaseAt)
          : null,
      },
    });

    revalidatePath(`/admin/courses/${result.data.courseId}/edit`);

    return {
      status: "success",
      message: "Chapter created successfully",
    };
  } catch {
    return {
      status: "error",
      message: "Failed to create chapter",
    };
  }
}

export async function createLesson(
  values: LessonSchemaType
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

    // Get the current max position for lessons in this chapter
    const maxPosition = await prisma.lesson.findFirst({
      where: {
        chapterId: result.data.chapterId,
      },
      orderBy: {
        position: "desc",
      },
      select: {
        position: true,
      },
    });

    await prisma.$transaction(async (tx) => {
      const lesson = await tx.lesson.create({
        data: {
          title: result.data.name,
          description: result.data.description,
          thumbnailKey: result.data.thumbnailKey,
          videoKey: result.data.videoKey,
          chapterId: result.data.chapterId,
          position: (maxPosition?.position ?? -1) + 1,
          status: result.data.status ?? "Draft",
          releaseAt: result.data.releaseAt
            ? new Date(result.data.releaseAt)
            : null,
        },
      });

      // Handle assignment if provided
      if (result.data.assignment?.title) {
        await tx.assignment.create({
          data: {
            title: result.data.assignment.title,
            description: result.data.assignment.description ?? null,
            fileKey: result.data.assignment.fileKey ?? null,
            points: result.data.assignment.points ?? 100,
            dueDate: result.data.assignment.dueDate
              ? new Date(result.data.assignment.dueDate)
              : null,
            lessonId: lesson.id,
          },
        });
      }
    });

    revalidatePath(`/admin/courses/${result.data.courseId}/edit`);

    return {
      status: "success",
      message: "Lesson created successfully",
    };
  } catch (error) {
    console.error("Failed to create lesson:", error);
    return {
      status: "error",
      message: "Failed to create lesson",
    };
  }
}

export async function deleteChapter(
  params: { chapterId: string; courseId: string }
): Promise<ApiResponse> {
  await requireAdmin();

  try {
    const { chapterId, courseId } = params;

    await prisma.chapter.delete({
      where: {
        id: chapterId,
      },
    });

    revalidatePath(`/admin/courses/${courseId}/edit`);

    return {
      status: "success",
      message: "Chapter deleted successfully",
    };
  } catch {
    return {
      status: "error",
      message: "Failed to delete chapter",
    };
  }
}

export async function deleteLesson(
  params: { lessonId: string; courseId: string; chapterId?: string }
): Promise<ApiResponse> {
  await requireAdmin();

  try {
    const { lessonId, courseId } = params;

    await prisma.lesson.delete({
      where: {
        id: lessonId,
      },
    });

    revalidatePath(`/admin/courses/${courseId}/edit`);

    return {
      status: "success",
      message: "Lesson deleted successfully",
    };
  } catch {
    return {
      status: "error",
      message: "Failed to delete lesson",
    };
  }
}

export async function reorderChapters(
  courseId: string,
  chapters: { id: string; position: number }[]
): Promise<ApiResponse> {
  await requireAdmin();

  try {
    await prisma.$transaction(
      chapters.map((chapter) =>
        prisma.chapter.update({
          where: { id: chapter.id },
          data: { position: chapter.position },
        })
      )
    );

    revalidatePath(`/admin/courses/${courseId}/edit`);

    return {
      status: "success",
      message: "Chapters reordered successfully",
    };
  } catch {
    return {
      status: "error",
      message: "Failed to reorder chapters",
    };
  }
}

export async function reorderLessons(
  chapterId: string,
  lessons: { id: string; position: number }[],
  courseId: string
): Promise<ApiResponse> {
  await requireAdmin();

  try {
    await prisma.$transaction(
      lessons.map((lesson) =>
        prisma.lesson.update({
          where: { id: lesson.id },
          data: { position: lesson.position },
        })
      )
    );

    revalidatePath(`/admin/courses/${courseId}/edit`);

    return {
      status: "success",
      message: "Lessons reordered successfully",
    };
  } catch {
    return {
      status: "error",
      message: "Failed to reorder lessons",
    };
  }
}

const markMissingAssignmentSchema = z.object({
  assignmentId: z.string().uuid(),
  userId: z.string().uuid(),
  grade: z.number().min(0).max(1000),
  feedback: z.string().max(2000).optional(),
  status: z.enum(["Graded", "Returned"]),
});

export async function markMissingAssignment(
  values: z.infer<typeof markMissingAssignmentSchema>
): Promise<ApiResponse> {
  await requireAdmin();

  try {
    const result = markMissingAssignmentSchema.safeParse(values);

    if (!result.success) {
      return {
        status: "error",
        message: result.error.errors[0]?.message ?? "Invalid data",
      };
    }

    // Verify assignment exists
    const assignment = await prisma.assignment.findUnique({
      where: {
        id: result.data.assignmentId,
      },
      select: {
        id: true,
        Lesson: {
          select: {
            Chapter: {
              select: {
                courseId: true,
              },
            },
          },
        },
      },
    });

    if (!assignment) {
      return {
        status: "error",
        message: "Assignment not found",
      };
    }

    // Create a submission record for missing assignment
    await prisma.assignmentSubmission.create({
      data: {
        assignmentId: result.data.assignmentId,
        userId: result.data.userId,
        fileKey: null,
        link: null,
        description: null,
        grade: result.data.grade,
        feedback: result.data.feedback || null,
        status: result.data.status,
        submissionCount: 1,
      },
    });

    const courseId = assignment.Lesson.Chapter.courseId;
    revalidatePath(`/admin/courses/${courseId}/edit`);

    return {
      status: "success",
      message: "Assignment marked and graded successfully",
    };
  } catch (error) {
    console.error("Failed to mark missing assignment:", error);
    return {
      status: "error",
      message: "Failed to mark assignment. Please try again.",
    };
  }
}

export async function gradeAssignment(
  values: z.infer<typeof gradeAssignmentSchema>
): Promise<ApiResponse> {
  await requireAdmin();

  try {
    const result = gradeAssignmentSchema.safeParse(values);

    if (!result.success) {
      return {
        status: "error",
        message: result.error.errors[0]?.message ?? "Invalid data",
      };
    }

    // Verify submission exists
    const submission = await prisma.assignmentSubmission.findUnique({
      where: {
        id: result.data.submissionId,
      },
      select: {
        id: true,
        assignmentId: true,
        Assignment: {
          select: {
            Lesson: {
              select: {
                Chapter: {
                  select: {
                    courseId: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!submission) {
      return {
        status: "error",
        message: "Submission not found",
      };
    }

    // Update submission
    await prisma.assignmentSubmission.update({
      where: {
        id: result.data.submissionId,
      },
      data: {
        grade: result.data.grade,
        feedback: result.data.feedback || null,
        status: result.data.status,
      },
    });

    const courseId = submission.Assignment.Lesson.Chapter.courseId;
    revalidatePath(`/admin/courses/${courseId}/edit`);

    return {
      status: "success",
      message: "Assignment graded successfully",
    };
  } catch (error) {
    console.error("Failed to grade assignment:", error);
    return {
      status: "error",
      message: "Failed to grade assignment. Please try again.",
    };
  }
}
