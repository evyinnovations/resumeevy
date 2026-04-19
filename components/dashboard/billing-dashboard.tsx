"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard, Check, Zap, Calendar, CalendarDays, Crown,
  ArrowRight, ExternalLink, Loader2, Gift, Sparkles,
  Tag, X, CheckCircle2,
} from "lucide-react";
import { PLANS } from "@/lib/stripe";
import { formatDate } from "@/lib/utils";
import { toast } from "@/components/ui/toaster";

interface BillingProps {
  subscription: {
    plan: string;
    status: string;
    currentPeriodEnd?: Date | null;
    cancelAtPeriodEnd?: boolean;
    stripeCustomerId?: string;
  } | null;
  user: { id: string; name?: string | null; email?: string | null };
  successParam?: boolean;
  canceledParam?: boolean;
}

const PLAN_META = {
  FREE:     { icon: Zap,         color: "border-slate-200",  gradient: "from-slate-400 to-slate-500" },
  MONTHLY:  { icon: Calendar,    color: "border-brand-200",  gradient: "from-brand-600 to-brand-500" },
  YEARLY:   { icon: CalendarDays,color: "border-violet-300", gradient: "from-violet-600 to-brand-500" },
  LIFETIME: { icon: Crown,       color: "border-yellow-300", gradient: "from-yellow-500 to-orange-500" },
} as const;

