import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { authConfig } from "@/auth.config";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    updateAge: 2 * 60, // re-check DB every 2 minutes of activity
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        // New sign-in: increment sessionVersion to boot all other active sessions
        const updated = await prisma.user.update({
          where: { id: user.id! },
          data: { sessionVersion: { increment: 1 } },
          select: { sessionVersion: true, role: true },
        });
        token.id = user.id;
        token.role = updated.role;
        token.sessionVersion = updated.sessionVersion;
      } else if (token.id) {
        // Token refresh (every 2 min): verify this session is still the latest
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { sessionVersion: true, role: true },
        });
        // If version mismatch, someone else logged in — invalidate this session
        if (!dbUser || dbUser.sessionVersion !== (token.sessionVersion as number)) {
          return null;
        }
        token.role = dbUser.role;
      }
      if (trigger === "update" && session) {
        token.name = session.name;
        token.image = session.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      // Create usage stats for new user
      await prisma.usageStats.create({
        data: { userId: user.id! },
      });
      // Create free subscription record
      const stripeCustomerId = `free_${user.id}`;
      await prisma.subscription.create({
        data: {
          userId: user.id!,
          stripeCustomerId,
          plan: "FREE",
          status: "ACTIVE",
        },
      });
    },
  },
});

export type AuthSession = {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
  };
};
