import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import crypto from "crypto";

const schema = z.object({ email: z.string().email().toLowerCase() });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid email" }, { status: 400 });

    const { email } = parsed.data;

    // Always return 200 to prevent email enumeration — constant time response
    const startTime = Date.now();
    const user = await prisma.user.findUnique({ where: { email } });

    const respond = async () => {
      // Ensure minimum 200ms response time to prevent timing attacks
      const elapsed = Date.now() - startTime;
      if (elapsed < 200) await new Promise((r) => setTimeout(r, 200 - elapsed));
      return NextResponse.json({ message: "If that email exists, a reset link was sent." });
    };

    if (!user) return respond();

    // Delete existing tokens
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

    const token = crypto.randomBytes(32).toString("hex");
    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    });

    await sendPasswordResetEmail(email, user.name || "User", token);

    return respond();
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
