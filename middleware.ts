import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req: NextRequest & { auth: unknown }) => {
  const response = NextResponse.next();
  response.headers.set("x-pathname", req.nextUrl.pathname);
  return response;
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|public|.*\\.png|.*\\.svg|.*\\.ico).*)",
  ],
};
