import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { DownloadsPage } from "@/components/dashboard/downloads-page";

export default async function Downloads() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const resumes = await prisma.resume.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true, title: true, isOriginal: true, atsScore: true,
      atsScoreAfter: true, createdAt: true, updatedAt: true,
    },
  });

  return <DownloadsPage resumes={resumes} />;
}