export function BillingDashboard({ subscription, user, successParam, canceledParam }: BillingProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [promoCode, setPromoCode] = useState("");
  const [promoOpen, setPromoOpen] = useState(false);
  const [promoState, setPromoState] = useState<"idle" | "checking" | "valid" | "invalid">("idle");
  const [promoData, setPromoData] = useState<{ id: string; discount: string } | null>(null);

  const currentPlan = (subscription?.plan || "FREE") as keyof typeof PLANS;
  const isTrialing = subscription?.status?.toUpperCase() === "TRIALING";

  useEffect(() => {
    if (successParam) {
      toast.success("Payment successful! Your plan is now active.");
      window.history.replaceState({}, "", "/billing");
    } else if (canceledParam) {
      toast.error("Payment canceled. No charge was made.");
      window.history.replaceState({}, "", "/billing");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkPromoCode = async () => {
    if (!promoCode.trim()) return;
    setPromoState("checking");
    try {
      const res = await fetch("/api/stripe/promo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoCode.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.valid) {
        setPromoState("invalid");
        setPromoData(null);
      } else {
        setPromoState("valid");
        setPromoData({ id: data.promotionCodeId, discount: data.discount });
        toast.success(`Promo code applied — ${data.discount} off!`);
      }
    } catch {
      setPromoState("invalid");
      setPromoData(null);
    }
  };

  const clearPromo = () => {
    setPromoCode("");
    setPromoState("idle");
    setPromoData(null);
    setPromoOpen(false);
  };

  const handleUpgrade = async (planKey: string) => {
    setLoading(planKey);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planKey,
          promotionCodeId: promoData?.id ?? null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (data.url) window.location.href = data.url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to start checkout");
    } finally {
      setLoading(null);
    }
  };

  const handlePortal = async () => {
    setLoading("portal");
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (data.url) window.location.href = data.url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to open portal");
    } finally {
      setLoading(null);
    }
  };

  const planOrder: (keyof typeof PLANS)[] = ["FREE", "MONTHLY", "YEARLY", "LIFETIME"];
  const currentIdx = planOrder.indexOf(currentPlan);

  const paidPlans = (["MONTHLY", "YEARLY", "LIFETIME"] as const).map((key) => ({
    key,
    ...PLANS[key],
    ...PLAN_META[key],
  }));

  const CurrentIcon = PLAN_META[currentPlan]?.icon ?? Zap;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-700 to-brand-500 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-white" />
          </div>
          Billing & Plans
        </h1>
        <p className="text-slate-500 mt-1 ml-14 text-sm">Manage your subscription and payment details</p>
      </div>

      {/* Current plan card — only shown when on a paid plan */}
      {currentPlan !== "FREE" && <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl p-6 border border-slate-200"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${PLAN_META[currentPlan]?.gradient} flex items-center justify-center`}>
              <CurrentIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-bold text-slate-900 text-lg">{PLANS[currentPlan]?.name ?? "Free"} Plan</div>
              <div className="flex items-center gap-2 mt-0.5">
                {isTrialing ? (
                  <span className="text-xs bg-yellow-50 text-yellow-700 border border-yellow-200 px-2 py-0.5 rounded-full font-medium">
                    Free Trial Active
                  </span>
                ) : subscription?.status?.toUpperCase() === "ACTIVE" ? (
                  <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
                    Active
                  </span>
                ) : (
                  <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-medium">
                    {subscription?.status || "Free"}
                  </span>
                )}
                {subscription?.currentPeriodEnd && (
                  <span className="text-xs text-slate-400">
                    {subscription.cancelAtPeriodEnd ? "Cancels" : isTrialing ? "Trial ends" : "Renews"}{" "}
                    {formatDate(subscription.currentPeriodEnd)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {currentPlan !== "FREE" && (
            <button
              onClick={handlePortal}
              disabled={loading === "portal"}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-sm font-medium rounded-xl transition-all cursor-pointer disabled:opacity-50"
            >
              {loading === "portal" ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
              Manage Billing
            </button>
          )}
        </div>

        <div className="mt-5 pt-5 border-t border-slate-100 grid sm:grid-cols-2 gap-2">
          {PLANS[currentPlan]?.features.map((f) => (
            <div key={f} className="flex items-center gap-2 text-sm text-slate-600">
              <Check className="w-4 h-4 text-emerald-500 shrink-0" /> {f}
            </div>
          ))}
        </div>
      </motion.div>}

      {/* Pricing plans */}
      {currentPlan !== "LIFETIME" && (
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-2">Choose a plan</h2>
          <p className="text-sm text-slate-500 mb-4">All paid plans include a free trial — card required upfront, charged automatically after trial ends</p>

          {/* ── Promo code ────────────────────────────────────────────────────── */}
          <div className="mb-6">
            {!promoOpen && promoState !== "valid" && (
              <button
                onClick={() => setPromoOpen(true)}
                className="flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-700 font-medium transition-colors cursor-pointer"
              >
                <Tag className="w-3.5 h-3.5" /> Have a promo code?
              </button>
            )}

            <AnimatePresence>
              {(promoOpen || promoState === "valid") && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center gap-2 mt-1">
                    <div className="relative flex-1 max-w-xs">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        value={promoCode}
                        onChange={(e) => {
                          setPromoCode(e.target.value.toUpperCase());
                          if (promoState !== "idle") setPromoState("idle");
                          setPromoData(null);
                        }}
                        onKeyDown={(e) => e.key === "Enter" && checkPromoCode()}
                        placeholder="PROMO CODE"
                        disabled={promoState === "valid"}
                        className={`w-full pl-9 pr-3 py-2.5 border rounded-xl text-sm font-mono uppercase tracking-widest focus:outline-none focus:ring-2 transition-all ${
                          promoState === "valid"
                            ? "border-emerald-300 bg-emerald-50 text-emerald-700 focus:ring-emerald-200"
                            : promoState === "invalid"
                            ? "border-red-300 bg-red-50 text-red-700 focus:ring-red-200"
                            : "border-slate-200 bg-white text-slate-900 focus:ring-brand-200 focus:border-brand-400"
                        }`}
                      />
                    </div>

                    {promoState === "valid" ? (
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-semibold">
                          <CheckCircle2 className="w-4 h-4" /> {promoData?.discount} off
                        </span>
                        <button onClick={clearPromo} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={checkPromoCode}
                          disabled={!promoCode.trim() || promoState === "checking"}
                          className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl transition-all cursor-pointer disabled:opacity-40"
                        >
                          {promoState === "checking" ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
                        </button>
                        <button onClick={clearPromo} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>

                  {promoState === "invalid" && (
                    <p className="text-xs text-red-500 mt-1.5 ml-1">Invalid or expired promo code.</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {paidPlans.map(({ key, name, displayPrice, period, trial, badge, description, features, gradient, color }, i) => {
              const isCurrent = currentPlan === key;
              const isUpgrade = planOrder.indexOf(key) > currentIdx;
              const isYearly = key === "YEARLY";

              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`relative glass-card rounded-2xl p-6 border-2 ${
                    isYearly ? "border-violet-300 shadow-lg" : color
                  } ${isCurrent ? "opacity-70" : ""}`}
                >
                  {badge && (
                    <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${gradient} whitespace-nowrap`}>
                      {badge}
                    </div>
                  )}

                  <div className="flex items-center gap-2 mb-4 mt-1">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                      {key === "MONTHLY" && <Calendar className="w-4 h-4 text-white" />}
                      {key === "YEARLY"  && <Sparkles className="w-4 h-4 text-white" />}
                      {key === "LIFETIME"&& <Crown className="w-4 h-4 text-white" />}
                    </div>
                    <span className="font-bold text-slate-900">{name}</span>
                    {isCurrent && (
                      <span className="ml-auto text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full">Current</span>
                    )}
                  </div>

                  <div className="mb-1">
                    <span className="text-4xl font-black text-slate-900">{displayPrice}</span>
                    {period && <span className="text-slate-400 text-sm ml-1">/ {period}</span>}
                  </div>
                  {promoState === "valid" && promoData && (
                    <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium mt-0.5">
                      <Tag className="w-3 h-3" /> {promoData.discount} promo applied
                    </div>
                  )}
                  <p className="text-xs text-slate-500 mb-1 mt-1">{description}</p>
                  {trial && (
                    <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium mb-4">
                      <Gift className="w-3.5 h-3.5" /> {trial}-day free trial included
                    </div>
                  )}

                  <ul className="space-y-2 mb-6 mt-3">
                    {features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /> {f}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleUpgrade(key)}
                    disabled={isCurrent || loading === key || !isUpgrade}
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                      isYearly || key === "LIFETIME"
                        ? "bg-gradient-to-r from-brand-700 to-brand-500 text-white hover:shadow-glow-sm"
                        : "bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700"
                    }`}
                  >
                    {loading === key ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : isCurrent ? "Current Plan" : (
                      <>
                        {trial ? "Start Free Trial" : `Get ${name}`}
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      <div className="text-center text-slate-400 text-sm">
        <Check className="w-4 h-4 text-emerald-500 inline mr-1" />
        14-day money-back guarantee · Cancel anytime · Secure payment via Stripe
      </div>
    </div>
  );
}
