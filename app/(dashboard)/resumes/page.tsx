import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ResumesList } from "@/components/dashboard/resumes-list";

export default async function ResumesPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const [resumes, subscription] = await Promise.all([
    prisma.resume.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
      include: { _count: { select: { versions: true } } },
    }),
    prisma.subscription.findUnique({ where: { userId: session.user.id } }),
  ]);

  return <ResumesList resumes={resumes} subscription={subscription} />;
}
