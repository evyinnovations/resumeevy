import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TailorEngine } from "@/components/resume/tailor-engine";

export default async function TailorPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const [resumes, subscription] = await Promise.all([
    prisma.resume.findMany({
      where: { userId: session.user.id, isOriginal: true },
      orderBy: { updatedAt: "desc" },
      select: { id: true, title: true, profileName: true, atsScore: true },
    }),
    prisma.subscription.findUnique({ where: { userId: session.user.id } }),
  ]);

  const thisMonthCount = await prisma.tailorJob.count({
    where: {
      userId: session.user.id,
      createdAt: { gte: new Date(new Date().setDate(1)) },
    },
  });

  return (
    <TailorEngine
      resumes={resumes}
      subscription={subscription}
      thisMonthCount={thisMonthCount}
    />
  );
}
