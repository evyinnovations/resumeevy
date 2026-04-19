import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardTopbar } from "@/components/dashboard/topbar";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";
  const isBillingPage = pathname === "/billing" || pathname.startsWith("/billing");

  if (!isBillingPage) {
    const subscription = await prisma.subscription.findUnique({
      where: { userId: (session.user as { id: string }).id },
    });

    const hasActivePlan = subscription && subscription.plan !== "FREE" &&
      ["ACTIVE", "TRIALING"].includes(subscription.status);

    const role = (session.user as { role?: string }).role;
    if (!hasActivePlan && role !== "ADMIN") redirect("/billing");
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <DashboardSidebar role={(session.user as { role?: string }).role} />
      <div className="flex-1 flex flex-col ml-0 lg:ml-64 transition-all duration-300">
        <DashboardTopbar user={session.user} />
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
