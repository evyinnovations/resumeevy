import { NextRequest, NextResponse } from "next/server";
import { stripe, getPlanFromPriceId } from "@/lib/stripe";
import prisma from "@/lib/prisma";
import type Stripe from "stripe";
import { sendSubscriptionConfirmEmail } from "@/lib/email";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret?.trim()) {
    console.error("STRIPE_WEBHOOK_SECRET is not configured");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        if (!userId) break;

        // Expand line_items to get the price — not included in webhook payload by default
        let plan: ReturnType<typeof getPlanFromPriceId> = "MONTHLY";
        try {
          const expanded = await stripe.checkout.sessions.retrieve(session.id, {
            expand: ["line_items"],
          });
          const priceId = expanded.line_items?.data[0]?.price?.id;
          if (priceId) plan = getPlanFromPriceId(priceId);
        } catch {
          // fall back to MONTHLY if retrieval fails
        }

        // Determine initial status — if subscription is in trial, set TRIALING
        // customer.subscription.updated will also fire and correct the status
        let checkoutStatus = "ACTIVE";
        if (session.subscription) {
          try {
            const stripeSub = await stripe.subscriptions.retrieve(session.subscription as string);
            checkoutStatus = stripeSub.status.toUpperCase();
          } catch {
            // fall back to ACTIVE
          }
        }

        await prisma.subscription.upsert({
          where: { userId },
          update: {
            stripeSubscriptionId: session.subscription as string || null,
            plan,
            status: checkoutStatus,
            stripeCustomerId: session.customer as string,
          },
          create: {
            userId,
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string || null,
            plan,
            status: checkoutStatus,
          },
        });

        // Send confirmation email
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (user?.email) {
          sendSubscriptionConfirmEmail(user.email, user.name || "User", plan).catch(console.error);
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const sub = await prisma.subscription.findUnique({ where: { stripeCustomerId: customerId } });
        if (!sub) break;

        const priceId = subscription.items.data[0]?.price?.id;
        const plan = priceId ? getPlanFromPriceId(priceId) : sub.plan;

        await prisma.subscription.update({
          where: { stripeCustomerId: customerId },
          data: {
            plan,
            status: subscription.status.toUpperCase(),
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
          },
        });
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        await prisma.subscription.updateMany({
          where: { stripeCustomerId: customerId },
          data: { status: "CANCELED", plan: "FREE" },
        });
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        await prisma.subscription.updateMany({
          where: { stripeCustomerId: customerId },
          data: { status: "PAST_DUE" },
        });
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
