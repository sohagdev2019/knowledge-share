import { z } from "zod";

export const courseLevels = ["Beginner", "Intermediate", "Advanced"] as const;

export const courseStatus = ["Draft", "Published", "Archived"] as const;

export const courseCategories = [
  "Business",
  "Design",
  "Development",
  "IT & Software",
  "Photography",
  "Marketing",
  "Health & Fitness",
  "Music",
  "Teaching & Academics",
] as const;

export const courseSchema = z.object({
  title: z
    .string()
    .min(3, { message: "Title must be at least 3 characters long" })
    .max(100, { message: "Title must be at most 100 characters long" }),
  description: z
    .string()
    .min(3, { message: "Description must be at least 3 characters long" }),

  fileKey: z.string().min(1, { message: "File is required" }),

  price: z.coerce
    .number()
    .min(1, { message: "Price must be a positive number" }),

  duration: z.coerce
    .number()
    .min(1, { message: "Duration must be at least 1 hour" })
    .max(500, { message: "Duration must be at most 500 hours" }),

  level: z.enum(courseLevels, {
    message: "Level is required",
  }),
  category: z.enum(courseCategories, {
    message: "Category is required",
  }),
  smallDescription: z
    .string()
    .min(3, { message: "Small Description must be at least 3 characters long" })
    .max(200, {
      message: "Small Description must be at most 200 characters long",
    }),

  slug: z
    .string()
    .min(3, { message: "Slug must be at least 3 characters long" }),

  status: z.enum(courseStatus, {
    message: "Status is required",
  }),
  availableInSubscription: z.boolean().default(false),
});

export type CourseSchemaType = z.infer<typeof courseSchema>;

// Blog Schemas
export const blogSchema = z.object({
  title: z
    .string()
    .min(3, { message: "Title must be at least 3 characters long" })
    .max(200, { message: "Title must be at most 200 characters long" }),
  content: z
    .string()
    .min(10, { message: "Content must be at least 10 characters long" }),
  excerpt: z
    .string()
    .max(500, { message: "Excerpt must be at most 500 characters long" })
    .optional(),
  coverImageKey: z.string().optional(),
  seoTitle: z.string().max(60).optional(),
  seoDescription: z.string().max(160).optional(),
  categoryId: z.string().optional(),
  tags: z.array(z.string()),
  isDraft: z.boolean(),
  courseId: z.string().optional(),
});

export type BlogSchemaType = z.infer<typeof blogSchema>;

// Chapter Schemas
export const chapterStatus = ["Draft", "Scheduled", "Published"] as const;

export const chapterSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Name must be at least 3 characters long" })
    .max(100, { message: "Name must be at most 100 characters long" }),
  courseId: z.string().uuid({ message: "Course ID is required" }),
  status: z.enum(chapterStatus, {
    message: "Status is required",
  }).optional(),
  releaseAt: z.string().optional(),
});

export type ChapterSchemaType = z.infer<typeof chapterSchema>;

// Lesson Schemas
export const lessonStatus = ["Draft", "Scheduled", "Published"] as const;

const assignmentSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  fileKey: z.string().optional(),
  points: z.coerce.number().min(0).optional(),
  dueDate: z.string().optional(),
});

const quizQuestionSchema = z.object({
  question: z.string().min(1, { message: "Question is required" }),
  options: z.array(z.string()).length(4, { message: "Must have exactly 4 options" }),
  correctAnswer: z.number().min(0).max(3, { message: "Correct answer must be between 0 and 3" }),
});

const quizSchema = z.object({
  title: z.string().optional(),
  points: z.coerce.number().min(0).default(10).optional(),
  required: z.boolean().default(true).optional(),
  questions: z.array(quizQuestionSchema).optional(),
});

export const lessonSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Name must be at least 3 characters long" })
    .max(100, { message: "Name must be at most 100 characters long" }),
  courseId: z.string().uuid({ message: "Course ID is required" }),
  chapterId: z.string().uuid({ message: "Chapter ID is required" }),
  description: z.string().optional(),
  videoKey: z.string().optional(),
  thumbnailKey: z.string().optional(),
  status: z.enum(lessonStatus, {
    message: "Status is required",
  }).optional(),
  releaseAt: z.string().optional(),
  assignment: assignmentSchema.optional(),
  quiz: quizSchema.optional(),
});

export type LessonSchemaType = z.infer<typeof lessonSchema>;

// Assignment Submission Schema
export const assignmentSubmissionSchema = z.object({
  assignmentId: z.string().uuid({ message: "Assignment ID is required" }),
  fileKey: z.string().optional(),
  link: z.string().optional(),
  description: z.string().optional(),
});

export type AssignmentSubmissionSchemaType = z.infer<typeof assignmentSubmissionSchema>;
