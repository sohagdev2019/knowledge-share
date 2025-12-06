import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./db";
import { env } from "./env";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  providers: [
    Credentials({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const normalizedEmail = (credentials.email as string).toLowerCase().trim();
        const password = credentials.password as string;

        // Check if this is a session token (UUID format)
        const isSessionToken = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(password);

        if (isSessionToken) {
          // Handle OTP-verified session token
          const verification = await prisma.verification.findUnique({
            where: { id: password },
          });

          if (!verification) {
            return null;
          }

          // Check if expired
          if (verification.expiresAt < new Date()) {
            // Clean up expired token
            await prisma.verification.delete({
              where: { id: password },
            }).catch(() => {}); // Ignore errors if already deleted
            return null;
          }

          let sessionData: { userId: string; email: string; type: string; verified?: boolean };
          try {
            sessionData = JSON.parse(verification.value);
          } catch {
            return null;
          }

          // Validate session data
          if (sessionData.type !== "session-token" || !sessionData.verified || sessionData.email !== normalizedEmail) {
            return null;
          }

          // Get user
          const user = await prisma.user.findUnique({
            where: { id: sessionData.userId },
          });

          if (!user) {
            return null;
          }

          // Delete session token after successful use
          await prisma.verification.delete({
            where: { id: password },
          }).catch(() => {}); // Ignore errors if already deleted

          // Return user object for JWT
          return {
            id: user.id,
            email: user.email,
            name: `${user.firstName} ${user.lastName || ""}`.trim() || user.email,
            image: user.image,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            role: user.role,
          };
        }

        // Regular password authentication
        // Find user by email or username
        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: normalizedEmail },
              { username: normalizedEmail },
            ],
          },
          include: {
            accounts: {
              where: {
                providerId: "credential",
              },
            },
          },
        });

        if (!user) {
          return null;
        }

        // Check if user has a credential account with password
        const credentialAccount = user.accounts.find(
          (acc) => acc.providerId === "credential" && acc.password
        );

        if (!credentialAccount || !credentialAccount.password) {
          return null;
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(
          password,
          credentialAccount.password
        );

        if (!isPasswordValid) {
          return null;
        }

        // Return user object for JWT
        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName || ""}`.trim() || user.email,
          image: user.image,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          role: user.role,
        };
      },
    }),
    ...(env.AUTH_GITHUB_CLIENT_ID && env.AUTH_GITHUB_SECRET
      ? [
          GitHub({
            clientId: env.AUTH_GITHUB_CLIENT_ID,
            clientSecret: env.AUTH_GITHUB_SECRET,
          }),
        ]
      : []),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.firstName = (user as any).firstName;
        token.lastName = (user as any).lastName;
        token.username = (user as any).username;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).firstName = token.firstName;
        (session.user as any).lastName = token.lastName;
        (session.user as any).username = token.username;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  secret: env.NEXTAUTH_SECRET,
});
