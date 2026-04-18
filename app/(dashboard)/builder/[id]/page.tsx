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

  return (
    <ResumeBuilder
      resume={{
        id: resume.id,
        title: resume.title,
        templateId: resume.templateId,
        personalInfo: resume.personalInfo as unknown as Record<string, string>,
        summary: resume.summary || "",
        experience: resume.experience as unknown as unknown[],
        education: resume.education as unknown as unknown[],
        skills: resume.skills as unknown as unknown[],
        projects: resume.projects as unknown as unknown[],
        certifications: resume.certifications as unknown as unknown[],
        atsScore: resume.atsScore,
      }}
      userId={session.user.id}
    />
  );
}
