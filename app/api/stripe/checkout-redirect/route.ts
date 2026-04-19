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
    const planParam = req.nextUrl.searchParams.get("plan");
    const back = planParam ? `/register?plan=${planParam}` : "/register";
    return NextResponse.redirect(new URL(`/login?callbackUrl=${encodeURIComponent(back)}`, req.url));
  }

  const planParam = req.nextUrl.searchParams.get("plan");
  const planKey = planParam ? PLAN_MAP[planParam.toLowerCase()] : null;

  if (!planKey) {
    return NextResponse.redirect(new URL("/billing?error=invalid-plan", req.url));
  }

  const priceId = PLANS[planKey]?.priceId;
  if (!priceId) {
    console.error(`[checkout-redirect] No priceId for plan ${planKey}. Check STRIPE_PRICE_${planKey} env var.`);
    return NextResponse.redirect(new URL(`/billing?error=no-price-${planKey.toLowerCase()}`, req.url));
  }

  try {
    const customerId = await createOrRetrieveCustomer(
      session.user.id,
      session.user.email,
      session.user.name || undefined
    );

    const promoId = req.nextUrl.searchParams.get("promoId") || null;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const url = await createCheckoutSession(
      customerId,
      priceId,
      planKey,
      session.user.id,
      `${appUrl}/dashboard`,
      `${appUrl}/billing`,
      promoId,
    );

    return NextResponse.redirect(url);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[checkout-redirect] Stripe error for plan ${planKey}:`, msg);
    return NextResponse.redirect(new URL(`/billing?error=${encodeURIComponent(msg)}`, req.url));
  }
}
