import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BillingDashboard } from "@/components/dashboard/billing-dashboard";

interface PageProps {
  searchParams: Promise<{ success?: string; canceled?: string }>;
}

export default async function BillingPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const [subscription, params] = await Promise.all([
    prisma.subscription.findUnique({ where: { userId: session.user.id } }),
    searchParams,
  ]);

  return (
    <BillingDashboard
      subscription={subscription}
      user={session.user}
      successParam={params.success === "1"}
      canceledParam={params.canceled === "1"}
    />
  );
}
