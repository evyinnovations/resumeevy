import Stripe from "stripe";

// Lazy-initialize to avoid errors when STRIPE_SECRET_KEY is absent at build time
let _stripe: Stripe | null = null;
export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2025-02-24.acacia",
      typescript: true,
    });
  }
  return _stripe;
}

// Convenience alias used by webhook/billing routes
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return getStripe()[prop as keyof Stripe];
  },
});

// ─── Plans ────────────────────────────────────────────────────────────────────
// Monthly  → $19/mo  — 3-day free trial  (recurring)
// Yearly   → $95/yr  — 7-day free trial  (recurring, $7.91/mo — save 58%)
// Lifetime → $149    — no trial          (one-time payment)
//
// AI cost per heavy user: ~$0.09/month  →  99%+ gross margin at these prices

export const PLANS = {
  FREE: {
    name: "Free",
    price: 0,
    displayPrice: "$0",
    period: null,
    trial: null,
    priceId: null,
    badge: null,
    description: "Get started for free",
    features: [
      "3 resume tailors / month",
      "1 resume profile",
      "5 basic templates",
      "PDF export",
      "ATS score check",
    ],
    limits: { tailorJobs: 3, resumes: 1, downloads: 5, templates: 5 },
  },

  MONTHLY: {
    name: "Pro Monthly",
    price: 1900,           // $19.00/month
    displayPrice: "$19",
    period: "month",
    trial: 3,              // 3-day free trial
    priceId: process.env.STRIPE_PRICE_MONTHLY,
    badge: "3-Day Free Trial",
    description: "Full access · cancel anytime",
    features: [
      "3-day free trial — card charged after trial",
      "Unlimited AI resume tailoring",
      "Unlimited resume profiles",
      "All templates (PDF & Word export)",
      "ATS score + gap analysis",
      "Cover letter generator",
      "Interview question prep",
      "Priority support",
    ],
    limits: { tailorJobs: -1, resumes: -1, downloads: -1, templates: -1 },
  },

  YEARLY: {
    name: "Pro Yearly",
    price: 9500,           // $95.00/year  ($7.91/mo — save 58%)
    displayPrice: "$95",
    period: "year",
    trial: 7,              // 7-day free trial
    priceId: process.env.STRIPE_PRICE_YEARLY,
    badge: "Best Value — Save 58%",
    description: "$7.91/month · billed annually",
    features: [
      "7-day free trial — card charged after trial",
      "Everything in Monthly",
      "AI resume generator (from scratch)",
      "ATS platform simulation (Workday, Greenhouse…)",
      "Early access to new features",
    ],
    limits: { tailorJobs: -1, resumes: -1, downloads: -1, templates: -1 },
  },

  LIFETIME: {
    name: "Lifetime",
    price: 19900,          // $199.00  (one-time)
    displayPrice: "$199",
    period: null,
    trial: null,
    priceId: process.env.STRIPE_PRICE_LIFETIME,
    badge: "One-Time Payment",
    description: "Pay once · use forever",
    features: [
      "Everything in Yearly",
      "Lifetime access — zero renewals",
      "All future templates included",
      "Priority feature requests",
      "Dedicated support",
    ],
    limits: { tailorJobs: -1, resumes: -1, downloads: -1, templates: -1 },
  },
} as const;

export type PlanKey = keyof typeof PLANS;

// ─── Helpers ──────────────────────────────────────────────────────────────────

export async function createOrRetrieveCustomer(
  userId: string,
  email: string,
  name?: string
): Promise<string> {
  const { prisma } = await import("@/lib/prisma");

  const subscription = await prisma.subscription.findUnique({ where: { userId } });

  if (subscription?.stripeCustomerId && !subscription.stripeCustomerId.startsWith("free_")) {
    return subscription.stripeCustomerId;
  }

  const customer = await stripe.customers.create({
    email,
    name: name || undefined,
    metadata: { userId },
  });

  await prisma.subscription.upsert({
    where: { userId },
    update: { stripeCustomerId: customer.id },
    create: { userId, stripeCustomerId: customer.id, plan: "FREE", status: "ACTIVE" },
  });

  return customer.id;
}

export async function createCheckoutSession(
  customerId: string,
  priceId: string,
  planKey: PlanKey,
  userId: string,
  successUrl: string,
  cancelUrl: string,
  promotionCodeId?: string | null
): Promise<string> {
  const plan = PLANS[planKey];
  const isLifetime = planKey === "LIFETIME";
  const trialDays = "trial" in plan ? plan.trial : null;

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    mode: isLifetime ? "payment" : "subscription",
    ...((!isLifetime && trialDays) ? {
      subscription_data: {
        trial_period_days: trialDays,
        metadata: { userId },
      },
    } : {}),
    // If a promo code was pre-validated, apply it directly.
    // Otherwise show the promo code field on Stripe's checkout page.
    ...(promotionCodeId
      ? { discounts: [{ promotion_code: promotionCodeId }] }
      : { allow_promotion_codes: true }
    ),
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { userId },
    billing_address_collection: "auto",
    payment_method_collection: "always",
  });

  return session.url!;
}

export async function createPortalSession(
  customerId: string,
  returnUrl: string
): Promise<string> {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
  return session.url;
}

export function getPlanFromPriceId(priceId: string): PlanKey {
  if (priceId === process.env.STRIPE_PRICE_MONTHLY)  return "MONTHLY";
  if (priceId === process.env.STRIPE_PRICE_YEARLY)   return "YEARLY";
  if (priceId === process.env.STRIPE_PRICE_LIFETIME) return "LIFETIME";
  return "FREE";
}

export function isActivePlan(plan: string, status: string): boolean {
  if (plan === "FREE") return false;
  return ["ACTIVE", "TRIALING"].includes(status.toUpperCase());
}
