import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const createSchema = z.object({
  title: z.string().min(1).max(200),
  profileName: z.string().optional(),
  templateId: z.string().default("modern-minimal"),
  personalInfo: z.record(z.string()).default({}),
  summary: z.string().optional(),
  experience: z.array(z.unknown()).default([]),
  education: z.array(z.unknown()).default([]),
  skills: z.array(z.unknown()).default([]),
  projects: z.array(z.unknown()).default([]),
  certifications: z.array(z.unknown()).default([]),
  languages: z.array(z.unknown()).default([]),
});

// GET /api/resumes — list all resumes for user
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const resumes = await prisma.resume.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      profileName: true,
      templateId: true,
      status: true,
      atsScore: true,
      atsScoreAfter: true,
      isOriginal: true,
      parentId: true,
      updatedAt: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ resumes });
}

// POST /api/resumes — create new resume
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // Check plan limits
    const [usage, subscription] = await Promise.all([
      prisma.usageStats.findUnique({ where: { userId: session.user.id } }),
      prisma.subscription.findUnique({ where: { userId: session.user.id } }),
    ]);

    const isFreePlan = !subscription || subscription.plan === "FREE";
    if (isFreePlan && (usage?.resumesCreated ?? 0) >= 1) {
      return NextResponse.json(
        { error: "Free plan limit reached. Upgrade to create more resumes." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const resume = await prisma.resume.create({
      data: {
        userId: session.user.id,
        title: parsed.data.title,
        profileName: parsed.data.profileName,
        templateId: parsed.data.templateId,
        summary: parsed.data.summary,
        personalInfo: JSON.stringify(parsed.data.personalInfo),
        experience: JSON.stringify(parsed.data.experience),
        education: JSON.stringify(parsed.data.education),
        skills: JSON.stringify(parsed.data.skills),
        projects: JSON.stringify(parsed.data.projects),
        certifications: JSON.stringify(parsed.data.certifications),
        languages: JSON.stringify(parsed.data.languages),
      },
    });

    // Increment usage
    await prisma.usageStats.upsert({
      where: { userId: session.user.id },
      update: { resumesCreated: { increment: 1 } },
      create: { userId: session.user.id, resumesCreated: 1 },
    });

    return NextResponse.json({ id: resume.id, resume }, { status: 201 });
  } catch (error) {
    console.error("Create resume error:", error);
    return NextResponse.json({ error: "Failed to create resume" }, { status: 500 });
  }
}
