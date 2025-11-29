import "server-only";
import { prisma } from "@/lib/db";
import { requireAdmin } from "./require-admin";
import { notFound } from "next/navigation";

export async function adminGetLesson(id: string) {
  await requireAdmin();

  const data = await prisma.lesson.findUnique({
    where: {
      id: id,
    },
    select: {
      title: true,
      videoKey: true,
      thumbnailKey: true,
      description: true,
      id: true,
      position: true,
      status: true,
      releaseAt: true,
      assignment: {
        select: {
          id: true,
          title: true,
          description: true,
          fileKey: true,
          points: true,
          dueDate: true,
        },
      },
      quiz: {
        select: {
          id: true,
          title: true,
          points: true,
          required: true,
          questions: {
            orderBy: {
              position: "asc",
            },
            select: {
              id: true,
              question: true,
              options: true,
              correctAnswer: true,
              position: true,
            },
          },
        },
      },
    },
  });

  if (!data) {
    return notFound();
  }

  return data;
}

export type AdminLessonType = Awaited<ReturnType<typeof adminGetLesson>>;
