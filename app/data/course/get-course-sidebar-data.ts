import "server-only";
import { requireUser } from "../user/require-user";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";

export async function getCourseSidebarData(slug: string) {
  const session = await requireUser();

  const course = await prisma.course.findUnique({
    where: {
      slug: slug,
    },
    select: {
      id: true,
      title: true,
      fileKey: true,
      duration: true,
      level: true,
      category: true,
      slug: true,
      chapter: {
        orderBy: {
          position: "asc",
        },
        select: {
          id: true,
          title: true,
          position: true,
          releaseAt: true,
          lessons: {
            // Students should not see draft lessons; only Scheduled or Published
            where: {
              status: {
                in: ["Scheduled", "Published"],
              },
            },
            orderBy: {
              position: "asc",
            },
            select: {
              id: true,
              title: true,
              position: true,
              description: true,
              status: true,
              releaseAt: true,
              lessonProgress: {
                where: {
                  userId: session.id,
                },
                select: {
                  completed: true,
                  lessonId: true,
                  id: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!course) {
    return notFound();
  }
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: session.id,
        courseId: course.id,
      },
    },
  });

  if (!enrollment || enrollment.status !== "Active") {
    return notFound();
  }

  // Get user's points and early unlocks
  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { 
      points: true,
      earlyUnlocks: {
        select: {
          chapterId: true,
          lessonId: true,
        },
      },
    },
  });

  const earlyUnlockedChapterIds = new Set(
    (user?.earlyUnlocks || [])
      .map((eu) => eu.chapterId)
      .filter((id): id is string => !!id)
  );
  const earlyUnlockedLessonIds = new Set(
    (user?.earlyUnlocks || [])
      .map((eu) => eu.lessonId)
      .filter((id): id is string => !!id)
  );

  // Get all lesson progress for the user
  const allLessonProgress = await prisma.lessonProgress.findMany({
    where: {
      userId: session.id,
      lessonId: {
        in: course.chapter.flatMap((ch) => ch.lessons.map((l) => l.id)),
      },
      completed: true,
    },
    select: {
      lessonId: true,
    },
  });

  const completedLessonIds = new Set(allLessonProgress.map((lp) => lp.lessonId));

  // Get all assignments and their submissions for the user
  const allLessonsWithAssignments = await prisma.lesson.findMany({
    where: {
      Chapter: {
        courseId: course.id,
      },
      assignment: {
        isNot: null,
      },
    },
    select: {
      id: true,
      assignment: {
        select: {
          submissions: {
            where: { userId: session.id },
            select: { id: true },
            take: 1,
          },
        },
      },
    },
  });

  // Create a map of lessons that have assignments and whether they're submitted
  const assignmentSubmissionMap = new Map<string, boolean>();
  allLessonsWithAssignments.forEach((lesson) => {
    const hasSubmission = lesson.assignment?.submissions && lesson.assignment.submissions.length > 0;
    assignmentSubmissionMap.set(lesson.id, !!hasSubmission);
  });

  // Get all lessons with quizzes and their submissions
  const allLessonsWithQuizzes = await prisma.lesson.findMany({
    where: {
      Chapter: {
        courseId: course.id,
      },
      quiz: {
        isNot: null,
      },
    },
    select: {
      id: true,
      quiz: {
        select: {
          id: true,
          required: true,
          submissions: {
            where: { userId: session.id },
            select: { score: true },
            take: 1,
          },
        },
      },
    },
  });

  // Create a map of lessons that have quizzes and whether they're completed (passed with >= 70% if required)
  const quizCompletionMap = new Map<string, boolean>();
  allLessonsWithQuizzes.forEach((lesson) => {
    if (lesson.quiz) {
      const hasSubmission = lesson.quiz.submissions && lesson.quiz.submissions.length > 0;
      if (lesson.quiz.required) {
        // Required quiz must be passed (score >= 70%)
        const passed = hasSubmission && lesson.quiz.submissions[0].score >= 70;
        quizCompletionMap.set(lesson.id, passed);
      } else {
        // Optional quiz just needs to be submitted
        quizCompletionMap.set(lesson.id, hasSubmission);
      }
    }
  });

  // Mark lessons as locked/unlocked based on previous lesson completion
  const courseWithLocks = {
    ...course,
      chapter: course.chapter.map((chapter, chapterIndex) => {
      let previousChapterAllCompleted = true;
      
      // Check if all previous chapters are completed AND assignments submitted
      if (chapterIndex > 0) {
        for (let i = 0; i < chapterIndex; i++) {
          const prevChapter = course.chapter[i];
          const allPrevLessonsCompleted = prevChapter.lessons.every((l) => {
            const isCompleted = completedLessonIds.has(l.id);
            const hasAssignment = assignmentSubmissionMap.has(l.id);
            const assignmentSubmitted = hasAssignment 
              ? assignmentSubmissionMap.get(l.id) 
              : true; // If no assignment, consider it "submitted"
            const hasQuiz = quizCompletionMap.has(l.id);
            const quizCompleted = hasQuiz 
              ? quizCompletionMap.get(l.id) 
              : true; // If no quiz, consider it "completed"
            return isCompleted && (!hasAssignment || assignmentSubmitted) && (!hasQuiz || quizCompleted);
          });
          if (!allPrevLessonsCompleted) {
            previousChapterAllCompleted = false;
            break;
          }
        }
      }

      // Check if chapter is released (releaseAt is null or in the past)
      // Or if user has unlocked it early
      const isChapterReleased =
        !chapter.releaseAt || new Date(chapter.releaseAt) <= new Date();
      const isEarlyUnlocked = earlyUnlockedChapterIds.has(chapter.id);
      const isChapterAccessible = isChapterReleased || isEarlyUnlocked;

      return {
        ...chapter,
        locked: !previousChapterAllCompleted,
        releaseAt: chapter.releaseAt,
        isEarlyUnlocked,
        lessons: chapter.lessons.map((lesson, lessonIndex) => {
          // First lesson of first chapter is always unlocked at progression level
          let progressionLocked = false;
          if (chapterIndex === 0 && lessonIndex === 0) {
            progressionLocked = false;
          } else if (lessonIndex > 0) {
            // Check if previous lesson in same chapter is completed AND assignment submitted
            const previousLesson = chapter.lessons[lessonIndex - 1];
            const isPreviousCompleted = completedLessonIds.has(previousLesson.id);
            const previousHasAssignment = assignmentSubmissionMap.has(previousLesson.id);
            const previousAssignmentSubmitted = previousHasAssignment 
              ? assignmentSubmissionMap.get(previousLesson.id) 
              : true; // If no assignment, consider it "submitted"
            const previousHasQuiz = quizCompletionMap.has(previousLesson.id);
            const previousQuizCompleted = previousHasQuiz 
              ? quizCompletionMap.get(previousLesson.id) 
              : true; // If no quiz, consider it "completed"
            
            // Lesson is locked if previous is not completed OR if previous has assignment that's not submitted OR if previous has quiz that's not completed
            progressionLocked =
              !isPreviousCompleted ||
              (previousHasAssignment && !previousAssignmentSubmitted) ||
              (previousHasQuiz && !previousQuizCompleted);
          } else if (chapterIndex > 0) {
            // First lesson of a chapter - check if last lesson of previous chapter is completed AND assignment submitted
            const previousChapter = course.chapter[chapterIndex - 1];
            const lastLessonOfPrevChapter =
              previousChapter.lessons[previousChapter.lessons.length - 1];

            // If previous chapter has no lessons, don't lock based on it
            if (!lastLessonOfPrevChapter) {
              progressionLocked = false;
            } else {
              const isLastLessonCompleted = completedLessonIds.has(
                lastLessonOfPrevChapter.id
              );
              const lastLessonHasAssignment = assignmentSubmissionMap.has(
                lastLessonOfPrevChapter.id
              );
              const lastLessonAssignmentSubmitted = lastLessonHasAssignment
                ? assignmentSubmissionMap.get(lastLessonOfPrevChapter.id)
                : true;
              const lastLessonHasQuiz = quizCompletionMap.has(lastLessonOfPrevChapter.id);
              const lastLessonQuizCompleted = lastLessonHasQuiz 
                ? quizCompletionMap.get(lastLessonOfPrevChapter.id) 
                : true;

              progressionLocked =
                !isLastLessonCompleted ||
                (lastLessonHasAssignment && !lastLessonAssignmentSubmitted) ||
                (lastLessonHasQuiz && !lastLessonQuizCompleted);
            }
          }

          // Check time-based lock (schedule time)
          const isLessonReleased =
            !lesson.releaseAt || new Date(lesson.releaseAt) <= new Date();
          const isLessonEarlyUnlocked = earlyUnlockedLessonIds.has(lesson.id);
          const isTimeLocked = !!lesson.releaseAt && !isLessonReleased && !isLessonEarlyUnlocked;

          // Lesson is locked if progression-locked OR time-locked
          const isLocked = progressionLocked || isTimeLocked;

          return {
            ...lesson,
            locked: isLocked,
            isEarlyUnlocked: isLessonEarlyUnlocked,
            isTimeLocked: isTimeLocked,
          };
        }),
      };
    }),
  };

  return {
    course: courseWithLocks,
    userPoints: user?.points || 0,
  };
}

export type CourseSidebarDataType = Awaited<
  ReturnType<typeof getCourseSidebarData>
>;
