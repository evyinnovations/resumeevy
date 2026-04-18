import { auth } from "@/lib/auth";
import { EmailTemplates } from "@/components/dashboard/email-templates";

interface PageProps {
  searchParams: Promise<{ jobTitle?: string; company?: string }>;
}

export default async function EmailTemplatesPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) return null;
  const params = await searchParams;

  return (
    <EmailTemplates
      defaultJobTitle={params.jobTitle || ""}
      defaultCompany={params.company || ""}
      userName={session.user.name || ""}
    />
  );
}
