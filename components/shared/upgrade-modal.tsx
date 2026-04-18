"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { X, Sparkles, Zap, CheckCircle2 } from "lucide-react";

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
}

const perks = [
  "Unlimited AI resume tailoring",
  "Unlimited resume profiles",
  "All templates + Word export",
  "ATS score + gap analysis",
  "Cover letter generator",
];

export function UpgradeModal({
  open,
  onClose,
  title = "You've hit your free plan limit",
  description = "Upgrade to Pro to keep going — unlimited resumes, unlimited tailors, all features unlocked.",
}: UpgradeModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 24 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md px-4"
          >
            <div className="bg-white rounded-3xl border border-[#C5C5E8] shadow-2xl overflow-hidden">
              {/* Top gradient bar */}
              <div className="h-1.5 w-full bg-gradient-to-r from-[#1A28C1] via-purple-500 to-[#4D5EDB]" />

              <div className="p-7">
                {/* Close */}
                <button
                  onClick={onClose}
                  className="absolute top-5 right-5 p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Icon */}
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1A28C1] to-purple-600 flex items-center justify-center mb-5 shadow-lg shadow-[#1A28C1]/20">
                  <Zap className="w-7 h-7 text-white" />
                </div>

                {/* Text */}
                <h2 className="text-xl font-extrabold text-slate-900 mb-2">{title}</h2>
                <p className="text-slate-500 text-sm leading-relaxed mb-5">{description}</p>

                {/* Perks */}
                <ul className="space-y-2 mb-6">
                  {perks.map((perk) => (
                    <li key={perk} className="flex items-center gap-2.5 text-sm text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-[#1A28C1] flex-shrink-0" />
                      {perk}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link
                  href="/billing"
                  onClick={onClose}
                  className="flex items-center justify-center gap-2 w-full py-3.5 bg-gradient-to-r from-[#1A28C1] to-purple-600 hover:from-[#1520A0] hover:to-purple-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-[#1A28C1]/20 text-sm cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  Upgrade to Pro — Start Free Trial
                </Link>

                <p className="text-center text-xs text-slate-400 mt-3">
                  Card required · auto-charged after trial ends · cancel anytime
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
