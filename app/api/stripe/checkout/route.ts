import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createOrRetrieveCustomer, createCheckoutSession, PLANS, type PlanKey } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { planKey, promotionCodeId } = await req.json();
    if (!planKey) {
      return NextResponse.json({ error: "Plan key required" }, { status: 400 });
    }

    const plan = PLANS[planKey as PlanKey];
    if (!plan) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const priceId = plan.priceId;
    if (!priceId) {
      return NextResponse.json({ error: "Plan has no price configured" }, { status: 400 });
    }

    const customerId = await createOrRetrieveCustomer(
      session.user.id,
      session.user.email,
      session.user.name || undefined
    );

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const url = await createCheckoutSession(
      customerId,
      priceId,
      planKey as PlanKey,
      session.user.id,
      `${appUrl}/dashboard`,
      `${appUrl}/billing`,
      promotionCodeId || null
    );

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Checkout error:", error);
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: `Failed to create checkout: ${msg}` }, { status: 500 });
  }
}
