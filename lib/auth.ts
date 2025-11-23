import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./db";
import { env } from "./env";
import { emailOTP } from "better-auth/plugins";
import { resend } from "./resend";
import { admin } from "better-auth/plugins";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql", // or "mysql", "postgresql", ...etc
  }),
  socialProviders: env.AUTH_GITHUB_CLIENT_ID && env.AUTH_GITHUB_SECRET ? {
    github: {
      clientId: env.AUTH_GITHUB_CLIENT_ID,
      clientSecret: env.AUTH_GITHUB_SECRET,
    },
  } : {},

  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp }) {
        if (!env.RESEND_API_KEY) {
          console.log(`[DEV] OTP for ${email}: ${otp}`);
          throw new Error("Email service not configured. Please set RESEND_API_KEY environment variable.");
        }
        
        await resend.emails.send({
          from: "KnowledgeShare <onboarding@resend.dev>",
          to: [email],
          subject: "KnowledgeShare - Verify your email",
          html: `<p>Your OTP is <strong>${otp}</strong></p>`,
        });
      },
    }),
    admin(),
  ],
});
