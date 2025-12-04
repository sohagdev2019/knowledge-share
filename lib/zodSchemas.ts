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
  tags: z.array(z.string()).default([]),
  isDraft: z.boolean().default(false),
  courseId: z.string().optional(),
});

export type BlogSchemaType = z.infer<typeof blogSchema>;
