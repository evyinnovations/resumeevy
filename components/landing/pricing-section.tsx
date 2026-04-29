"use client";

import { motion } from "framer-motion";
import { Check, Calendar, CalendarDays, Crown, ArrowRight, Shield, Gift } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    name: "Pro Monthly",
    displayPrice: "$20",
    period: "/ month",
    trial: "3-day free trial",
    badge: "25% Off · First 3 Months",
    description: "$15/mo for first 3 months · cancel anytime",
    icon: Calendar,
    highlight: false,
    cta: "Start Free Trial",
    href: "/register?plan=monthly",
    features: [
      "Use code START25 — 25% off first 3 months ($15/mo)",
      "3-day free trial — no charge yet",
      "Unlimited AI resume tailoring",
      "Unlimited resume profiles",
      "All templates (PDF & Word export)",
      "ATS score + gap analysis",
      "Cover letter generator",
      "Interview question prep",
      "Priority support",
    ],
    missing: [],
  },
  {
    name: "Pro Yearly",
    displayPrice: "$95",
    period: "/ year",
    trial: "7-day free trial",
    badge: "Best Value — Save 58%",
    description: "$7.91/month · billed annually",
    icon: CalendarDays,
    highlight: true,
    cta: "Start Free Trial",
    href: "/register?plan=yearly",
    features: [
      "7-day free trial — no charge yet",
      "Everything in Monthly",
      "AI resume generator (from scratch)",
      "ATS platform simulation",
      "Early access to new features",
    ],
    missing: [],
  },
  {
    name: "Lifetime",
    displayPrice: "$199",
    period: "one-time",
    trial: null,
    badge: "One-Time Payment",
    description: "Pay once · use forever",
    icon: Crown,
    highlight: false,
    cta: "Get Lifetime Access",
    href: "/register?plan=lifetime",
    features: [
      "Everything in Yearly",
      "Lifetime access — zero renewals",
      "All future templates included",
      "Priority feature requests",
      "Dedicated support",
    ],
    missing: [],
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="bg-[#EDEDFC] border-t border-[#D8D8F0]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-28">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="h-px w-8 bg-[#1A28C1]" />
            <span className="text-[#1A28C1] text-xs font-semibold tracking-[0.2em] uppercase">Transparent pricing</span>
          </div>
          <div className="grid lg:grid-cols-[1fr_auto] gap-8 items-end">
            <h2
              className="font-black leading-[1.0] tracking-[-0.03em] text-[#0F1235]"
              style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(2.5rem, 5vw, 4rem)" }}
            >
              Pay what you see.
              <br />
              <span style={{
                background: "linear-gradient(135deg, #4D5EDB, #1A28C1)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>Nothing more.</span>
            </h2>
            <p className="text-slate-500 text-base leading-relaxed max-w-xs">
              No bait-and-switch. No buried auto-renewals.
              Cancel from your dashboard anytime.
            </p>
          </div>
        </motion.div>

        {/* Pricing cards */}
        <div className="grid sm:grid-cols-3 gap-6 items-start">
          {plans.map((plan, i) => {
            const Icon = plan.icon;
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className={`relative rounded-2xl p-6 border ${
                  plan.highlight
                    ? "bg-[#1A28C1]/5 border-[#1A28C1]/30 scale-[1.02] shadow-xl shadow-[#1A28C1]/8"
                    : "bg-white border-[#C5C5E8] shadow-[0_4px_20px_rgba(26,40,193,0.05)]"
                }`}
              >
                {plan.badge && (
                  <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide whitespace-nowrap ${
                    plan.highlight
                      ? "bg-[#1A28C1] text-white"
                      : plan.name === "Lifetime"
                        ? "bg-white text-amber-600 border border-amber-300"
                        : "bg-white text-emerald-600 border border-emerald-300"
                  }`}>
                    {plan.badge}
                  </div>
                )}

                <div className="flex items-center gap-3 mb-5 mt-1">
                  <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${
                    plan.highlight ? "bg-[#1A28C1]/12 border-[#1A28C1]/25" : "bg-[#F0F0FB] border-[#D8D8F0]"
                  }`}>
                    <Icon className={`w-4 h-4 ${plan.highlight ? "text-[#1A28C1]" : "text-slate-400"}`} />
                  </div>
                  <div>
                    <div className={`font-bold text-sm ${plan.highlight ? "text-[#1A28C1]" : "text-slate-700"}`}>{plan.name}</div>
                    <div className="text-xs text-slate-400">{plan.description}</div>
                  </div>
                </div>

                <div className="mb-5">
                  <div className="flex items-end gap-1">
                    <span
                      className={`text-4xl font-black ${plan.highlight ? "text-[#0F1235]" : "text-slate-700"}`}
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      {plan.displayPrice}
                    </span>
                    {plan.period && <span className="mb-1.5 text-xs text-slate-400">{plan.period}</span>}
                  </div>
                  {plan.trial && (
                    <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium mt-1">
                      <Gift className="w-3 h-3" /> {plan.trial} included
                    </div>
                  )}
                  {plan.displayPrice === "$0" && (
                    <div className="text-[11px] text-emerald-600 mt-1 font-medium">No credit card required</div>
                  )}
                </div>

                <Link
                  href={plan.href}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 mb-6 cursor-pointer ${
                    plan.highlight
                      ? "bg-[#1A28C1] hover:bg-[#1520A0] text-white shadow-lg shadow-[#1A28C1]/20"
                      : "border border-[#C5C5E8] hover:border-[#1A28C1]/30 text-slate-500 hover:text-[#1A28C1]"
                  }`}
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {plan.cta}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <div className="space-y-2">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-2">
                      <Check className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${plan.highlight ? "text-[#1A28C1]" : "text-emerald-500"}`} />
                      <span className={`text-xs ${plan.highlight ? "text-slate-700" : "text-slate-500"}`}>{feature}</span>
                    </div>
                  ))}
                  {plan.missing?.map((feature) => (
                    <div key={feature} className="flex items-start gap-2 opacity-30">
                      <Check className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-slate-400" />
                      <span className="text-xs text-slate-400 line-through">{feature}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-10"
        >
          <div className="inline-flex items-center gap-2 text-slate-400 text-xs">
            <Shield className="w-3.5 h-3.5 text-[#10B981]" />
            14-day money-back guarantee on all paid plans · No questions asked
          </div>
        </motion.div>
      </div>
    </section>
  );
}
