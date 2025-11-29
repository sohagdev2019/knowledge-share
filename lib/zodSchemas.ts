import { z } from "zod";

export const courseLevels = ["Beginner", "Intermediate", "Advanced"] as const;

export const courseStatus = ["Draft", "Published", "Archived"] as const;

export const chapterStatus = ["Draft", "Scheduled", "Published"] as const;

export const lessonStatus = ["Draft", "Scheduled", "Published"] as const;

export const courseCategories = [
  "Development",
  "Business",
  "Finance",
  "IT & Software",
  "Office Productivity",
  "Personal Development",
  "Design",
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
});

export const chapterSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Name must be at least 3 characters long" }),
  courseId: z.string().uuid({ message: "Invalid course id" }),
  status: z
    .enum(chapterStatus)
    .optional()
    .default("Draft"),
  releaseAt: z
    .string()
    .optional()
    .or(z.literal("")),
});

export const assignmentSchema = z.object({
  title: z.string().optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
  fileKey: z.string().optional().or(z.literal("")),
  points: z.coerce
    .number()
    .min(0, { message: "Points must be a positive number" })
    .max(1000, { message: "Points must be at most 1000" })
    .optional(),
  dueDate: z.string().optional().or(z.literal("")),
});

export const quizQuestionSchema = z.object({
  question: z.string().min(1, { message: "Question is required" }),
  options: z.array(z.string().min(1, { message: "Option cannot be empty" })).min(2, { message: "At least 2 options required" }).max(10, { message: "Maximum 10 options allowed" }),
  correctAnswer: z.coerce.number().min(0, { message: "Correct answer index is required" }),
});

export const quizSchema = z.object({
  title: z.string().optional().or(z.literal("")),
  points: z.coerce
    .number()
    .min(1, { message: "Points must be at least 1" })
    .max(1000, { message: "Points must be at most 1000" })
    .optional()
    .default(10),
  required: z.boolean().optional().default(true),
  questions: z.array(quizQuestionSchema).min(1, { message: "At least one question is required" }),
});

export const lessonSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Name must be at least 3 characters long" }),
  chapterId: z.string().uuid({ message: "Invalid chapter ID" }),
  courseId: z.string().uuid({ message: "Invalid course ID" }),
  description: z
    .string()
    .min(3, { message: "Description must be at least 3 characters long" })
    .optional(),

  videoKey: z.string().optional(),
  thumbnailKey: z.string().optional(),
  assignment: assignmentSchema.optional(),
  quiz: quizSchema.optional(),
  status: z
    .enum(lessonStatus)
    .optional()
    .default("Draft"),
  releaseAt: z
    .string()
    .optional()
    .or(z.literal("")),
});

export const assignmentSubmissionSchema = z.object({
  assignmentId: z.string().uuid({ message: "Invalid assignment ID" }),
  fileKey: z.string().optional().or(z.literal("")),
  link: z.string().url({ message: "Invalid URL format" }).optional().or(z.literal("")),
  description: z.string().max(5000, { message: "Description must be less than 5000 characters" }).optional().or(z.literal("")),
}).refine(
  (data) => data.fileKey || data.link || data.description,
  {
    message: "At least one of file, link, or description must be provided",
    path: ["fileKey"],
  }
);

export type CourseSchemaType = z.infer<typeof courseSchema>;
export type ChapterSchemaType = z.infer<typeof chapterSchema>;
export type LessonSchemaType = z.infer<typeof lessonSchema>;
export type AssignmentSchemaType = z.infer<typeof assignmentSchema>;
export type AssignmentSubmissionSchemaType = z.infer<typeof assignmentSubmissionSchema>;
export type QuizSchemaType = z.infer<typeof quizSchema>;
export type QuizQuestionSchemaType = z.infer<typeof quizQuestionSchema>;
