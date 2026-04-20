import { ResumeBuilder } from "@/components/resume/resume-builder";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function NewBuilderPage() {
  const session = await auth();
  const userId = session?.user?.id || "";
  const subscription = userId
    ? await prisma.subscription.findUnique({ where: { userId }, select: { plan: true, status: true } })
    : null;
  return <ResumeBuilder resume={null} userId={userId} subscription={subscription} />;
}
