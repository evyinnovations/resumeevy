import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { AdminDashboard } from "@/components/admin/admin-dashboard";

const PLAN_PRICES: Record<string, number> = {
  MONTHLY: 20,
  SIX_MONTH: 14,
  YEARLY: 9,
  LIFETIME: 199,
};

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalUsers,
    totalResumes,
    totalTailor,
    allActiveSubs,
    newUsersThisMonth,
    recentUsers,
    recentResumes,
    allUsers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.resume.count(),
    prisma.tailorJob.count(),
    prisma.subscription.findMany({
      where: { plan: { not: "FREE" }, status: { in: ["ACTIVE", "TRIALING"] } },
      select: { plan: true, status: true, createdAt: true },
    }),
    prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        role: true,
        subscription: { select: { plan: true, status: true } },
      },
    }),
    prisma.resume.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        title: true,
        userId: true,
        atsScore: true,
        createdAt: true,
        user: { select: { name: true, email: true } },
      },
    }),
    // All users from last 6 months for chart
    prisma.user.findMany({
      where: {
        createdAt: {
          gte: new Date(now.getFullYear(), now.getMonth() - 5, 1),
        },
      },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  // Build monthly signups chart from raw user data
  const monthMap: Record<string, number> = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toLocaleString("en-US", { month: "short" });
    monthMap[key] = 0;
  }
  for (const user of allUsers) {
    const key = new Date(user.createdAt).toLocaleString("en-US", { month: "short" });
    if (key in monthMap) monthMap[key]++;
  }
  const chartData = Object.entries(monthMap).map(([month, users]) => ({ month, users }));

  // Plan breakdown
  const planBreakdown = allActiveSubs.reduce<Record<string, number>>((acc, sub) => {
    acc[sub.plan] = (acc[sub.plan] || 0) + 1;
    return acc;
  }, {});

  // MRR (exclude lifetime)
  const mrr = allActiveSubs.reduce((total, sub) => {
    if (sub.plan === "LIFETIME") return total;
    return total + (PLAN_PRICES[sub.plan] || 0);
  }, 0);

  const lifetimeRevenue = (planBreakdown["LIFETIME"] || 0) * PLAN_PRICES.LIFETIME;

  const newSubsThisMonth = allActiveSubs.filter(
    (s) => new Date(s.createdAt) >= startOfMonth
  ).length;

  const revenueThisMonth = allActiveSubs
    .filter((s) => new Date(s.createdAt) >= startOfMonth)
    .reduce((total, sub) => total + (PLAN_PRICES[sub.plan] || 0), 0);

  return (
    <AdminDashboard
      stats={{
        totalUsers,
        totalResumes,
        totalTailor,
        paidSubs: allActiveSubs.length,
        newUsersThisMonth,
        newSubsThisMonth,
        mrr,
        lifetimeRevenue,
        revenueThisMonth,
        planBreakdown,
      }}
      recentUsers={recentUsers.map((u) => ({
        ...u,
        createdAt: u.createdAt.toISOString(),
      }))}
      recentResumes={recentResumes.map((r) => ({
        ...r,
        createdAt: r.createdAt.toISOString(),
      }))}
      chartData={chartData}
    />
  );
}
