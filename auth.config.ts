import type { NextAuthConfig } from "next-auth";

// Edge-compatible auth config used ONLY by middleware (no Prisma adapter)
export const authConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = (user as { role?: string }).role;
      return token;
    },
    async session({ session, token }) {
      if (token) (session.user as { role?: string }).role = token.role as string;
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const pathname = nextUrl.pathname;

      const protectedPaths = [
        "/dashboard", "/resumes", "/tailor", "/builder",
        "/templates", "/billing", "/settings", "/profile", "/downloads",
        "/job-tracker", "/email-templates",
      ];
      const adminPaths = ["/admin"];
      const authPaths = ["/login", "/register", "/forgot-password", "/reset-password"];

      const isProtected = protectedPaths.some((p) => pathname.startsWith(p));
      const isAdmin = adminPaths.some((p) => pathname.startsWith(p));
      const isAuthRoute = authPaths.some((p) => pathname.startsWith(p));

      if (isProtected && !isLoggedIn) {
        const callbackUrl = encodeURIComponent(pathname);
        return Response.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, nextUrl));
      }

      if (isAdmin) {
        if (!isLoggedIn) {
          return Response.redirect(new URL("/login", nextUrl));
        }
        const role = (auth?.user as { role?: string })?.role;
        if (role !== "ADMIN") {
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
      }

      if (isAuthRoute && isLoggedIn) {
        const plan = nextUrl.searchParams.get("plan");
        if (plan) {
          return Response.redirect(new URL(`/api/stripe/checkout-redirect?plan=${plan}`, nextUrl));
        }
        return Response.redirect(new URL("/dashboard", nextUrl));
      }

      return true;
    },
  },
  providers: [], // providers added in auth.ts with Prisma adapter
} satisfies NextAuthConfig;
