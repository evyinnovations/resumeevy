import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  title:          z.string().min(1).max(200).optional(),
  profileName:    z.string().max(100).optional(),
  templateId:     z.string().max(100).optional(),
  personalInfo:   z.string().max(5000).optional(),
  summary:        z.string().max(2000).nullable().optional(),
  experience:     z.string().max(50000).optional(),
  education:      z.string().max(20000).optional(),
  skills:         z.string().max(20000).optional(),
  projects:       z.string().max(20000).optional(),
  certifications: z.string().max(10000).optional(),
  customSections: z.string().max(20000).optional(),
});

// GET /api/resumes/[id]
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const resume = await prisma.resume.findFirst({
    where: { id, userId: session.user.id },
    include: {
      versions: {
        select: { id: true, title: true, createdAt: true, atsScore: true, atsScoreAfter: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!resume) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ resume });
}

// PUT /api/resumes/[id]
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    let body: unknown;
    try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });

    const resume = await prisma.resume.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!resume) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const updated = await prisma.resume.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json({ resume: updated });
  } catch (error) {
    console.error("Update resume error:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

// DELETE /api/resumes/[id]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const resume = await prisma.resume.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!resume) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.resume.delete({ where: { id } });
  return NextResponse.json({ message: "Deleted" });
}
