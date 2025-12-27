import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

// Helper to validate URL or empty string
const urlOrEmpty = z.union([
  z.string().url(),
  z.literal(""),
  z.undefined(),
]);

// Helper to validate email or empty string
const emailOrEmpty = z.union([
  z.string().email(),
  z.literal(""),
  z.undefined(),
]);

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url({
      message: "DATABASE_URL must be a valid URL. Please check your .env.local file.",
    }),
    NEXTAUTH_SECRET: z.string().min(1, {
      message: "NEXTAUTH_SECRET must be set and cannot be empty. Please check your .env.local file.",
    }),
    NEXTAUTH_URL: urlOrEmpty.optional(),
    AUTH_GITHUB_CLIENT_ID: z.string().optional(),
    AUTH_GITHUB_SECRET: z.string().optional(),
    AUTH_GOOGLE_CLIENT_ID: z.string().optional(),
    AUTH_GOOGLE_CLIENT_SECRET: z.string().optional(),
    BREVO_API_KEY: z.string().optional(),
    BREVO_SENDER_EMAIL: emailOrEmpty.optional(), // Required: Must be a verified sender email in Brevo
    BREVO_SENDER_NAME: z.string().optional(),
    ARCJET_KEY: z.string().optional(),
    AWS_ACCESS_KEY_ID: z.string().optional(),
    AWS_SECRET_ACCESS_KEY: z.string().optional(),
    AWS_ENDPOINT_URL_S3: z.string().optional(),
    AWS_ENDPOINT_URL_IAM: z.string().optional(),
    AWS_REGION: z.string().optional(),
    STRIPE_SECRET_KEY: z.string().optional(),
    STRIPE_WEBHOOK_SECRET: z.string().optional(),
    // Stripe Price IDs for subscription plans (webhook-only approach)
    STRIPE_PRICE_PERSONAL_MONTHLY: z.string().optional(),
    STRIPE_PRICE_PERSONAL_YEARLY: z.string().optional(),
    STRIPE_PRICE_TEAM_MONTHLY: z.string().optional(),
    STRIPE_PRICE_TEAM_YEARLY: z.string().optional(),
    STRIPE_PRICE_ENTERPRISE_MONTHLY: z.string().optional(),
    STRIPE_PRICE_ENTERPRISE_YEARLY: z.string().optional(),
    OPENAI_API_KEY: z.string().optional(),
  },

  client: {
    NEXT_PUBLIC_S3_BUCKET_NAME_IMAGES: z.string().optional(),
  },

  // For Next.js >= 13.4.4, you only need to destructure client variables:
  experimental__runtimeEnv: {
    NEXT_PUBLIC_S3_BUCKET_NAME_IMAGES:
      process.env.NEXT_PUBLIC_S3_BUCKET_NAME_IMAGES,
  },
  
  // Skip validation during build if we're in a CI/CD environment or if certain vars are missing
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
