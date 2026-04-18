import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardOverview } from "@/components/dashboard/overview";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const [resumes, usage, subscription] = await Promise.all([
    prisma.resume.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        profileName: true,
        templateId: true,
        status: true,
        atsScore: true,
        atsScoreAfter: true,
        updatedAt: true,
        isOriginal: true,
      },
    }),
    prisma.usageStats.findUnique({ where: { userId: session.user.id } }),
    prisma.subscription.findUnique({ where: { userId: session.user.id } }),
  ]);

  const tailorJobsCount = await prisma.tailorJob.count({
    where: { userId: session.user.id },
  });

  return (
    <DashboardOverview
      user={session.user}
      resumes={resumes}
      usage={usage}
      subscription={subscription}
      tailorJobsCount={tailorJobsCount}
    />
  );
}
