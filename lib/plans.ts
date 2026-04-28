// Client-safe plan display data — no stripe import, no Node.js deps
import { Calendar, CalendarDays, Crown, Zap } from "lucide-react";

export const PLAN_DISPLAY = {
  FREE: {
    name: "Free",
    displayPrice: "$0",
    period: null,
    trial: null,
    badge: null,
    description: "Get started for free",
    features: ["3 resume tailors / month", "1 resume profile", "5 basic templates", "PDF export", "ATS score check"],
    icon: Zap,
    color: "border-slate-200",
    gradient: "from-slate-400 to-slate-500",
  },
  MONTHLY: {
    name: "Pro Monthly",
    displayPrice: "$20",
    period: "month",
    trial: 3,
    badge: "25% Off · First 3 Months",
    description: "Full access · cancel anytime",
    features: [
      "25% off first 3 months — only $15/mo",
      "3-day free trial — card charged after trial",
      "Unlimited AI resume tailoring",
      "Unlimited resume profiles",
      "All templates (PDF & Word export)",
      "ATS score + gap analysis",
      "Cover letter generator",
      "Interview question prep",
      "Priority support",
    ],
    icon: Calendar,
    color: "border-brand-200",
    gradient: "from-brand-600 to-brand-500",
  },
  YEARLY: {
    name: "Pro Yearly",
    displayPrice: "$95",
    period: "year",
    trial: 7,
    badge: "Best Value — Save 58%",
    description: "$7.91/month · billed annually",
    features: [
      "7-day free trial — card charged after trial",
      "Everything in Monthly",
      "AI resume generator (from scratch)",
      "ATS platform simulation (Workday, Greenhouse…)",
      "Early access to new features",
    ],
    icon: CalendarDays,
    color: "border-violet-300",
    gradient: "from-violet-600 to-brand-500",
  },
  LIFETIME: {
    name: "Lifetime",
    displayPrice: "$199",
    period: null,
    trial: null,
    badge: "One-Time Payment",
    description: "Pay once · use forever",
    features: [
      "Everything in Yearly",
      "Lifetime access — zero renewals",
      "All future templates included",
      "Priority feature requests",
      "Dedicated support",
    ],
    icon: Crown,
    color: "border-yellow-300",
    gradient: "from-yellow-500 to-orange-500",
  },
} as const;

export type PlanKey = keyof typeof PLAN_DISPLAY;
export const PLAN_ORDER: PlanKey[] = ["FREE", "MONTHLY", "YEARLY", "LIFETIME"];
