import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ResumeBuilder } from "@/components/resume/resume-builder";

export default async function BuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const { id } = await params;
  const isNew = id === "new";

  if (isNew) {
    return (
      <ResumeBuilder
        resume={null}
        userId={session.user.id}
      />
    );
  }

  const resume = await prisma.resume.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!resume) notFound();

  const toArray = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);

  return (
    <ResumeBuilder
      resume={{
        id: resume.id,
        title: resume.title,
        templateId: resume.templateId,
        personalInfo: (resume.personalInfo && typeof resume.personalInfo === "object" && !Array.isArray(resume.personalInfo)
          ? resume.personalInfo
          : {}) as Record<string, string>,
        summary: resume.summary || "",
        experience: toArray(resume.experience),
        education: toArray(resume.education),
        skills: toArray(resume.skills),
        projects: toArray(resume.projects),
        certifications: toArray(resume.certifications),
        atsScore: resume.atsScore,
      }}
      userId={session.user.id}
    />
  );
}
