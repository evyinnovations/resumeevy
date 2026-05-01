import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ResumeBuilder } from "@/components/resume/resume-builder";

export default async function BuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const { id } = await params;
  const isNew = id === "new";

  const [subscription] = await Promise.all([
    prisma.subscription.findUnique({
      where: { userId: session.user.id },
      select: { plan: true, status: true },
    }),
  ]);

  if (isNew) {
    return (
      <ResumeBuilder
        resume={null}
        userId={session.user.id}
        subscription={subscription}
      />
    );
  }

  const resume = await prisma.resume.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!resume) notFound();

  const safeParse = <T,>(v: unknown, fallback: T): T => {
    if (typeof v === "string") {
      try { return JSON.parse(v) as T; } catch { return fallback; }
    }
    return (v as T) ?? fallback;
  };
  const toArray = (v: unknown): unknown[] => {
    const parsed = safeParse<unknown>(v, []);
    return Array.isArray(parsed) ? parsed : [];
  };
  const toObject = (v: unknown): Record<string, string> => {
    const parsed = safeParse<unknown>(v, {});
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, string>)
      : {};
  };

  return (
    <ResumeBuilder
      resume={{
        id: resume.id,
        title: resume.title,
        templateId: resume.templateId,
        personalInfo: toObject(resume.personalInfo),
        summary: resume.summary || "",
        experience: toArray(resume.experience),
        education: toArray(resume.education),
        skills: toArray(resume.skills),
        projects: toArray(resume.projects),
        certifications: toArray(resume.certifications),
        atsScore: resume.atsScore,
      }}
      userId={session.user.id}
      subscription={subscription}
    />
  );
}
