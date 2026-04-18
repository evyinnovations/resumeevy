import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { tailorResume, type ResumeData } from "@/lib/openai";
import { z } from "zod";

export const runtime = "nodejs";
export const maxDuration = 120;

const schema = z.object({
  resumeId: z.string(),
  jobTitle: z.string().min(1),
  company: z.string().optional(),
  jobDescription: z.string().min(50, "Job description too short"),
});

function safeJsonParse<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── Check Gemini key up front ──────────────────────────────────────────────
  if (!process.env.GEMINI_API_KEY?.trim()) {
    return NextResponse.json(
      { error: "Gemini API key is not configured. Add GEMINI_API_KEY to your .env.local and restart the dev server." },
      { status: 503 }
    );
  }

  let tailorJobId: string | null = null;

  try {
    // ── Check plan limits ────────────────────────────────────────────────────
    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });

    const isFreePlan = !subscription || subscription.plan === "FREE";
    const isActive = subscription && ["ACTIVE", "TRIALING"].includes(subscription.status?.toUpperCase() ?? "");

    // Monthly limit for free/inactive users
    if (isFreePlan || !isActive) {
      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);
      const count = await prisma.tailorJob.count({
        where: { userId: session.user.id, createdAt: { gte: thisMonth } },
      });
      if (count >= 3) {
        return NextResponse.json(
          { error: "Monthly limit reached. Upgrade to Pro for unlimited tailors." },
          { status: 403 }
        );
      }
    }

    // Burst rate limit: max 3 requests per 60 seconds per user
    const oneMinuteAgo = new Date(Date.now() - 60_000);
    const recentCount = await prisma.tailorJob.count({
      where: { userId: session.user.id, createdAt: { gte: oneMinuteAgo } },
    });
    if (recentCount >= 3) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment before trying again." },
        { status: 429 }
      );
    }

    // ── Validate request body ────────────────────────────────────────────────
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { resumeId, jobTitle, company, jobDescription } = parsed.data;

    // ── Load resume ──────────────────────────────────────────────────────────
    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId: session.user.id },
    });
    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    // ── Create tailor job record ─────────────────────────────────────────────
    const tailorJob = await prisma.tailorJob.create({
      data: {
        userId: session.user.id,
        resumeId: resume.id,
        jobTitle,
        company: company || "",
        jobDescription,
        status: "processing",
      },
    });
    tailorJobId = tailorJob.id;

    // ── Build resume data (guard against bad JSON in DB) ────────────────────
    const resumeData: ResumeData = {
      personalInfo: safeJsonParse(resume.personalInfo, { name: "", email: "" }),
      summary: resume.summary || undefined,
      experience: safeJsonParse(resume.experience, []),
      education: safeJsonParse(resume.education, []),
      skills: safeJsonParse(resume.skills, []),
      projects: safeJsonParse(resume.projects, []),
      certifications: safeJsonParse(resume.certifications, []),
    };

    // ── Call OpenAI ──────────────────────────────────────────────────────────
    let result;
    try {
      result = await tailorResume(resumeData, jobDescription, jobTitle);
    } catch (aiError: unknown) {
      // Mark tailor job as failed
      await prisma.tailorJob.update({
        where: { id: tailorJob.id },
        data: { status: "failed", error: String(aiError) },
      }).catch(() => {});

      // Surface the real OpenAI error
      const msg = aiError instanceof Error ? aiError.message : String(aiError);
      if (msg.includes("API_KEY_INVALID") || msg.includes("401") || msg.includes("invalid") || msg.includes("API key")) {
        return NextResponse.json({ error: "Invalid Gemini API key. Check your GEMINI_API_KEY in .env.local." }, { status: 503 });
      }
      if (msg.includes("429") || msg.includes("rate limit") || msg.includes("quota") || msg.includes("RESOURCE_EXHAUSTED")) {
        return NextResponse.json({ error: "Gemini rate limit exceeded. Please wait a moment and try again." }, { status: 503 });
      }
      if (msg.includes("model") && (msg.includes("not found") || msg.includes("does not exist"))) {
        return NextResponse.json({ error: `Model not found. Check your GEMINI_MODEL in .env.local.` }, { status: 503 });
      }
      if (msg.includes("JSON") || msg.includes("parse")) {
        return NextResponse.json({ error: "AI returned an unexpected response format. Please try again." }, { status: 500 });
      }
      return NextResponse.json({ error: `AI error: ${msg}` }, { status: 500 });
    }

    // ── Save tailored resume ─────────────────────────────────────────────────
    const tailoredResume = await prisma.resume.create({
      data: {
        userId: session.user.id,
        title: `${resume.title} — ${jobTitle}`,
        profileName: resume.profileName,
        templateId: resume.templateId,
        isOriginal: false,
        parentId: resume.id,
        atsScore: result.atsScoreBefore,
        atsScoreAfter: result.atsScoreAfter,
        personalInfo: JSON.stringify(result.tailoredResume.personalInfo),
        summary: result.tailoredResume.summary || null,
        experience: JSON.stringify(result.tailoredResume.experience),
        education: JSON.stringify(result.tailoredResume.education),
        skills: JSON.stringify(result.tailoredResume.skills),
        projects: JSON.stringify(result.tailoredResume.projects),
        certifications: JSON.stringify(result.tailoredResume.certifications || []),
      },
    });

    // ── Update tailor job ────────────────────────────────────────────────────
    await prisma.tailorJob.update({
      where: { id: tailorJob.id },
      data: {
        status: "completed",
        extractedSkills: JSON.stringify(result.extractedSkills || []),
        missingKeywords: JSON.stringify(result.missingKeywords || []),
        suggestions: JSON.stringify(result.suggestions || []),
        atsScoreBefore: result.atsScoreBefore,
        atsScoreAfter: result.atsScoreAfter,
        keywordMatchPct: result.keywordMatchPct,
        tailoredResumeId: tailoredResume.id,
        coverLetter: result.coverLetter || null,
        interviewQuestions: JSON.stringify(result.interviewQuestions || []),
        atsSimulation: result.atsSimulation ? JSON.stringify(result.atsSimulation) : null,
        gapClassification: result.gapClassification ? JSON.stringify(result.gapClassification) : null,
      },
    });

    // ── Update original resume ATS score ─────────────────────────────────────
    await prisma.resume.update({
      where: { id: resume.id },
      data: { atsScore: result.atsScoreBefore },
    });

    // ── Increment usage ───────────────────────────────────────────────────────
    await prisma.usageStats.upsert({
      where: { userId: session.user.id },
      update: { tailorJobsUsed: { increment: 1 } },
      create: { userId: session.user.id, tailorJobsUsed: 1 },
    });

    return NextResponse.json({
      result: {
        atsScoreBefore: result.atsScoreBefore,
        atsScoreAfter: result.atsScoreAfter,
        keywordMatchPct: result.keywordMatchPct,
        extractedSkills: result.extractedSkills,
        missingKeywords: result.missingKeywords,
        suggestions: result.suggestions,
        changes: result.changes,
        coverLetter: result.coverLetter || null,
        interviewQuestions: result.interviewQuestions || [],
        atsSimulation: result.atsSimulation || null,
        gapClassification: result.gapClassification || null,
      },
      tailoredResumeId: tailoredResume.id,
    });

  } catch (error: unknown) {
    console.error("Tailor route error:", error);

    // Mark job as failed if we have an ID
    if (tailorJobId) {
      await prisma.tailorJob.update({
        where: { id: tailorJobId },
        data: { status: "failed", error: String(error) },
      }).catch(() => {});
    }

    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: msg || "Tailoring failed. Please try again." },
      { status: 500 }
    );
  }
}
