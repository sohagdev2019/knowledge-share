import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./db";
import { env } from "./env";
import { emailOTP } from "better-auth/plugins";
import { getBrevoClient, SendSmtpEmail } from "./brevo";
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
        if (!env.BREVO_API_KEY) {
          console.log(`[DEV] OTP for ${email}: ${otp}`);
          throw new Error("Email service not configured. Please set BREVO_API_KEY environment variable.");
        }
        
        try {
          const brevoClient = getBrevoClient();
          const sendSmtpEmail = new SendSmtpEmail();
          
          // Use environment variable for sender email - MUST be verified in Brevo
          const senderEmail = env.BREVO_SENDER_EMAIL;
          const senderName = env.BREVO_SENDER_NAME || "KnowledgeShare";
          
          if (!senderEmail) {
            throw new Error("BREVO_SENDER_EMAIL is required. Please set it in your environment variables with a verified sender email from your Brevo account.");
          }
          
          sendSmtpEmail.subject = "KnowledgeShare - Verify your email";
          sendSmtpEmail.htmlContent = `<p>Your OTP is <strong>${otp}</strong></p>`;
          sendSmtpEmail.sender = { name: senderName, email: senderEmail };
          sendSmtpEmail.to = [{ email }];
          
          await brevoClient.sendTransacEmail(sendSmtpEmail);
        } catch (error: any) {
          console.error("=== Brevo Email Error ===");
          console.error("Error message:", error.message);
          console.error("Error code:", error.code);
          
          // Log response body if available
          if (error.response?.body) {
            console.error("Response body:", JSON.stringify(error.response.body, null, 2));
          }
          
          // Log error body if available (Brevo SDK format)
          if (error.body) {
            console.error("Error body:", JSON.stringify(error.body, null, 2));
          }
          
          // Log full error object for debugging
          console.error("Full error:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
          
          // Provide helpful error message based on error code
          if (error.code === "INVALID_ORIGIN" || error.body?.code === "INVALID_ORIGIN") {
            throw new Error(
              "INVALID_ORIGIN error: This usually means:\n" +
              "1. Your server's IP address is not authorized in Brevo. Go to Settings > Security > Authorized IPs and add your server's IP.\n" +
              "2. The sender email is not verified. Go to Settings > Senders & Domains and verify your sender email.\n" +
              "3. Your domain is not authenticated. Verify your domain in Brevo settings."
            );
          }
          
          throw new Error(`Failed to send email: ${error.message || error.body?.message || "Unknown error"}`);
        }
      },
    }),
    admin(),
  ],
});
