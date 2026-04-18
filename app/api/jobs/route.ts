import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const jobs = await prisma.tailorJob.findMany({
    where: { userId: session.user.id, status: "completed" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, jobTitle: true, company: true, applicationStatus: true,
      atsScoreBefore: true, atsScoreAfter: true, keywordMatchPct: true,
      extractedSkills: true, missingKeywords: true, notes: true,
      coverLetter: true, createdAt: true, tailoredResumeId: true,
    },
  });

  return NextResponse.json({ jobs });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, applicationStatus, notes } = await req.json();
  if (!id) return NextResponse.json({ error: "Job ID required" }, { status: 400 });

  const job = await prisma.tailorJob.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.tailorJob.update({
    where: { id },
    data: {
      ...(applicationStatus ? { applicationStatus } : {}),
      ...(notes !== undefined ? { notes } : {}),
    },
  });

  return NextResponse.json({ job: updated });
}
