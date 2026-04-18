import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { generateResumeFromScratch, type ExperienceLevel } from "@/lib/openai";
import { z } from "zod";

export const runtime = "nodejs";
export const maxDuration = 120;

const schema = z.object({
  personalInfo: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(7),
    location: z.string().min(2),
    linkedin: z.string().optional(),
    github: z.string().optional(),
  }),
  targetRole: z.string().min(2),
  experienceLevel: z.enum(["fresher", "junior", "mid", "senior", "lead"]),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.GEMINI_API_KEY?.trim()) {
    return NextResponse.json(
      { error: "Gemini API key is not configured." },
      { status: 503 }
    );
  }

  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { personalInfo, targetRole, experienceLevel } = parsed.data;

    const resumeData = await generateResumeFromScratch({
      personalInfo,
      targetRole,
      experienceLevel: experienceLevel as ExperienceLevel,
    });

    const resume = await prisma.resume.create({
      data: {
        userId: session.user.id,
        title: `${personalInfo.name} — ${targetRole}`,
        isOriginal: true,
        personalInfo: JSON.stringify(resumeData.personalInfo),
        summary: resumeData.summary || null,
        experience: JSON.stringify(resumeData.experience),
        education: JSON.stringify(resumeData.education),
        skills: JSON.stringify(resumeData.skills),
        projects: JSON.stringify(resumeData.projects),
        certifications: JSON.stringify(resumeData.certifications || []),
      },
    });

    await prisma.usageStats.upsert({
      where: { userId: session.user.id },
      update: { resumesCreated: { increment: 1 } },
      create: { userId: session.user.id, resumesCreated: 1 },
    });

    return NextResponse.json({ resumeId: resume.id, resume });
  } catch (error) {
    console.error("Generate resume error:", error);
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: `Failed to generate resume: ${msg}` }, { status: 500 });
  }
}
