"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, CheckCircle } from "lucide-react";

export function CTASection() {
  return (
    <section className="relative bg-[#F5F5FE] border-t border-[#D8D8F0] overflow-hidden">
      {/* Gradient orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#1A28C1]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-[#4D5EDB]/4 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-28 relative">
        <div className="grid lg:grid-cols-[1fr_auto] gap-16 items-center">

          {/* Copy */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              <span className="text-slate-500 text-xs font-medium tracking-[0.2em] uppercase">10,000+ hired · card required · auto-charged after trial</span>
            </div>

            <h2
              className="font-black leading-[1.0] tracking-[-0.03em] text-[#0F1235] mb-6"
              style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(2.8rem, 6vw, 5rem)" }}
            >
              Your resume isn&apos;t the problem.
              <br />
              <span style={{
                background: "linear-gradient(135deg, #4D5EDB 0%, #1A28C1 60%, #2D3DD0 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>The version you submitted is.</span>
            </h2>

            <p className="text-slate-500 text-lg leading-relaxed mb-10 max-w-[520px]">
              Every job you&apos;ve applied to had a slightly different set of requirements.
              Every one deserved a slightly different resume. You didn&apos;t have the tools.
              Now you do.
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
              <Link
                href="/register"
                className="group inline-flex items-center gap-2.5 px-8 py-4 bg-[#1A28C1] hover:bg-[#1520A0] text-white font-semibold text-base rounded-xl transition-all duration-200 shadow-xl shadow-[#1A28C1]/20 cursor-pointer"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Start Free Trial
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <a
                href="#pricing"
                className="text-slate-500 hover:text-[#1A28C1] text-sm font-medium transition-colors cursor-pointer"
              >
                View pricing →
              </a>
            </div>

            <div className="flex flex-wrap gap-5">
              {["3 free AI tailors", "Full PDF download", "No deceptive billing"].map((t) => (
                <div key={t} className="flex items-center gap-2 text-sm text-slate-500">
                  <CheckCircle className="w-3.5 h-3.5 text-[#10B981] flex-shrink-0" />
                  {t}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Stats block */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="hidden lg:flex flex-col gap-6"
          >
            {[
              { value: "+47%", label: "avg ATS score boost" },
              { value: "3.2×", label: "more interview callbacks" },
              { value: "8s", label: "to fully tailor a resume" },
              { value: "10K+", label: "job seekers hired" },
            ].map(({ value, label }) => (
              <div key={label} className="flex items-center gap-5">
                <div className="w-px h-12 flex-shrink-0 bg-[#1A28C1]/25" />
                <div>
                  <div
                    className="text-3xl font-black leading-none"
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      background: "linear-gradient(135deg, #4D5EDB, #1A28C1)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >{value}</div>
                  <div className="text-xs text-slate-400 mt-1">{label}</div>
                </div>
              </div>
            ))}
          </motion.div>

        </div>
      </div>
    </section>
  );
}
