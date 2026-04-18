import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { z } from "zod";

const schema = z.object({ code: z.string().min(1).max(50) });

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid code" }, { status: 400 });

  try {
    const results = await stripe.promotionCodes.list({
      code: parsed.data.code,
      active: true,
      limit: 1,
    });

    const promoCode = results.data[0];
    if (!promoCode) {
      return NextResponse.json({ valid: false });
    }

    const coupon = promoCode.coupon;

    // Build human-readable discount string
    let discount = "";
    if (coupon.percent_off) {
      discount = `${coupon.percent_off}%`;
    } else if (coupon.amount_off && coupon.currency) {
      discount = `$${(coupon.amount_off / 100).toFixed(0)}`;
    }

    return NextResponse.json({
      valid: true,
      promotionCodeId: promoCode.id,
      discount,
    });
  } catch (error) {
    console.error("Promo code check error:", error);
    return NextResponse.json({ valid: false });
  }
}
