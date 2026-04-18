import { ResumeBuilder } from "@/components/resume/resume-builder";
import { auth } from "@/lib/auth";

export default async function NewBuilderPage() {
  const session = await auth();
  return <ResumeBuilder resume={null} userId={session?.user?.id || ""} />;
}
