import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { JobTracker } from "@/components/dashboard/job-tracker";

export default async function JobTrackerPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

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

  return <JobTracker initialJobs={jobs} />;
}
