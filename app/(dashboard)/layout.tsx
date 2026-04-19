import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardTopbar } from "@/components/dashboard/topbar";
import prisma from "@/lib/prisma";
import { stripe, getPlanFromPriceId } from "@/lib/stripe";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = (session.user as { id: string }).id;
  const role = (session.user as { role?: string }).role;

  let subscription = await prisma.subscription.findUnique({ where: { userId } });

  const isActivePlan = (s: typeof subscription) =>
    s && s.plan !== "FREE" && ["ACTIVE", "TRIALING"].includes(s.status);

  // Webhook fallback: if DB shows no active plan but user has a real Stripe
  // customer, verify directly with Stripe and sync the DB.
  if (!isActivePlan(subscription) && role !== "ADMIN") {
    const customerId = subscription?.stripeCustomerId;
    if (customerId && !customerId.startsWith("free_")) {
      try {
        const subs = await stripe.subscriptions.list({
          customer: customerId,
          status: "all",
          limit: 5,
        });
        const active = subs.data.find((s) =>
          ["active", "trialing"].includes(s.status)
        );
        if (active) {
          const priceId = active.items.data[0]?.price?.id;
          const plan = priceId ? getPlanFromPriceId(priceId) : "MONTHLY";
          subscription = await prisma.subscription.update({
            where: { userId },
            data: {
              plan,
              status: active.status.toUpperCase(),
              stripeSubscriptionId: active.id,
              currentPeriodStart: new Date(active.current_period_start * 1000),
              currentPeriodEnd: new Date(active.current_period_end * 1000),
              cancelAtPeriodEnd: active.cancel_at_period_end,
              trialEnd: active.trial_end ? new Date(active.trial_end * 1000) : null,
            },
          });
        }
      } catch {
        // Stripe unavailable — fall through to billing redirect
      }
    }
  }

  if (!isActivePlan(subscription) && role !== "ADMIN") redirect("/billing");

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <DashboardSidebar role={role} />
      <div className="flex-1 flex flex-col ml-0 lg:ml-64 transition-all duration-300">
        <DashboardTopbar user={session.user} />
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
