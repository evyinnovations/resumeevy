import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createOrRetrieveCustomer, createCheckoutSession, PLANS, type PlanKey } from "@/lib/stripe";

const PLAN_MAP: Record<string, PlanKey> = {
  monthly: "MONTHLY",
  yearly: "YEARLY",
  lifetime: "LIFETIME",
};

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const planParam = req.nextUrl.searchParams.get("plan");
  const planKey = planParam ? PLAN_MAP[planParam.toLowerCase()] : null;

  if (!planKey || !PLANS[planKey]?.priceId) {
    return NextResponse.redirect(new URL("/billing", req.url));
  }

  try {
    const customerId = await createOrRetrieveCustomer(
      session.user.id,
      session.user.email,
      session.user.name || undefined
    );

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const url = await createCheckoutSession(
      customerId,
      PLANS[planKey].priceId!,
      planKey,
      session.user.id,
      `${appUrl}/dashboard`,
      `${appUrl}/billing`,
    );

    return NextResponse.redirect(url);
  } catch {
    return NextResponse.redirect(new URL("/billing", req.url));
  }
}
